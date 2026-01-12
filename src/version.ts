// Central build version definition
// Used by both server (API routes) and client (version checking)
export const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? "dev";
