/**
 * @fileoverview Root layout component for the Next.js application.
 * Defines the HTML structure and global providers for all pages.
 * @module app/layout
 */

import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

/**
 * Application metadata for SEO and browser display.
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'Delivery Order Portal',
  description: 'Manage your delivery orders',
};

/**
 * Props for the RootLayout component.
 */
interface RootLayoutProps {
  /** Child page components to render */
  children: React.ReactNode;
}

/**
 * Root layout component that wraps all pages in the application.
 *
 * This is a Server Component that provides:
 * - HTML document structure
 * - Global CSS styles
 * - Client-side providers via the Providers component
 *
 * @param props - Component props
 * @param props.children - Page content to render
 * @returns The complete HTML document structure
 *
 * @example
 * ```tsx
 * // Automatically used by Next.js for all routes
 * // pages are rendered as children:
 * <RootLayout>
 *   <DashboardPage />
 * </RootLayout>
 * ```
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
