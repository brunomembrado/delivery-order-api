/**
 * Order Status Value Object
 * Implements the Order Lifecycle State Machine:
 * CREATED → CONFIRMED → DISPATCHED → DELIVERED
 * Cancellation: Only allowed from CREATED or CONFIRMED
 * Terminal States: DELIVERED and CANCELLED
 */
export enum OrderStatusEnum {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  private readonly _value: OrderStatusEnum;

  private static readonly VALID_TRANSITIONS: Map<OrderStatusEnum, OrderStatusEnum[]> = new Map([
    [OrderStatusEnum.CREATED, [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED]],
    [OrderStatusEnum.CONFIRMED, [OrderStatusEnum.DISPATCHED, OrderStatusEnum.CANCELLED]],
    [OrderStatusEnum.DISPATCHED, [OrderStatusEnum.DELIVERED]],
    [OrderStatusEnum.DELIVERED, []], // Terminal state
    [OrderStatusEnum.CANCELLED, []], // Terminal state
  ]);

  private static readonly TERMINAL_STATES: OrderStatusEnum[] = [
    OrderStatusEnum.DELIVERED,
    OrderStatusEnum.CANCELLED,
  ];

  private constructor(value: OrderStatusEnum) {
    this._value = value;
  }

  static create(value: string): OrderStatus {
    const normalizedValue = value.toUpperCase() as OrderStatusEnum;

    if (!Object.values(OrderStatusEnum).includes(normalizedValue)) {
      throw new Error(`Invalid order status: ${value}`);
    }

    return new OrderStatus(normalizedValue);
  }

  static createDefault(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CREATED);
  }

  get value(): OrderStatusEnum {
    return this._value;
  }

  canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = OrderStatus.VALID_TRANSITIONS.get(this._value) || [];
    return allowedTransitions.includes(targetStatus.value);
  }

  isTerminal(): boolean {
    return OrderStatus.TERMINAL_STATES.includes(this._value);
  }

  isCancellable(): boolean {
    return this._value === OrderStatusEnum.CREATED || this._value === OrderStatusEnum.CONFIRMED;
  }

  equals(other: OrderStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static getAllStatuses(): OrderStatusEnum[] {
    return Object.values(OrderStatusEnum);
  }

  static getValidTransitions(status: OrderStatusEnum): OrderStatusEnum[] {
    return OrderStatus.VALID_TRANSITIONS.get(status) || [];
  }
}
