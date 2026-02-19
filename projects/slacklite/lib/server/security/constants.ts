export const SESSION_COOKIE_NAME = "firebaseToken";
export const CSRF_COOKIE_NAME = "slacklite-csrf-token";

export const CSRF_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const SESSION_TOKEN_MAX_AGE_SECONDS = 60 * 60;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
