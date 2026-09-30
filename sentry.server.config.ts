import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://31deb0044075fbfd34a4875446ff8985@o910629.ingest.us.sentry.io/4510390394159104",
  tracesSampleRate: 0,
  sendDefaultPii: false,
});
