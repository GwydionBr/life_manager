import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
  type PowerSyncCredentials,
} from "@powersync/web";

import { Session, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export type SupabaseConnectorListener = {
  initialized: () => void;
  sessionStarted: (session: Session) => void;
};

export class SupabaseConnector
  extends BaseObserver<SupabaseConnectorListener>
  implements PowerSyncBackendConnector
{
  readonly client: SupabaseClient;
  readonly config: SupabaseConfig;

  ready: boolean;

  currentSession: Session | null;

  constructor() {
    super();
    this.config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
      powersyncUrl: import.meta.env.VITE_POWERSYNC_URL!,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    };

    this.client = createBrowserClient(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey
    );
    this.currentSession = null;
    this.ready = false;

    // Session-Änderungen überwachen und synchronisieren
    this.client.auth.onAuthStateChange((_event, session) => {
      this.updateSession(session);
    });
  }

  async init() {
    if (this.ready) {
      return;
    }

    // Erst versuchen, lokale Session zu bekommen
    const sessionResponse = await this.client.auth.getSession();

    // // Falls keine lokale Session existiert, vom Server holen
    // if (!sessionResponse.data.session) {
    //   try {
    //     const serverSession = await fetchSupabaseSession();
    //     if (serverSession) {
    //       // Server-Session im Client setzen
    //       await this.client.auth.setSession({
    //         access_token: serverSession.access_token,
    //         refresh_token: serverSession.refresh_token,
    //       });
    //       // Aktualisierte Session abrufen
    //       sessionResponse = await this.client.auth.getSession();
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch session from server:", error);
    //   }
    // }

    this.updateSession(sessionResponse.data.session);

    this.ready = true;
    this.iterateListeners((cb) => cb.initialized?.());
  }

  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();
    if (error) {
      throw error;
    }
    this.updateSession(session);
    return session;
  }

  async login(username: string, password: string) {
    const {
      data: { session },
      error,
    } = await this.client.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      throw error;
    }

    this.updateSession(session);
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw error;
    }
    this.currentSession = null;
  }

  async register(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    this.updateSession(data.session);
  }

  async signInWithGithub(redirectTo?: string) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // OAuth redirects to GitHub, so we don't update session here
    // The session will be updated in the callback route
    return data;
  }

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    // Session-Ablaufzeit für Debugging (ohne Token zu loggen)
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      console.debug("Session expires at:", expiresAt.toISOString());
    }

    return {
      endpoint: this.config.powersyncUrl,
      token: session.access_token ?? "",
    } satisfies PowerSyncCredentials;
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        lastOp = op;
        const table = this.client.from(op.table);
        let result: any;
        switch (op.op) {
          case UpdateType.PUT:
            const record = { ...op.opData, id: op.id };
            result = await table.upsert(record);
            break;
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq("id", op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq("id", op.id);
            break;
        }

        if (result.error) {
          console.error(result.error);
          result.error.message = `Could not update Supabase. Received error: ${result.error.message}`;
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (
        typeof ex.code == "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }

  updateSession(session: Session | null) {
    this.currentSession = session;
    if (!session) {
      return;
    }
    this.iterateListeners((cb) => cb.sessionStarted?.(session));
  }
}
