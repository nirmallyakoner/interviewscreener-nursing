import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3c1e1baf6353016d8a2208911a593aad@o4510686632214528.ingest.us.sentry.io/4510686634180608",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable logging
  enableLogs: true,
});
