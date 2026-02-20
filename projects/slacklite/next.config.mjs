import { withSentryConfig } from "@sentry/nextjs";

const release =
  process.env.SENTRY_RELEASE ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA;

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_SENTRY_RELEASE: release ?? "",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com",
              "frame-src 'self' https://*.firebaseapp.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: process.env.NODE_ENV !== "production",
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
  release: release
    ? {
        name: release,
        create: true,
        finalize: true,
      }
    : undefined,
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
