/**
 * @fileoverview Authentication configuration using Auth.js (NextAuth v5).
 * Configures credentials-based authentication with JWT sessions.
 * @module lib/auth
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

/** Base URL for API authentication requests */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Module augmentation for NextAuth User type.
 * Extends the default User interface with application-specific fields.
 */
declare module 'next-auth' {
  /**
   * Extended User interface with custom fields.
   * @interface User
   * @property {string} [role] - User role ('ADMIN' or 'RETAILER')
   * @property {string} [retailerId] - Associated retailer ID for RETAILER users
   * @property {string} [accessToken] - JWT access token for API requests
   * @property {string} [refreshToken] - JWT refresh token for token renewal
   */
  interface User {
    role?: string;
    retailerId?: string;
    accessToken?: string;
    refreshToken?: string;
  }

  /**
   * Extended Session interface with custom fields.
   * @interface Session
   * @property {string} [accessToken] - JWT access token for API requests
   * @property {User} user - Authenticated user data
   */
  interface Session {
    accessToken?: string;
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

/**
 * Module augmentation for Auth.js JWT type.
 * Extends the default JWT interface with application-specific fields.
 */
declare module '@auth/core/jwt' {
  /**
   * Extended JWT interface with custom claims.
   * @interface JWT
   * @property {string} [id] - User ID
   * @property {string} [role] - User role
   * @property {string} [retailerId] - Associated retailer ID
   * @property {string} [accessToken] - API access token
   * @property {string} [refreshToken] - API refresh token
   */
  interface JWT {
    id?: string;
    role?: string;
    retailerId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

/**
 * NextAuth configuration object.
 * Defines authentication providers, callbacks, and session settings.
 *
 * @type {NextAuthConfig}
 */
const authConfig: NextAuthConfig = {
  /**
   * Authentication providers configuration.
   * Currently uses credentials-based authentication against the backend API.
   */
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * Authorizes user credentials against the backend API.
       *
       * @param credentials - User-provided credentials
       * @param credentials.email - User's email address
       * @param credentials.password - User's password
       * @returns User object with tokens if authentication succeeds
       * @throws Error if credentials are missing or authentication fails
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Authentication failed');
          }

          const { user, tokens } = data.data;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            retailerId: user.retailerId,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],

  /**
   * Authentication callbacks for customizing JWT and session behavior.
   */
  callbacks: {
    /**
     * JWT callback - Called whenever a JWT is created or updated.
     * Persists user data and tokens in the JWT for subsequent requests.
     *
     * @param params - Callback parameters
     * @param params.token - Current JWT token
     * @param params.user - User object (only available on sign in)
     * @returns Updated JWT token with user data
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.retailerId = user.retailerId;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    /**
     * Session callback - Called whenever a session is checked.
     * Exposes JWT data to the client-side session object.
     *
     * @param params - Callback parameters
     * @param params.session - Current session object
     * @param params.token - JWT token containing user data
     * @returns Updated session with user data and access token
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.retailerId = token.retailerId;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  /** Custom page routes for authentication flows */
  pages: {
    signIn: '/login',
    error: '/login',
  },

  /** Session configuration */
  session: {
    /** Use JWT strategy for stateless sessions */
    strategy: 'jwt',
    /** Session expires after 24 hours */
    maxAge: 24 * 60 * 60,
  },

  /** Trust the host header (required for production deployments) */
  trustHost: true,
};

/**
 * NextAuth instance exports.
 *
 * @property {object} handlers - Route handlers for GET and POST requests
 * @property {Function} signIn - Server-side sign in function
 * @property {Function} signOut - Server-side sign out function
 * @property {Function} auth - Server-side session retrieval function
 *
 * @example
 * ```typescript
 * // In a server component or API route
 * import { auth } from '@/lib/auth';
 *
 * const session = await auth();
 * if (session?.user) {
 *   console.log('Authenticated as:', session.user.email);
 * }
 * ```
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
