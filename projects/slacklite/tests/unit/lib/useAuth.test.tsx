import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  authInstance: {},
  createUserWithEmailAndPasswordMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
  setPersistenceMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  signOutMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  docMock: vi.fn(),
  firestoreInstance: {},
  getDocMock: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useRouterMock: vi.fn(),
}));

const sentryMocks = vi.hoisted(() => ({
  setUserMock: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  browserLocalPersistence: "LOCAL_PERSISTENCE",
  createUserWithEmailAndPassword: authMocks.createUserWithEmailAndPasswordMock,
  onAuthStateChanged: authMocks.onAuthStateChangedMock,
  setPersistence: authMocks.setPersistenceMock,
  signInWithEmailAndPassword: authMocks.signInWithEmailAndPasswordMock,
  signOut: authMocks.signOutMock,
}));

vi.mock("firebase/firestore", async () => {
  const actual =
    await vi.importActual<typeof import("firebase/firestore")>(
      "firebase/firestore",
    );

  return {
    ...actual,
    doc: firestoreMocks.docMock,
    getDoc: firestoreMocks.getDocMock,
  };
});

vi.mock("next/navigation", () => ({
  usePathname: navigationMocks.usePathnameMock,
  useRouter: navigationMocks.useRouterMock,
}));

vi.mock("@sentry/nextjs", () => ({
  setUser: sentryMocks.setUserMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: authMocks.authInstance,
  firestore: firestoreMocks.firestoreInstance,
}));

import { AuthProvider, useAuth } from "@/lib/hooks/useAuth";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider/useAuth", () => {
  let authStateChangedCallback:
    | ((firebaseUser: unknown) => Promise<void> | void)
    | null = null;
  let localStorageMock: {
    clear: ReturnType<typeof vi.fn>;
    getItem: ReturnType<typeof vi.fn>;
    key: ReturnType<typeof vi.fn>;
    length: number;
    removeItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };
  let sessionStorageMock: {
    clear: ReturnType<typeof vi.fn>;
    getItem: ReturnType<typeof vi.fn>;
    key: ReturnType<typeof vi.fn>;
    length: number;
    removeItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    Object.values(authMocks).forEach((mockValue) => {
      if (typeof mockValue === "function") {
        mockValue.mockReset();
      }
    });
    Object.values(firestoreMocks).forEach((mockValue) => {
      if (typeof mockValue === "function") {
        mockValue.mockReset();
      }
    });
    Object.values(navigationMocks).forEach((mockValue) => {
      if (typeof mockValue === "function") {
        mockValue.mockReset();
      }
    });
    sentryMocks.setUserMock.mockReset();
    authStateChangedCallback = null;

    navigationMocks.useRouterMock.mockReturnValue({
      replace: navigationMocks.replaceMock,
    });
    navigationMocks.usePathnameMock.mockReturnValue("/settings");

    authMocks.setPersistenceMock.mockResolvedValue(undefined);
    authMocks.signInWithEmailAndPasswordMock.mockResolvedValue(undefined);
    authMocks.createUserWithEmailAndPasswordMock.mockResolvedValue(undefined);
    authMocks.signOutMock.mockResolvedValue(undefined);
    firestoreMocks.docMock.mockImplementation(
      (_firestore: unknown, ...pathSegments: string[]) => ({
        path: pathSegments.join("/"),
      }),
    );
    firestoreMocks.getDocMock.mockResolvedValue({
      data: () => ({
        workspaceId: "workspace-1",
        role: "admin",
      }),
    });
    authMocks.onAuthStateChangedMock.mockImplementation(
      (
        _auth: unknown,
        callback: (firebaseUser: unknown) => Promise<void> | void,
      ) => {
        authStateChangedCallback = callback;
        return authMocks.unsubscribeMock;
      },
    );
    localStorageMock = {
      clear: vi.fn(),
      getItem: vi.fn().mockReturnValue(null),
      key: vi.fn().mockReturnValue(null),
      length: 0,
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };
    sessionStorageMock = {
      clear: vi.fn(),
      getItem: vi.fn().mockReturnValue(null),
      key: vi.fn().mockReturnValue(null),
      length: 0,
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: sessionStorageMock,
    });
    Object.defineProperty(window, "confirm", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  it("starts in a loading state until auth state is resolved", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(authMocks.onAuthStateChangedMock).toHaveBeenCalledTimes(1);
  });

  it("handles unauthenticated users and redirects from /app routes", async () => {
    navigationMocks.usePathnameMock.mockReturnValue("/app/channels/general");
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await authStateChangedCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(navigationMocks.replaceMock).toHaveBeenCalledWith("/signin");
    expect(sentryMocks.setUserMock).toHaveBeenCalledWith(null);
  });

  it("merges firestore user data into the auth user state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const firebaseUser = {
      uid: "user-1",
      displayName: "Austen",
      email: "austen@example.com",
    };

    await act(async () => {
      await authStateChangedCallback?.(firebaseUser);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toEqual(
      expect.objectContaining({
        uid: "user-1",
        displayName: "Austen",
        workspaceId: "workspace-1",
        role: "admin",
      }),
    );
    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      firestoreMocks.firestoreInstance,
      "users",
      "user-1",
    );
    expect(sentryMocks.setUserMock).toHaveBeenCalledWith({
      id: "user-1",
      username: "Austen",
    });
  });

  it("applies local persistence for sign-in and sign-up", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn("dev@example.com", "password");
      await result.current.signUp("new@example.com", "password");
    });

    expect(authMocks.setPersistenceMock).toHaveBeenCalledTimes(2);
    expect(authMocks.setPersistenceMock).toHaveBeenNthCalledWith(
      1,
      authMocks.authInstance,
      "LOCAL_PERSISTENCE",
    );
    expect(authMocks.signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      authMocks.authInstance,
      "dev@example.com",
      "password",
    );
    expect(authMocks.createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      authMocks.authInstance,
      "new@example.com",
      "password",
    );
  });

  it("signs out, clears client storage, and routes to the home page", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut({ skipConfirmation: true });
    });

    expect(authMocks.signOutMock).toHaveBeenCalledWith(authMocks.authInstance);
    expect(localStorageMock.clear).toHaveBeenCalledTimes(1);
    expect(sessionStorageMock.clear).toHaveBeenCalledTimes(1);
    expect(navigationMocks.replaceMock).toHaveBeenCalledWith("/");
  });

  it("does not sign out when the user rejects the confirmation prompt", async () => {
    const confirmMock = window.confirm as unknown as ReturnType<typeof vi.fn>;
    confirmMock.mockReturnValue(false);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(confirmMock).toHaveBeenCalledWith(
      "Are you sure you want to sign out?",
    );
    expect(authMocks.signOutMock).not.toHaveBeenCalled();
  });
});
