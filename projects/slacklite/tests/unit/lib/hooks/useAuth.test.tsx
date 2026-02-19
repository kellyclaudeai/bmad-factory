import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authMock: {},
  browserLocalPersistenceMock: { mode: "local" },
  createUserWithEmailAndPasswordMock: vi.fn(),
  docMock: vi.fn(),
  firebaseSignOutMock: vi.fn(),
  firestoreMock: {},
  getDocMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
  replaceMock: vi.fn(),
  setPersistenceMock: vi.fn(),
  setUserMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  usePathnameMock: vi.fn(),
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: mocks.authMock,
  firestore: mocks.firestoreMock,
}));

vi.mock("firebase/auth", () => ({
  browserLocalPersistence: mocks.browserLocalPersistenceMock,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPasswordMock,
  onAuthStateChanged: mocks.onAuthStateChangedMock,
  setPersistence: mocks.setPersistenceMock,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPasswordMock,
  signOut: mocks.firebaseSignOutMock,
}));

vi.mock("firebase/firestore", () => ({
  doc: mocks.docMock,
  getDoc: mocks.getDocMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathnameMock,
  useRouter: () => ({
    replace: mocks.replaceMock,
  }),
}));

vi.mock("@sentry/nextjs", () => ({
  setUser: mocks.setUserMock,
}));

import { AuthProvider, useAuth } from "@/lib/hooks/useAuth";

let authStateChangeHandler:
  | ((firebaseUser: unknown) => void | Promise<void>)
  | null = null;

function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    authStateChangeHandler = null;

    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.usePathnameMock.mockReturnValue("/");
    mocks.docMock.mockImplementation(
      (_firestore: unknown, collectionPath: string, uid: string) =>
        `${collectionPath}/${uid}`,
    );
    mocks.getDocMock.mockResolvedValue({
      data: () => ({
        workspaceId: "workspace-1",
        role: "member",
      }),
    });
    mocks.onAuthStateChangedMock.mockImplementation(
      (_auth: unknown, callback: (firebaseUser: unknown) => void | Promise<void>) => {
        authStateChangeHandler = callback;
        return mocks.unsubscribeMock;
      },
    );
    mocks.setPersistenceMock.mockResolvedValue(undefined);
    mocks.signInWithEmailAndPasswordMock.mockResolvedValue(undefined);
    mocks.createUserWithEmailAndPasswordMock.mockResolvedValue(undefined);
    mocks.firebaseSignOutMock.mockResolvedValue(undefined);
  });

  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within AuthProvider",
    );
  });

  it("starts in loading state and registers auth listener", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthWrapper });

    expect(result.current.loading).toBe(true);
    expect(mocks.onAuthStateChangedMock).toHaveBeenCalledOnce();
  });

  it("loads authenticated user state from firebase and firestore", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthWrapper });

    await act(async () => {
      await authStateChangeHandler?.({
        uid: "user-1",
        displayName: "Austen",
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        uid: "user-1",
        displayName: "Austen",
        workspaceId: "workspace-1",
        role: "member",
      }),
    );
    expect(mocks.docMock).toHaveBeenCalledWith(
      mocks.firestoreMock,
      "users",
      "user-1",
    );
    expect(mocks.setUserMock).toHaveBeenLastCalledWith({
      id: "user-1",
      username: "Austen",
    });
  });

  it("handles signed-out state and redirects protected routes", async () => {
    mocks.usePathnameMock.mockReturnValue("/app/channels/general");

    const { result } = renderHook(() => useAuth(), { wrapper: AuthWrapper });

    await act(async () => {
      await authStateChangeHandler?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    await waitFor(() => {
      expect(mocks.replaceMock).toHaveBeenCalledWith("/signin");
    });
    expect(mocks.setUserMock).toHaveBeenLastCalledWith(null);
  });

  it("signIn sets persistence before authenticating", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthWrapper });

    await act(async () => {
      await authStateChangeHandler?.(null);
    });

    await act(async () => {
      await result.current.signIn("user@example.com", "secret");
    });

    expect(mocks.setPersistenceMock).toHaveBeenCalledWith(
      mocks.authMock,
      mocks.browserLocalPersistenceMock,
    );
    expect(mocks.signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      mocks.authMock,
      "user@example.com",
      "secret",
    );
  });

  it("signUp sets persistence before account creation", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthWrapper });

    await act(async () => {
      await authStateChangeHandler?.(null);
    });

    await act(async () => {
      await result.current.signUp("new-user@example.com", "secret");
    });

    expect(mocks.setPersistenceMock).toHaveBeenCalledWith(
      mocks.authMock,
      mocks.browserLocalPersistenceMock,
    );
    expect(mocks.createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      mocks.authMock,
      "new-user@example.com",
      "secret",
    );
  });
});
