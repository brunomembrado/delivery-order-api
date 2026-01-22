/**
 * @fileoverview Home page component - handles initial routing based on auth state.
 * Redirects authenticated users to dashboard and unauthenticated users to login.
 * @module app/page
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package } from 'lucide-react';

/**
 * Home page component that handles authentication-based routing.
 *
 * This component serves as the application entry point and automatically
 * redirects users based on their authentication status:
 * - Authenticated users are redirected to the dashboard
 * - Unauthenticated users are redirected to the login page
 * - While checking auth status, a loading spinner is displayed
 *
 * @returns Loading spinner while determining auth state
 *
 * @example
 * ```tsx
 * // Accessed at the root URL '/'
 * // User will be automatically redirected based on auth status
 * ```
 */
export default function HomePage(): React.JSX.Element {
  const { status } = useSession();
  const router = useRouter();

  /**
   * Effect hook to handle navigation based on authentication status.
   * Redirects to appropriate page once session status is determined.
   */
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Package className="h-16 w-16 text-primary-600 mx-auto animate-pulse" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
