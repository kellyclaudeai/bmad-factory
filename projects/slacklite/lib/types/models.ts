import type { Auth } from "@firebase/auth";
import type { Database } from "@firebase/database";
import type { Firestore } from "@firebase/firestore";

export interface FirebaseClientInstances {
  auth: Auth;
  firestore: Firestore;
  rtdb: Database;
}
