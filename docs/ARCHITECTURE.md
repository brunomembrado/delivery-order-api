# Architecture Documentation

This document describes the architectural decisions and patterns used in the
Delivery Order API.

## Overview

The system follows **Clean Architecture** principles, ensuring:

- Independence from frameworks
- Testability
- Independence from UI
- Independence from database
- Independence from external services

## Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (Express Controllers & Routes)                  │
│                                                             │
│  Responsibility: HTTP handling, request/response mapping    │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│        (Prisma Repositories, Services, Middleware)          │
│                                                             │
│  Responsibility: External concerns, implementations         │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│              (Use Cases, DTOs, Interfaces)                   │
│                                                             │
│  Responsibility: Business orchestration, workflows          │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│      (Entities, Value Objects, Repository Interfaces)        │
│                                                             │
│  Responsibility: Core business rules and logic              │
└─────────────────────────────────────────────────────────────┘
```

## Domain Layer

The innermost layer containing enterprise business rules.

### Entities

Core business objects with identity and lifecycle:

```typescript
// Order Entity
class Order {
  private readonly id: string;
  private readonly orderNumber: string;
  private status: OrderStatus;
  private items: OrderItem[];

  // Business methods
  confirm(): void { ... }
  dispatch(): void { ... }
  deliver(): void { ... }
  cancel(): void { ... }
  addItem(item: OrderItem): void { ... }
  removeItem(productId: string): void { ... }

  // Business rules
  canTransitionTo(newStatus: OrderStatus): boolean { ... }
  calculateTotal(): Money { ... }
}
```

### Value Objects

Immutable objects defined by their attributes:

```typescript
// OrderStatus Value Object
class OrderStatus {
  private constructor(private readonly value: Status) {}

  static CREATED = new OrderStatus('CREATED');
  static CONFIRMED = new OrderStatus('CONFIRMED');
  static DISPATCHED = new OrderStatus('DISPATCHED');
  static DELIVERED = new OrderStatus('DELIVERED');
  static CANCELLED = new OrderStatus('CANCELLED');

  canTransitionTo(target: OrderStatus): boolean {
    return VALID_TRANSITIONS[this.value].includes(target.value);
  }
}

// Money Value Object
class Money {
  constructor(
    readonly amount: number,
    readonly currency: string
  ) {}

  add(other: Money): Money { ... }
  multiply(factor: number): Money { ... }
}

// Address Value Object
class Address {
  constructor(
    readonly street: string,
    readonly city: string,
    readonly state: string,
    readonly postalCode: string,
    readonly country: string
  ) {}
}
```

### Repository Interfaces

Contracts for data access (implemented in Infrastructure):

```typescript
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findAll(filters: OrderFilters): Promise<PaginatedResult<Order>>;
  save(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
}
```

## Application Layer

Orchestrates the flow of data and coordinates domain objects.

### Use Cases

Single-purpose classes that implement business workflows:

```typescript
class UpdateOrderStatusUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(input: UpdateStatusInput): Promise<Order> {
    // 1. Fetch order
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) throw new OrderNotFoundError();

    // 2. Apply business rule (delegated to entity)
    order.transitionTo(input.newStatus);

    // 3. Persist
    await this.orderRepository.save(order);

    // 4. Publish event
    await this.eventPublisher.publish(new OrderStatusChangedEvent(order));

    return order;
  }
}
```

### DTOs (Data Transfer Objects)

Define input/output contracts:

```typescript
// Input DTO
interface CreateOrderInput {
  retailerId: string;
  customer: CustomerDTO;
  deliveryAddress: AddressDTO;
  items: OrderItemDTO[];
  notes?: string;
}

// Output DTO
interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  customer: CustomerDTO;
  items: OrderItemDTO[];
  total: MoneyDTO;
  createdAt: string;
  updatedAt: string;
}
```

## Infrastructure Layer

Implements interfaces defined in inner layers.

### Repository Implementations

```typescript
class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    return data ? this.toDomain(data) : null;
  }

  private toDomain(data: PrismaOrder): Order {
    // Map database model to domain entity
  }

  private toPersistence(order: Order): PrismaOrderData {
    // Map domain entity to database model
  }
}
```

### External Services

```typescript
class JwtTokenService implements ITokenService {
  generateAccessToken(user: User): string { ... }
  generateRefreshToken(user: User): string { ... }
  verifyToken(token: string): TokenPayload { ... }
}

class BcryptPasswordService implements IPasswordService {
  hash(password: string): Promise<string> { ... }
  verify(password: string, hash: string): Promise<boolean> { ... }
}
```

### Middleware

```typescript
const authMiddleware = (tokenService: ITokenService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    next();
  };
```

## Presentation Layer

Handles HTTP concerns and maps to/from application layer.

### Controllers

```typescript
class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private updateStatusUseCase: UpdateOrderStatusUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const input = this.mapRequestToInput(req);
    const order = await this.createOrderUseCase.execute(input);
    const response = this.mapOrderToResponse(order);
    res.status(201).json(response);
  }
}
```

### Routes

```typescript
const orderRoutes = Router();

orderRoutes.get('/', authMiddleware, orderController.list);
orderRoutes.post('/', authMiddleware, validateBody(CreateOrderSchema), orderController.create);
orderRoutes.get('/:id', authMiddleware, orderController.getById);
orderRoutes.patch('/:id/status', authMiddleware, orderController.updateStatus);
```

## Dependency Injection

Uses a simple container for wiring dependencies:

```typescript
// container.ts
export const createContainer = (prisma: PrismaClient) => {
  // Repositories
  const orderRepository = new PrismaOrderRepository(prisma);
  const userRepository = new PrismaUserRepository(prisma);

  // Services
  const tokenService = new JwtTokenService(config.jwt);
  const passwordService = new BcryptPasswordService();

  // Use Cases
  const createOrderUseCase = new CreateOrderUseCase(orderRepository);
  const updateStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  // Controllers
  const orderController = new OrderController(createOrderUseCase, updateStatusUseCase);

  return { orderController, ... };
};
```

## State Machine: Order Lifecycle

```
                    ┌─────────────┐
                    │   CREATED   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            │
       ┌──────────┐  ┌──────────┐      │
       │ CANCELLED│  │ CONFIRMED│      │
       └──────────┘  └────┬─────┘      │
                          │            │
              ┌───────────┼────────────┘
              │           │
              ▼           ▼
       ┌──────────┐  ┌───────────┐
       │ CANCELLED│  │ DISPATCHED│
       └──────────┘  └─────┬─────┘
                           │
                           ▼
                    ┌───────────┐
                    │ DELIVERED │
                    └───────────┘
```

### Transition Rules

| From       | To         | Condition                    |
|------------|------------|------------------------------|
| CREATED    | CONFIRMED  | Order has at least 1 item    |
| CREATED    | CANCELLED  | Always allowed               |
| CONFIRMED  | DISPATCHED | Always allowed               |
| CONFIRMED  | CANCELLED  | Always allowed               |
| DISPATCHED | DELIVERED  | Always allowed               |
| DELIVERED  | *          | Not allowed (terminal state) |
| CANCELLED  | *          | Not allowed (terminal state) |

## Error Handling

### Domain Errors

```typescript
class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`, 'INVALID_TRANSITION');
  }
}
```

### Error Response Mapping

```typescript
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(422).json({ error: err.message, code: err.code });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  // ... handle other error types
  return res.status(500).json({ error: 'Internal server error' });
};
```

## Testing Strategy

### Unit Tests (Domain & Application)

```typescript
describe('Order Entity', () => {
  it('should allow transition from CREATED to CONFIRMED with items', () => {
    const order = Order.create({ ... });
    order.addItem(item);
    order.confirm();
    expect(order.status).toBe(OrderStatus.CONFIRMED);
  });

  it('should throw when confirming order without items', () => {
    const order = Order.create({ ... });
    expect(() => order.confirm()).toThrow(OrderHasNoItemsError);
  });
});
```

### Integration Tests (Infrastructure)

```typescript
describe('PrismaOrderRepository', () => {
  it('should persist and retrieve order', async () => {
    const order = Order.create({ ... });
    await repository.save(order);

    const found = await repository.findById(order.id);
    expect(found).toEqual(order);
  });
});
```

### E2E Tests (Presentation)

```typescript
describe('POST /orders', () => {
  it('should create order and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(validOrderData);

    expect(response.status).toBe(201);
    expect(response.body.orderNumber).toBeDefined();
  });
});
```

## Security Considerations

1. **Authentication**: JWT tokens with short expiry
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prevented by Prisma ORM
5. **Rate Limiting**: Per-IP and per-user limits
6. **CORS**: Configured for allowed origins
7. **Helmet**: Security headers

## Future Considerations

1. **Event Sourcing**: For complete audit trail
2. **CQRS**: Separate read/write models for scale
3. **Microservices**: Split into independent services
4. **Message Queue**: Async processing with RabbitMQ/Kafka
5. **Caching**: Redis for frequently accessed data
