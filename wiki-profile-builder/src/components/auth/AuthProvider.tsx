'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, auth } from '@/services/firebase';
import { useStore } from '@/store/useStore';
import { Spinner } from '@/components/ui/Spinner';

interface AuthProviderProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setAuthLoading, isAuthLoading, user } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  useEffect(() => {
    if (isAuthLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute) {
      router.push('/');
    }
  }, [user, isAuthLoading, pathname, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
