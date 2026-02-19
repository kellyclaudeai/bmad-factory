import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const DEFAULT_FIREBASE_PROJECT_ID = "demo-slacklite";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDUMMY_KEY_FOR_SLACKLITE_BUILD_123456",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    `${DEFAULT_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? DEFAULT_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${DEFAULT_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1234567890:web:slacklitebuild",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    `https://${DEFAULT_FIREBASE_PROJECT_ID}.firebaseio.com`,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const rtdb = getDatabase(app);

interface HostAndPort {
  host: string;
  port: number;
}

function parseHostAndPort(hostWithPort: string | undefined, fallback: HostAndPort): HostAndPort {
  if (!hostWithPort) {
    return fallback;
  }

  const normalized = hostWithPort.trim();
  const [host = "", port] = normalized.split(":");
  const parsedPort = Number(port);

  if (host.length === 0 || !Number.isInteger(parsedPort) || parsedPort <= 0) {
    return fallback;
  }

  return {
    host,
    port: parsedPort,
  };
}

function shouldUseFirebaseEmulators(): boolean {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    return true;
  }

  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST
  );
}

const globalEmulatorConnectionState = globalThis as typeof globalThis & {
  __SLACKLITE_FIREBASE_EMULATORS_CONNECTED__?: boolean;
};

if (
  shouldUseFirebaseEmulators() &&
  !globalEmulatorConnectionState.__SLACKLITE_FIREBASE_EMULATORS_CONNECTED__
) {
  const authHostAndPort = parseHostAndPort(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, {
    host: "127.0.0.1",
    port: 9099,
  });
  const firestoreHostAndPort = parseHostAndPort(
    process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
    {
      host: "127.0.0.1",
      port: 8080,
    }
  );
  const databaseHostAndPort = parseHostAndPort(
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST,
    {
      host: "127.0.0.1",
      port: 9000,
    }
  );

  connectAuthEmulator(auth, `http://${authHostAndPort.host}:${authHostAndPort.port}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, firestoreHostAndPort.host, firestoreHostAndPort.port);
  connectDatabaseEmulator(rtdb, databaseHostAndPort.host, databaseHostAndPort.port);

  globalEmulatorConnectionState.__SLACKLITE_FIREBASE_EMULATORS_CONNECTED__ = true;
}
