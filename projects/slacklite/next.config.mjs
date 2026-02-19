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
