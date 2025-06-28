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
import type { User } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof signInWithEmailAndPassword;
  signup: typeof createUserWithEmailAndPassword;
  logout: typeof signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (email, password) => {
        if (!firebaseAuth)
          return Promise.reject(new Error('Firebase not configured.'));
        return signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signup: (email, password) => {
        if (!firebaseAuth)
          return Promise.reject(new Error('Firebase not configured.'));
        return createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      logout: () => {
        if (!firebaseAuth)
          return Promise.reject(new Error('Firebase not configured.'));
        return signOut(firebaseAuth);
      },
    }),
    [user, loading]
  );
  
  if (!firebaseAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              It looks like your Firebase credentials are not set up correctly in
              your <strong>.env</strong> file. This app requires Firebase for
              user authentication.
            </p>
            <p>
              Please copy your project's web app configuration from the
              Firebase console, paste it into the <strong>.env</strong> file,
              and then restart the development server.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
