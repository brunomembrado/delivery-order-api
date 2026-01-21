/**
 * @fileoverview Login page component for user authentication.
 * Provides a form for email/password login using Auth.js credentials provider.
 * @module app/login/page
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

/**
 * Login page component with email/password authentication form.
 *
 * Features:
 * - Email and password input fields with validation
 * - Loading state during authentication
 * - Error display for failed login attempts
 * - Automatic redirect to dashboard on success
 * - Test account credentials display for development
 *
 * @returns Login form component
 *
 * @example
 * ```tsx
 * // Accessed at '/login'
 * // Users enter credentials and are redirected to dashboard on success
 * ```
 */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  /** Email input state */
  const [email, setEmail] = useState('');

  /** Password input state */
  const [password, setPassword] = useState('');

  /** Error message state for displaying authentication failures */
  const [error, setError] = useState('');

  /** Loading state while authentication is in progress */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission for user login.
   * Authenticates using Auth.js credentials provider and handles the result.
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Delivery Order Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your orders
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Test Accounts
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              <strong>Admin:</strong> admin@delivery.local / Admin123!
            </p>
            <p>
              <strong>Retailer:</strong> user@techmart.com / Retailer123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
