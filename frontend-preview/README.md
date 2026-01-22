# Delivery Order Portal - Web Application

A modern web portal for managing delivery orders built with Next.js 16, React
19, and Auth.js v5.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)

## Overview

The Delivery Order Portal provides a user-friendly interface for retailers and
administrators to manage delivery orders. It connects to the Delivery Order API
backend and provides real-time order tracking, status management, and analytics.

## Features

- **Authentication**: Secure login with JWT-based authentication
- **Dashboard**: Overview of order statistics by status
- **Order Management**: View, filter, and update order statuses
- **Status Workflow**: CREATED → CONFIRMED → DISPATCHED → DELIVERED
- **Order Details**: Comprehensive view of order information including items,
  addresses, and timeline
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Refresh data with a single click

## Tech Stack

| Technology                                    | Version  | Purpose                         |
| --------------------------------------------- | -------- | ------------------------------- |
| [Next.js](https://nextjs.org/)                | 16.1     | React framework with App Router |
| [React](https://react.dev/)                   | 19.0     | UI library                      |
| [Auth.js](https://authjs.dev/)                | 5.0      | Authentication                  |
| [TypeScript](https://www.typescriptlang.org/) | 5.7      | Type safety                     |
| [Tailwind CSS](https://tailwindcss.com/)      | 3.4      | Styling                         |
| [Lucide React](https://lucide.dev/)           | 0.469    | Icons                           |
| [Turbopack](https://turbo.build/pack)         | Built-in | Fast bundler                    |

## Getting Started

### Prerequisites

- **Node.js** >= 24.0.0
- **npm** >= 10.0.0
- Backend API running at `http://localhost:3001` (or configured URL)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment**:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

   # Auth.js Configuration
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open in browser**: [http://localhost:3000](http://localhost:3000)

### Test Accounts

For development, use these test credentials:

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| Admin    | admin@delivery.local | Admin123!    |
| Retailer | user@techmart.com    | Retailer123! |

## Project Structure

```
frontend-preview/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts    # Auth.js API route
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (redirects)
│   ├── components/
│   │   └── providers.tsx       # Client-side providers
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── auth.ts             # Auth.js configuration
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                     # Static assets
├── .nvmrc                      # Node version (24)
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Configuration

### Environment Variables

| Variable              | Required | Description               |
| --------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API base URL      |
| `NEXTAUTH_SECRET`     | Yes      | Secret for signing tokens |
| `NEXTAUTH_URL`        | Yes      | Application URL           |

### Next.js Configuration

The application uses Next.js 16 with the following features:

- **Turbopack**: Enabled by default for fast development builds
- **App Router**: Modern routing with React Server Components
- **React Strict Mode**: Enabled for better development experience

## Authentication

Authentication is handled by Auth.js v5 with credentials provider:

### Flow

1. User enters email/password on login page
2. Credentials are validated against the backend API
3. On success, JWT tokens are stored in the session
4. Access token is used for subsequent API requests
5. Session expires after 24 hours

### Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'RETAILER';
    retailerId?: string;
  };
  accessToken: string;
}
```

### Protected Routes

All routes except `/login` require authentication. Unauthenticated users are
automatically redirected to the login page.

## API Integration

### API Client

The `ApiClient` class (`src/lib/api.ts`) provides typed methods for all API
endpoints:

```typescript
import { api } from '@/lib/api';

// Set access token after login
api.setAccessToken(session.accessToken);

// Fetch orders
const orders = await api.getOrders({ status: 'CREATED' });

// Update order status
await api.updateOrderStatus(orderId, 'CONFIRMED');
```

### Available Methods

#### Authentication

- `login(email, password)` - Authenticate user
- `register(data)` - Register new user
- `refreshToken(token)` - Refresh access token

#### Orders

- `getOrders(params?)` - List orders with optional filters
- `getOrder(id)` - Get single order
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, status)` - Update order status
- `addOrderItem(orderId, item)` - Add item to order
- `removeOrderItem(orderId, productId)` - Remove item from order
- `getOrderStats()` - Get order statistics

#### Retailers

- `getRetailers(params?)` - List retailers
- `getRetailer(id)` - Get single retailer
- `createRetailer(data)` - Create new retailer

## Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (configure as needed)

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file with your component
3. Export a default function component

```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Adding New API Methods

1. Open `src/lib/api.ts`
2. Add a new method to the `ApiClient` class
3. Include JSDoc documentation

```typescript
/**
 * Description of the method.
 * @param param - Parameter description
 * @returns Return value description
 */
async newMethod(param: string): Promise<ApiResponse<Data>> {
  return this.request<Data>('/endpoint', {
    method: 'POST',
    body: JSON.stringify({ param }),
  });
}
```

## Deployment

### Build for Production

```bash
npm run build
```

### Vercel (Recommended)

The easiest way to deploy this Next.js app is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set the root directory to `frontend-preview`
4. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXTAUTH_SECRET` - Generate a secure secret
   - `NEXTAUTH_URL` - Your Vercel deployment URL

Vercel will automatically deploy on every push to main.

### Environment Variables for Production

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api/v1
NEXTAUTH_SECRET=generate-a-secure-secret
NEXTAUTH_URL=https://yourapp.com
```

## License

This project is proprietary and confidential.

---

Built with Next.js 16 and React 19
