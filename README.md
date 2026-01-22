# Delivery Order API

A production-grade delivery order management system I built to demonstrate my
understanding of enterprise software engineering practices including Clean
Architecture, Domain-Driven Design, and modern DevOps workflows.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Why This Architecture?](#why-this-architecture)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Architecture Deep Dive](#architecture-deep-dive)
7. [Key Design Decisions](#key-design-decisions)
8. [API Design](#api-design)
9. [Authentication & Authorization](#authentication--authorization)
10. [Database Design](#database-design)
11. [Frontend Architecture](#frontend-architecture)
12. [Testing Strategy](#testing-strategy)
13. [Development Workflow](#development-workflow)
14. [Deployment](#deployment)
15. [Future Improvements / Roadmap](#future-improvements--roadmap)
16. [Code Quality Standards](#code-quality-standards)

---

## Project Overview

### What Is This?

This is a **delivery order management system** that allows retailers to create,
track, and manage delivery orders through their lifecycle. The system consists
of:

- **Backend API**: A RESTful service built with Node.js/Express
- **Frontend Portal**: A Next.js web application for order management
- **Database**: PostgreSQL for persistent storage

### The Business Domain

The system models a real-world delivery workflow:

```
Customer places order → Retailer confirms → Dispatch for delivery → Mark delivered
                              ↓                      ↓
                         Can cancel            Can cancel (before dispatch)
```

**Key Entities:**

- **Orders**: The core business object with items, addresses, and status
- **Retailers**: Businesses that fulfill orders
- **Users**: System users with role-based access (Admin or Retailer)

### Why I Built This

I built this project to demonstrate how to create a **production-ready**
application that:

1. **Scales** - Clean separation allows independent scaling of services
2. **Maintains** - Clear boundaries make the codebase navigable and changeable
3. **Tests** - Layered architecture enables comprehensive testing at each level
4. **Evolves** - Domain-centric design adapts to changing business requirements

---

## Why This Architecture?

### Clean Architecture

I chose **Clean Architecture** (also known as Hexagonal/Ports & Adapters)
because:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│                 (Controllers, Routes, Middleware)                │
│   WHY: Separates HTTP concerns from business logic               │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                         │
│              (Repositories, External Services)                   │
│   WHY: Isolates database/external dependencies for easy swap     │
├─────────────────────────────────────────────────────────────────┤
│                      Application Layer                           │
│                    (Use Cases, DTOs)                             │
│   WHY: Orchestrates business operations without framework deps   │
├─────────────────────────────────────────────────────────────────┤
│                        Domain Layer                              │
│              (Entities, Value Objects, Rules)                    │
│   WHY: Pure business logic, no external dependencies             │
└─────────────────────────────────────────────────────────────────┘
```

**The Dependency Rule**: Dependencies only point inward. The Domain layer knows
nothing about databases, HTTP, or frameworks. This means:

- **Testability**: Test business logic without spinning up databases
- **Flexibility**: Swap PostgreSQL for MongoDB without touching business code
- **Clarity**: Each layer has one job and one reason to change

### Why Not a Simpler Architecture?

For a small CRUD app, this would be overkill. But this project demonstrates
patterns needed when:

- Multiple developers work on the codebase
- Business rules are complex and change frequently
- The system needs to integrate with external services
- Long-term maintainability matters more than initial velocity

---

## Prerequisites

Before starting, ensure you have the following installed and running:

### Required Software

| Software           | Version | Purpose                       | Installation                                     |
| ------------------ | ------- | ----------------------------- | ------------------------------------------------ |
| **Node.js**        | 24.x    | JavaScript runtime            | [nodejs.org](https://nodejs.org/) or use `nvm`   |
| **npm**            | 10.x+   | Package manager               | Comes with Node.js                               |
| **Docker**         | 20.x+   | Container runtime             | [docker.com](https://www.docker.com/get-started) |
| **Docker Compose** | 2.x+    | Multi-container orchestration | Included with Docker Desktop                     |
| **Git**            | 2.x+    | Version control               | [git-scm.com](https://git-scm.com/)              |

### Verify Installation

```bash
# Check Node.js version (must be 24.x)
node --version

# Check npm version
npm --version

# Check Docker is running
docker --version
docker compose version

# Check Git
git --version
```

### Node.js Version Management

I use `.nvmrc` files to ensure consistent Node.js versions across all
environments:

```bash
# If you have nvm installed, simply run:
nvm install    # Installs the version specified in .nvmrc
nvm use        # Switches to that version

# Verify
node --version  # Should output v24.x.x
```

**Why Node.js 24?** It's the current LTS version with:

- Native ES modules support
- Improved performance
- Latest security patches
- Modern JavaScript features

---

## Getting Started

Follow these steps **in order** to set up the development environment.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd delivery-order-api
```

### Step 2: Set Node.js Version

```bash
# Using nvm (recommended)
nvm install
nvm use

# Verify you're on Node 24
node --version
```

### Step 3: Install Dependencies

```bash
# Install all workspace dependencies
# I use npm ci for reproducible builds (uses package-lock.json exactly)
npm ci
```

**Why `npm ci` instead of `npm install`?**

- `npm ci` is faster and more reliable
- It uses exact versions from `package-lock.json`
- It removes `node_modules` first, ensuring clean state
- It fails if `package-lock.json` is out of sync (catches errors early)

### Step 4: Start Docker Services

```bash
# Start PostgreSQL and pgAdmin containers
docker compose up -d

# Verify containers are running
docker compose ps
```

This starts:

- **PostgreSQL** on port `5432` - The database
- **pgAdmin** on port `5050` - Database management UI (optional)

### Step 5: Configure Environment

```bash
# Copy example environment files
cp .env.example .env
cp services/order-service/.env.example services/order-service/.env
cp frontend-preview/.env.example frontend-preview/.env.local
```

The default values work for local development. For production, you **must**
change:

- `JWT_SECRET` - Use a strong random string
- `NEXTAUTH_SECRET` - Use a strong random string
- `DATABASE_URL` - Point to your production database

### Step 6: Initialize Database

```bash
# Push the Prisma schema to create tables
npm run db:push

# Seed with test data
npm run db:seed
```

### Step 7: Start Development Servers

```bash
# Start both backend and frontend
npm run dev
```

Or start them separately:

```bash
# Terminal 1: Backend API
npm run dev:order-service

# Terminal 2: Frontend
npm run dev:web
```

### Step 8: Verify Everything Works

| Service      | URL                                 | Expected Result               |
| ------------ | ----------------------------------- | ----------------------------- |
| Frontend     | http://localhost:3000               | Login page                    |
| Backend API  | http://localhost:3001/api/v1/health | `{"status":"ok"}`             |
| Swagger Docs | http://localhost:3001/api/docs      | Interactive API documentation |
| pgAdmin      | http://localhost:5050               | Database management UI        |

### Test Accounts

Use these credentials to log in:

| Role     | Email                | Password     | Access Level               |
| -------- | -------------------- | ------------ | -------------------------- |
| Admin    | admin@delivery.local | Admin123!    | Full system access         |
| Retailer | user@techmart.com    | Retailer123! | Own retailer's orders only |
| Retailer | user@fashionhub.com  | Retailer123! | Own retailer's orders only |

---

## Project Structure

```
delivery-order-api/
│
├── services/
│   └── order-service/             # Backend API (Node.js/Express)
│       ├── src/
│       │   ├── domain/            # Core business logic (entities, value objects)
│       │   ├── application/       # Use cases and DTOs
│       │   ├── infrastructure/    # Database, external services
│       │   └── presentation/      # HTTP controllers, routes
│       ├── prisma/                # Database schema and migrations
│       ├── tests/                 # Unit and integration tests
│       ├── Dockerfile             # Production container
│       ├── .nvmrc                 # Node.js version (24)
│       └── package.json
│
├── frontend-preview/                    # Frontend (Next.js 16 / React 19)
│   └── src/
│       ├── app/                   # Next.js App Router pages
│       ├── components/            # Reusable React components
│       ├── lib/                   # API client, auth configuration
│       └── types/                 # TypeScript type definitions
│   ├── Dockerfile                 # Production container
│   ├── .nvmrc                     # Node.js version (24)
│   └── package.json
│
├── shared/                        # Shared code across services
│   ├── errors/                    # Custom error classes
│   ├── logging/                   # Winston logger configuration
│   ├── validation/                # Zod validation schemas
│   └── utils/                     # Result pattern, helpers
│
├── docker/                        # Docker configuration files
├── docs/                          # Additional documentation
│
├── docker-compose.yml             # Development Docker services
├── docker-compose.prod.yml        # Production Docker services
├── package.json                   # Root workspace configuration
├── .nvmrc                         # Node.js version (24)
└── README.md                      # This file
```

### Why This Structure?

**Monorepo with Workspaces**: I use npm workspaces to manage multiple packages
in one repository:

- **Shared code**: Common utilities are shared without publishing to npm
- **Atomic changes**: Frontend and backend changes can be in one commit
- **Simplified tooling**: One `package.json` for linting, formatting, etc.
- **Easier refactoring**: Move code between packages without friction

**Service Separation**: Backend and frontend are separate packages because:

- They have different deployment targets
- They can scale independently
- They could be worked on in parallel by different teams
- Different testing strategies apply

---

## Architecture Deep Dive

### Domain Layer (`services/order-service/src/domain/`)

The **heart of the application**. Contains pure business logic with zero
dependencies on frameworks or databases.

```typescript
// Example: Order Entity
class Order {
  private status: OrderStatus;

  confirm(): void {
    // Business rule: Can only confirm if CREATED and has items
    if (this.status !== OrderStatus.CREATED) {
      throw new InvalidStatusTransitionError(this.status, 'CONFIRMED');
    }
    if (this.items.length === 0) {
      throw new OrderHasNoItemsError();
    }
    this.status = OrderStatus.CONFIRMED;
    this.confirmedAt = new Date();
  }
}
```

**Why?** Business rules like "orders need items to be confirmed" live here. If
the rule changes, there's exactly one place to update it.

### Application Layer (`services/order-service/src/application/`)

**Orchestrates use cases** by coordinating domain objects and infrastructure
services.

```typescript
// Example: Update Order Status Use Case
class UpdateOrderStatusUseCase {
  constructor(
    private orderRepository: IOrderRepository, // Interface, not implementation
    private eventEmitter: IEventEmitter
  ) {}

  async execute(input: UpdateOrderStatusDTO): Promise<Order> {
    const order = await this.orderRepository.findById(input.orderId);

    order.transitionTo(input.newStatus); // Domain logic

    await this.orderRepository.save(order);
    await this.eventEmitter.emit('order.status.changed', order);

    return order;
  }
}
```

**Why?** Use cases are the API of your business logic. They're easy to test and
reuse (same use case can be triggered by HTTP, CLI, or message queue).

### Infrastructure Layer (`services/order-service/src/infrastructure/`)

**Implements interfaces** defined by inner layers. Contains all the "dirty"
details.

```typescript
// Example: Prisma Repository Implementation
class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return data ? this.toDomain(data) : null; // Map to domain entity
  }
}
```

**Why?** If I need to switch from Prisma to TypeORM, I only change this layer.
The domain and application layers don't care.

### Presentation Layer (`services/order-service/src/presentation/`)

**Handles HTTP concerns**: routing, request parsing, response formatting,
authentication.

```typescript
// Example: Controller
class OrderController {
  async updateStatus(req: Request, res: Response) {
    const dto = UpdateOrderStatusDTO.parse(req.body); // Validation

    const order = await this.updateStatusUseCase.execute(dto);

    res.json({ success: true, data: OrderMapper.toResponse(order) });
  }
}
```

**Why?** Controllers are thin. They translate HTTP to use case calls and back.
All business logic lives in inner layers.

---

## Key Design Decisions

### Decision 1: API Versioning (`/api/v1/`)

**What**: All API endpoints are prefixed with `/api/v1/`.

**Why**:

- **Breaking changes**: When incompatible changes are needed, I can create
  `/api/v2/` while keeping v1 running
- **Client compatibility**: Mobile apps can't force users to update immediately
- **Gradual migration**: Clients migrate at their own pace
- **Clear contracts**: Version indicates the API contract

**Implementation**:

```
/api/v1/orders      ← Current version
/api/v2/orders      ← Future breaking changes
```

### Decision 2: JWT Authentication

**What**: Stateless authentication using JSON Web Tokens.

**Why**:

- **Scalability**: No session storage needed on the server
- **Microservices ready**: Any service can validate the token
- **Mobile friendly**: Works well with mobile apps and SPAs
- **Self-contained**: Token carries user info (id, role, retailerId)

**Trade-offs**:

- Cannot invalidate tokens immediately (I use short expiry + refresh tokens)
- Token size larger than session ID

### Decision 3: Role-Based Access Control (RBAC)

**What**: Two roles with different permissions.

| Role     | Permissions                          |
| -------- | ------------------------------------ |
| ADMIN    | Full access to all resources         |
| RETAILER | Access only to own retailer's orders |

**Why**:

- **Simplicity**: Two roles cover current business needs
- **Security**: Principle of least privilege
- **Multi-tenancy**: Retailers see only their data

**Implementation**: Middleware checks role and filters queries:

```typescript
// Retailer can only see their orders
if (user.role === 'RETAILER') {
  query.where.retailerId = user.retailerId;
}
```

### Decision 4: Order State Machine

**What**: Orders follow a strict state machine.

```
CREATED ──→ CONFIRMED ──→ DISPATCHED ──→ DELIVERED
   │            │
   └──→ CANCELLED ←──┘
```

**Why**:

- **Data integrity**: Invalid transitions are impossible
- **Business rules**: "Can't cancel after dispatch" is enforced
- **Audit trail**: Timestamps record when each transition happened
- **Predictability**: Frontend can show valid actions based on state

### Decision 5: Swagger/OpenAPI Documentation

**What**: Auto-generated API documentation at `/api/docs`.

**Why**:

- **Single source of truth**: Docs generated from code annotations
- **Interactive testing**: Try API calls directly in browser
- **Client generation**: Can generate SDKs from OpenAPI spec
- **Onboarding**: New developers understand API quickly

### Decision 6: TypeScript Everywhere

**What**: Both backend and frontend use TypeScript.

**Why**:

- **Type safety**: Catch errors at compile time, not runtime
- **Refactoring confidence**: IDE can safely rename across codebase
- **Documentation**: Types are documentation that can't go stale
- **Shared types**: Frontend and backend can share type definitions

### Decision 7: Monorepo Structure

**What**: All code in one repository using npm workspaces.

**Why**:

- **Atomic commits**: Change API and frontend together
- **Shared tooling**: One ESLint, Prettier, TypeScript config
- **Simplified CI**: One pipeline tests everything
- **Code sharing**: `shared/` package used by both services

**Trade-offs**:

- Repository grows larger over time
- CI must be smart about running only affected tests

### Decision 8: Prisma ORM

**What**: Using Prisma for database access.

**Why**:

- **Type safety**: Generated types match database schema
- **Migrations**: Version-controlled schema changes
- **Developer experience**: Excellent autocompletion
- **Query performance**: Efficient queries without writing SQL

### Decision 9: Next.js 16 with App Router

**What**: Frontend uses Next.js 16 with the App Router.

**Why**:

- **React Server Components**: Better performance, smaller bundles
- **Streaming**: Progressive page loading
- **Layouts**: Nested layouts with shared state
- **Modern React**: React 19 with concurrent features
- **Turbopack**: Near-instant hot module replacement

### Decision 10: Consistent Node.js Version (24)

**What**: All services use Node.js 24, enforced via `.nvmrc` files and Docker.

**Why**:

- **Reproducibility**: Same version in development and production
- **No surprises**: Avoid "works on my machine" issues
- **Latest features**: ES modules, performance improvements
- **Security**: Latest security patches

---

## API Design

### RESTful Principles

The API follows REST conventions:

| Principle        | Implementation                                                                       |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Resources**    | Nouns in URLs: `/orders`, `/retailers`                                               |
| **HTTP Methods** | `GET` read, `POST` create, `PATCH` update, `DELETE` remove                           |
| **Status Codes** | `200` success, `201` created, `400` bad request, `401` unauthorized, `404` not found |
| **JSON**         | All requests/responses use JSON                                                      |

### Endpoint Overview

#### Authentication

```
POST   /api/v1/auth/login      # Get tokens
POST   /api/v1/auth/register   # Create account
POST   /api/v1/auth/refresh    # Refresh access token
GET    /api/v1/auth/me         # Get current user
```

#### Orders

```
GET    /api/v1/orders                           # List orders (paginated, filterable)
POST   /api/v1/orders                           # Create order
GET    /api/v1/orders/:id                       # Get order by ID
GET    /api/v1/orders/number/:orderNumber       # Get by order number
PATCH  /api/v1/orders/:id/status                # Update status
POST   /api/v1/orders/:id/items                 # Add item
DELETE /api/v1/orders/:id/items/:productId      # Remove item
GET    /api/v1/orders/stats                     # Order statistics
```

#### Retailers

```
GET    /api/v1/retailers       # List retailers
POST   /api/v1/retailers       # Create retailer
GET    /api/v1/retailers/:id   # Get retailer by ID
```

### Response Format

All responses follow a consistent structure:

```json
// Success
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}

// Error
{
  "success": false,
  "error": {
    "message": "Human readable message",
    "code": "MACHINE_READABLE_CODE",
    "details": { ... }
  }
}
```

**Why consistent responses?**

- Frontend knows exactly what to expect
- Error handling is standardized
- Pagination is predictable

---

## Authentication & Authorization

### Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Client  │ ──────────────────────────▶│  Server  │
│          │                            │          │
│          │◀────────────────────────── │          │
└──────────┘   { accessToken,          └──────────┘
               refreshToken }

┌──────────┐   GET /orders              ┌──────────┐
│  Client  │   Authorization: Bearer... │  Server  │
│          │ ──────────────────────────▶│          │
│          │                            │ Validate │
│          │◀────────────────────────── │   JWT    │
└──────────┘   { orders: [...] }        └──────────┘
```

### Token Structure

The JWT contains:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "RETAILER",
  "retailerId": "retailer-id",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Token Refresh

Access tokens expire after 1 hour. Use the refresh token to get new ones:

```
POST /api/v1/auth/refresh
{ "refreshToken": "..." }

Response:
{ "accessToken": "...", "refreshToken": "..." }
```

---

## Database Design

### Schema Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │  Retailer   │       │   Order     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │◀──────│ retailerId  │
│ email       │       │ name        │       │ orderNumber │
│ password    │       │ email       │       │ status      │
│ name        │       │ isActive    │       │ totalAmount │
│ role        │       └─────────────┘       │ customerId  │
│ retailerId  │───────────────────────────▶ │ ...         │
└─────────────┘                             └──────┬──────┘
                                                   │
                                            ┌──────┴──────┐
                                            │  OrderItem  │
                                            ├─────────────┤
                                            │ id          │
                                            │ orderId     │
                                            │ productId   │
                                            │ quantity    │
                                            │ unitPrice   │
                                            └─────────────┘
```

### Why PostgreSQL?

- **ACID compliance**: Data integrity is critical for orders
- **JSON support**: Flexible schema for addresses
- **Proven reliability**: Battle-tested in production
- **Rich ecosystem**: Excellent tooling and ORMs

---

## Frontend Architecture

### Technology Stack

| Technology   | Version  | Purpose                             |
| ------------ | -------- | ----------------------------------- |
| Next.js      | 16.1     | React framework with App Router     |
| React        | 19.0     | UI library with concurrent features |
| Auth.js      | 5.0      | Authentication (NextAuth v5)        |
| TypeScript   | 5.7      | Type safety                         |
| Tailwind CSS | 3.4      | Utility-first styling               |
| Turbopack    | Built-in | Fast development bundling           |

### Why Next.js 16?

- **App Router**: Modern React patterns with Server Components
- **Turbopack**: Instant hot reload in development
- **Built-in optimization**: Image, font, and script optimization
- **API routes**: Backend for frontend when needed

### Why Auth.js v5?

- **Session management**: Handles JWT storage and refresh
- **TypeScript**: Full type safety
- **Providers**: Easy to add OAuth providers later
- **Security**: CSRF protection, secure cookies

---

## Testing Strategy

### Testing Pyramid

```
         ╱╲
        ╱  ╲       E2E Tests (few)
       ╱────╲      - Full user flows
      ╱      ╲     - Slow, expensive
     ╱────────╲
    ╱          ╲   Integration Tests (some)
   ╱────────────╲  - API endpoints
  ╱              ╲ - Database interactions
 ╱────────────────╲
╱                  ╲ Unit Tests (many)
╱────────────────────╲ - Domain logic
                       - Fast, isolated
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

---

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev                    # Start everything (Docker + Backend + Frontend)
npm run dev:order-service      # Start backend only
npm run dev:web                # Start frontend only

# Database
npm run db:push                # Push schema to database
npm run db:migrate             # Run migrations
npm run db:seed                # Seed test data
npm run db:studio              # Open Prisma Studio

# Code Quality
npm run lint                   # Check for issues
npm run lint:fix               # Fix issues automatically
npm run format                 # Format code with Prettier
npm run typecheck              # Run TypeScript compiler
npm run validate               # Run all checks

# Testing
npm test                       # Run tests
npm run test:coverage          # Run with coverage report

# Building
npm run build:order-service    # Build backend
npm run build:web              # Build frontend
```

### Pre-commit Hooks

Husky runs these checks before each commit:

1. **ESLint**: Catches code issues
2. **Prettier**: Ensures consistent formatting
3. **TypeScript**: Verifies type safety

If any check fails, the commit is blocked.

---

## Deployment

### Docker Deployment

All services use **Node.js 24 Alpine** images for consistency and small image
size.

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down
```

### Docker Services

| Service       | Image              | Port | Description               |
| ------------- | ------------------ | ---- | ------------------------- |
| postgres      | postgres:15-alpine | 5432 | PostgreSQL database       |
| order-service | node:24-alpine     | 3001 | Backend API               |
| pgadmin       | dpage/pgadmin4     | 5050 | Database admin (optional) |

**Note**: The Next.js frontend runs locally (`npm run dev:web`) or can be
deployed separately to platforms like Vercel. This separation of concerns allows
the frontend and backend to be deployed and scaled independently.

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set strong `NEXTAUTH_SECRET` (min 32 characters)
- [ ] Configure production `DATABASE_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS allowed origins
- [ ] Set up logging and monitoring
- [ ] Configure database backups

### Environment Variables

| Variable              | Required | Description                   |
| --------------------- | -------- | ----------------------------- |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string  |
| `JWT_SECRET`          | Yes      | Secret for signing JWTs       |
| `JWT_EXPIRES_IN`      | No       | Token expiry (default: "24h") |
| `NEXTAUTH_SECRET`     | Yes      | Auth.js secret                |
| `NEXTAUTH_URL`        | Yes      | Frontend URL                  |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL               |

---

## Future Improvements / Roadmap

The following features were planned but not yet implemented due to time
constraints. These represent the next steps I would take for production-ready
cloud deployment.

### CI/CD Pipeline with GitHub Actions

**Goal**: Automate the build, test, and deployment process using GitHub Actions.

**Planned Workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Build and Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_API: delivery-order-api
  ECS_CLUSTER: delivery-cluster
  ECS_SERVICE_API: order-service

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run validate
      - run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Order Service image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG -f services/order-service/Dockerfile .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_API:latest -f services/order-service/Dockerfile .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:latest

  # Note: Frontend (Next.js) would be deployed separately to Vercel
  # Vercel automatically deploys on push to main when connected to the repo

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE_API --force-new-deployment
```

### AWS Infrastructure with Fargate Auto-Scaling

**Goal**: Deploy the backend API to AWS ECS Fargate with automatic scaling. The
frontend would be deployed separately to Vercel (optimized for Next.js).

**Planned Architecture**:

```
┌──────────┐       ┌─────────────────────────────────────────────────┐
│  Users   │       │                  Vercel                         │
│          │──────▶│            Next.js Frontend                     │
└──────────┘       │         (Auto-scaled globally)                  │
     │             └─────────────────────┬───────────────────────────┘
     │                                   │ API calls
     │                                   ▼
     │             ┌─────────────────────────────────────────────────┐
     │             │                    AWS Cloud                     │
     │             │  ┌─────────────────────────────────────────────┐ │
     │             │  │         Application Load Balancer            │ │
     └─────────────│──│              :443/api/*                      │ │
                   │  └──────────────────┬──────────────────────────┘ │
                   │                     │                            │
                   │  ┌──────────────────▼──────────────────┐        │
                   │  │          ECS Fargate                │        │
                   │  │          Order Service              │        │
                   │  │   ┌────┐ ┌────┐ ┌────┐ ┌────┐      │        │
                   │  │   │Task│ │Task│ │Task│ │Task│ ...  │        │
                   │  │   └────┘ └────┘ └────┘ └────┘      │        │
                   │  │        Auto-scaling: Min 2, Max 10  │        │
                   │  └──────────────────┬──────────────────┘        │
                   │                     │                            │
                   │  ┌──────────────────▼──────────────────┐        │
                   │  │           Amazon RDS                │        │
                   │  │      PostgreSQL (Multi-AZ)          │        │
                   │  └─────────────────────────────────────┘        │
                   └─────────────────────────────────────────────────┘
```

**Why separate deployments?**

- **Frontend on Vercel**: Optimized for Next.js, global CDN, automatic previews,
  zero-config
- **Backend on AWS**: Full control, auto-scaling, private networking with
  database

**Planned Terraform Configuration** (`infrastructure/main.tf`):

```hcl
# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "delivery-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Service with Fargate
resource "aws_ecs_service" "order_service" {
  name            = "order-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.order_service.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.order_service.arn
    container_name   = "order-service"
    container_port   = 3001
  }
}

# Auto-scaling for Order Service
resource "aws_appautoscaling_target" "order_service" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.order_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "order_service_cpu" {
  name               = "order-service-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.order_service.resource_id
  scalable_dimension = aws_appautoscaling_target.order_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.order_service.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "order_service_memory" {
  name               = "order-service-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.order_service.resource_id
  scalable_dimension = aws_appautoscaling_target.order_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.order_service.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
```

**Required AWS Resources**:

| Resource                      | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| **ECR Repository**            | Store Docker image for order-service                 |
| **ECS Cluster**               | Container orchestration with Fargate                 |
| **Application Load Balancer** | Route traffic to API, SSL termination                |
| **RDS PostgreSQL**            | Managed database with Multi-AZ for high availability |
| **VPC with Private Subnets**  | Network isolation for security                       |
| **Secrets Manager**           | Store sensitive environment variables                |
| **CloudWatch**                | Logging, monitoring, and alerting                    |

**GitHub Secrets Required**:

| Secret                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM user access key with ECR/ECS permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                          |
| `DATABASE_URL`          | Production database connection string        |
| `JWT_SECRET`            | Production JWT signing secret                |
| `NEXTAUTH_SECRET`       | Production Auth.js secret                    |

### Additional Planned Improvements

**Backend (AWS):**

- [ ] **GitHub Actions CI/CD**: Automated build, test, and deploy pipeline
- [ ] **AWS ECR**: Container registry for Docker images
- [ ] **AWS ECS Fargate**: Serverless container deployment with auto-scaling
- [ ] **AWS RDS**: Managed PostgreSQL with automated backups
- [ ] **AWS Secrets Manager**: Secure storage for environment variables
- [ ] **CloudWatch Alarms**: Monitoring and alerting for service health
- [ ] **AWS WAF**: Web Application Firewall for API protection
- [ ] **Route 53**: DNS management and health checks
- [ ] **ACM**: SSL/TLS certificates for HTTPS

**Frontend (Vercel):**

- [ ] **Vercel Deployment**: Connect repo for automatic deployments
- [ ] **Preview Deployments**: Automatic previews for pull requests
- [ ] **Edge Functions**: API routes at the edge for low latency
- [ ] **Analytics**: Built-in performance monitoring

---

## Code Quality Standards

### Commit Message Convention

I follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add order cancellation endpoint
fix: correct status transition validation
docs: update API documentation
refactor: extract order validation logic
test: add order entity unit tests
chore: update dependencies
```

### Quality Checklist

- [x] TypeScript types are properly defined
- [x] Unit tests cover core functionality
- [x] No ESLint warnings or errors
- [x] Code is formatted with Prettier
- [x] API documentation is complete (Swagger)

---

## Contact

This project was built by me as a demonstration of my software engineering
skills. Feel free to reach out if you have any questions about the
implementation or architecture decisions.

---

**Built with Node.js 24, Next.js 16, React 19, and TypeScript**
