"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase/client";

type FirestoreUserData = Record<string, unknown>;

export type AuthUser = FirebaseUser & FirestoreUserData;

interface SignOutOptions {
  skipConfirmation?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: (options?: SignOutOptions) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mergeUser(
  firebaseUser: FirebaseUser,
  userData?: FirestoreUserData,
): AuthUser {
  return {
    ...(firebaseUser as unknown as Record<string, unknown>),
    ...(userData ?? {}),
  } as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const authListenerCleanupRef = useRef<(() => void) | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const cleanupFirebaseListeners = useCallback(() => {
    if (authListenerCleanupRef.current) {
      authListenerCleanupRef.current();
      authListenerCleanupRef.current = null;
    }
  }, []);

  const clearLocalClientState = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new Event("slacklite:clear-client-state"));
    window.localStorage.clear();
    window.sessionStorage.clear();
  }, []);

  const initializeAuthStateListener = useCallback(() => {
    cleanupFirebaseListeners();

    authListenerCleanupRef.current = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMountedRef.current) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(firestore, "users", firebaseUser.uid));
        const userData = (userSnapshot.data() as FirestoreUserData | undefined) ?? {};
        if (isMountedRef.current) {
          setUser(mergeUser(firebaseUser, userData));
        }
      } catch (error) {
        console.error("Failed to fetch user document from Firestore.", error);
        if (isMountedRef.current) {
          setUser(mergeUser(firebaseUser));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    });
  }, [cleanupFirebaseListeners]);

  const signOut = useCallback(
    async (options?: SignOutOptions) => {
      if (!options?.skipConfirmation && typeof window !== "undefined") {
        const confirmed = window.confirm("Are you sure you want to sign out?");
        if (!confirmed) {
          return;
        }
      }

      setLoading(true);

      try {
        await firebaseSignOut(auth);
        cleanupFirebaseListeners();
        clearLocalClientState();
        setUser(null);
        initializeAuthStateListener();
        router.replace("/");
      } catch (error) {
        console.error("Failed to sign out user.", error);
        throw new Error("Unable to sign out right now. Please try again.");
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cleanupFirebaseListeners, clearLocalClientState, initializeAuthStateListener, router],
  );

  useEffect(() => {
    isMountedRef.current = true;
    initializeAuthStateListener();

    return () => {
      isMountedRef.current = false;
      cleanupFirebaseListeners();
    };
  }, [cleanupFirebaseListeners, initializeAuthStateListener]);

  useEffect(() => {
    if (loading || user) {
      return;
    }

    if (pathname?.startsWith("/app")) {
      router.replace("/signin");
    }
  }, [loading, pathname, router, user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
