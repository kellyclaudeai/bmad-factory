# Story 2.5: Create Auth Context Provider

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Build React Context for global authentication state. Provide user data, loading state, and auth methods (signIn, signUp, signOut) to entire app with Firestore user data integration.

**Acceptance Criteria:**
- [x] Create `lib/contexts/AuthContext.tsx`
- [x] Context provides: `{ user, loading, signIn, signUp, signOut }`
- [x] User state synced with Firebase Auth: `onAuthStateChanged` listener
- [x] On auth change: Fetch user data from Firestore `/users/{uid}` and merge with Firebase Auth user
- [x] Custom hook: `useAuth()` wraps `useContext(AuthContext)`
- [x] Loading state: `true` during initial auth check, `false` after resolved
- [x] Wrap app in AuthProvider in `app/layout.tsx`
- [x] Protected routes check `user` state: If null, redirect to `/signin`

**Dependencies:**
dependsOn: ["1.4"]

**Technical Notes:**
- AuthContext implementation (lib/contexts/AuthContext.tsx):
  ```typescript
  import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
  import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';
  import { auth, firestore } from '@/lib/firebase/client';

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          setUser({ ...firebaseUser, ...userData } as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }, []);

    return (
      <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
  };
  ```
- Wrap app in `app/layout.tsx`:
  ```typescript
  export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    );
  }
  ```

**Estimated Effort:** 2 hours
