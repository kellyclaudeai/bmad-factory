import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
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
