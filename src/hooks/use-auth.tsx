'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock provider for when Firebase is not configured.
// This allows the app to be used for prototyping without real credentials.
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [mockUser, setMockUser] = useState<User | null>({
    uid: 'mock-user-id-123',
    email: 'user@example.com',
    emailVerified: true,
    displayName: 'Mock User',
    isAnonymous: false,
    photoURL: null,
    providerData: [],
    providerId: 'password',
    tenantId: null,
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve('mock-id-token'),
    getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token' } as any),
    reload: () => Promise.resolve(),
    toJSON: () => ({}),
  });

  const mockAuthContext: AuthContextType = useMemo(
    () => ({
      user: mockUser,
      loading: false,
      login: async (email, password) => {
        console.log(`[Auth Mock] Logging in ${email}`);
        const user = { ...mockUser!, email };
        setMockUser(user);
        // Return a mock UserCredential
        return { user } as UserCredential;
      },
      signup: async (email, password) => {
        console.log(`[Auth Mock] Signing up ${email}`);
        const user = { ...mockUser!, email };
        setMockUser(user);
        // Return a mock UserCredential
        return { user } as UserCredential;
      },
      logout: async () => {
        console.log('[Auth Mock] Logging out');
        setMockUser(null);
      },
    }),
    [mockUser]
  );

  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Developer Mode</AlertTitle>
          <AlertDescription>
            <p>Firebase not configured. Using mocked authentication.</p>
          </AlertDescription>
        </Alert>
      </div>
    </AuthContext.Provider>
  );
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If firebase isn't configured, we don't need to do anything here.
    // The component will render the MockAuthProvider.
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      login: (email, password) => {
        if (!firebaseAuth) throw new Error('Firebase not configured.');
        return signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signup: (email, password) => {
        if (!firebaseAuth) throw new Error('Firebase not configured.');
        return createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      logout: () => {
        if (!firebaseAuth) throw new Error('Firebase not configured.');
        return signOut(firebaseAuth);
      },
    }),
    [user, loading]
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If Firebase is not configured, render the MockAuthProvider.
  // This provides a fake authenticated user, allowing the rest of the app to render.
  if (!firebaseAuth) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // Otherwise, render the real provider with real Firebase auth state.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
