/**
 * @fileoverview Client-side providers for the application.
 * Wraps the application with necessary context providers.
 * @module components/providers
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/**
 * Props for the Providers component.
 */
interface ProvidersProps {
  /** Child components to wrap with providers */
  children: ReactNode;
}

/**
 * Application-wide providers wrapper component.
 * Includes the Auth.js SessionProvider for authentication state management.
 *
 * This is a client component that wraps the application with all necessary
 * context providers. It's separated from the root layout to keep the layout
 * as a server component.
 *
 * @param props - Component props
 * @param props.children - Child components to render
 * @returns The wrapped application with all providers
 *
 * @example
 * ```tsx
 * // Used in layout.tsx
 * <Providers>
 *   {children}
 * </Providers>
 * ```
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
