import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: "https://39f2c1c4c908e1ffc780145d542c258b@o4510289719263232.ingest.de.sentry.io/4510663769718864",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
