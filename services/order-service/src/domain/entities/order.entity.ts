import { InvalidStateTransitionError, BusinessRuleViolationError } from '@delivery/shared/errors';

import { OrderStatus, OrderStatusEnum, Money, Address } from '../value-objects';

import { OrderItem } from './order-item.entity';

export interface OrderProps {
  id?: string;
  orderNumber?: string;
  retailerId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: Address;
  items?: OrderItem[];
  status?: OrderStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

export class Order {
  private readonly _id: string | undefined;
  private readonly _orderNumber: string;
  private readonly _retailerId: string;
  private readonly _customerId: string;
  private readonly _customerName: string;
  private readonly _customerEmail: string;
  private readonly _deliveryAddress: Address;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _notes: string | undefined;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _confirmedAt: Date | undefined;
  private _dispatchedAt: Date | undefined;
  private _deliveredAt: Date | undefined;
  private _cancelledAt: Date | undefined;

  private constructor(props: OrderProps) {
    this._id = props.id;
    this._orderNumber = props.orderNumber || Order.generateOrderNumber();
    this._retailerId = props.retailerId;
    this._customerId = props.customerId;
    this._customerName = props.customerName;
    this._customerEmail = props.customerEmail;
    this._deliveryAddress = props.deliveryAddress;
    this._items = props.items || [];
    this._status = props.status || OrderStatus.createDefault();
    this._notes = props.notes;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._confirmedAt = props.confirmedAt;
    this._dispatchedAt = props.dispatchedAt;
    this._deliveredAt = props.deliveredAt;
    this._cancelledAt = props.cancelledAt;
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  static create(props: OrderProps): Order {
    if (!props.retailerId || props.retailerId.trim().length === 0) {
      throw new Error('Retailer ID is required');
    }
    if (!props.customerId || props.customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }
    if (!props.customerName || props.customerName.trim().length === 0) {
      throw new Error('Customer name is required');
    }
    if (!props.customerEmail || props.customerEmail.trim().length === 0) {
      throw new Error('Customer email is required');
    }
    if (!props.deliveryAddress) {
      throw new Error('Delivery address is required');
    }

    return new Order({
      ...props,
      status: OrderStatus.createDefault(), // Always start as CREATED
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get orderNumber(): string {
    return this._orderNumber;
  }

  get retailerId(): string {
    return this._retailerId;
  }

  get customerId(): string {
    return this._customerId;
  }

  get customerName(): string {
    return this._customerName;
  }

  get customerEmail(): string {
    return this._customerEmail;
  }

  get deliveryAddress(): Address {
    return this._deliveryAddress;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get itemCount(): number {
    return this._items.length;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get confirmedAt(): Date | undefined {
    return this._confirmedAt;
  }

  get dispatchedAt(): Date | undefined {
    return this._dispatchedAt;
  }

  get deliveredAt(): Date | undefined {
    return this._deliveredAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  get totalAmount(): Money {
    if (this._items.length === 0) {
      return Money.zero();
    }

    return this._items.reduce((total, item) => total.add(item.totalPrice), Money.zero());
  }

  // Business methods
  addItem(item: OrderItem): void {
    if (this._status.isTerminal()) {
      throw new BusinessRuleViolationError('Cannot add items to a completed or cancelled order');
    }

    if (this._status.value !== OrderStatusEnum.CREATED) {
      throw new BusinessRuleViolationError('Can only add items to orders in CREATED status');
    }

    const existingItem = this._items.find(i => i.productId === item.productId);

    if (existingItem) {
      existingItem.updateQuantity(existingItem.quantity + item.quantity);
    } else {
      this._items.push(item);
    }

    this._updatedAt = new Date();
  }

  removeItem(productId: string): void {
    if (this._status.isTerminal()) {
      throw new BusinessRuleViolationError(
        'Cannot remove items from a completed or cancelled order'
      );
    }

    if (this._status.value !== OrderStatusEnum.CREATED) {
      throw new BusinessRuleViolationError('Can only remove items from orders in CREATED status');
    }

    const index = this._items.findIndex(i => i.productId === productId);
    if (index === -1) {
      throw new Error(`Item with product ID ${productId} not found`);
    }

    this._items.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    if (this._status.isTerminal()) {
      throw new BusinessRuleViolationError('Cannot update items in a completed or cancelled order');
    }

    if (this._status.value !== OrderStatusEnum.CREATED) {
      throw new BusinessRuleViolationError('Can only update items in orders in CREATED status');
    }

    const item = this._items.find(i => i.productId === productId);
    if (!item) {
      throw new Error(`Item with product ID ${productId} not found`);
    }

    item.updateQuantity(quantity);
    this._updatedAt = new Date();
  }

  // State transitions
  confirm(): void {
    const targetStatus = OrderStatus.create(OrderStatusEnum.CONFIRMED);

    if (!this._status.canTransitionTo(targetStatus)) {
      throw new InvalidStateTransitionError(this._status.value, OrderStatusEnum.CONFIRMED, 'Order');
    }

    // Business rule: An order with zero items cannot be moved to CONFIRMED
    if (this._items.length === 0) {
      throw new BusinessRuleViolationError('An order with zero items cannot be confirmed');
    }

    this._status = targetStatus;
    this._confirmedAt = new Date();
    this._updatedAt = new Date();
  }

  dispatch(): void {
    const targetStatus = OrderStatus.create(OrderStatusEnum.DISPATCHED);

    if (!this._status.canTransitionTo(targetStatus)) {
      throw new InvalidStateTransitionError(
        this._status.value,
        OrderStatusEnum.DISPATCHED,
        'Order'
      );
    }

    this._status = targetStatus;
    this._dispatchedAt = new Date();
    this._updatedAt = new Date();
  }

  deliver(): void {
    const targetStatus = OrderStatus.create(OrderStatusEnum.DELIVERED);

    if (!this._status.canTransitionTo(targetStatus)) {
      throw new InvalidStateTransitionError(this._status.value, OrderStatusEnum.DELIVERED, 'Order');
    }

    this._status = targetStatus;
    this._deliveredAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(): void {
    // Cancellation Policy: An order can ONLY be moved to CANCELLED
    // if its current state is CREATED or CONFIRMED
    if (!this._status.isCancellable()) {
      throw new BusinessRuleViolationError(
        `Order can only be cancelled when in CREATED or CONFIRMED status. Current status: ${this._status.value}`
      );
    }

    const targetStatus = OrderStatus.create(OrderStatusEnum.CANCELLED);
    this._status = targetStatus;
    this._cancelledAt = new Date();
    this._updatedAt = new Date();
  }

  transitionTo(targetStatusValue: string): void {
    const targetStatus = OrderStatus.create(targetStatusValue);

    if (this._status.isTerminal()) {
      throw new BusinessRuleViolationError(
        `Cannot transition from terminal state: ${this._status.value}`
      );
    }

    switch (targetStatus.value) {
      case OrderStatusEnum.CONFIRMED:
        this.confirm();
        break;
      case OrderStatusEnum.DISPATCHED:
        this.dispatch();
        break;
      case OrderStatusEnum.DELIVERED:
        this.deliver();
        break;
      case OrderStatusEnum.CANCELLED:
        this.cancel();
        break;
      default:
        throw new InvalidStateTransitionError(this._status.value, targetStatus.value, 'Order');
    }
  }

  updateNotes(notes: string | undefined): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id,
      orderNumber: this._orderNumber,
      retailerId: this._retailerId,
      customerId: this._customerId,
      customerName: this._customerName,
      customerEmail: this._customerEmail,
      deliveryAddress: this._deliveryAddress.toJSON(),
      items: this._items.map(item => item.toJSON()),
      itemCount: this.itemCount,
      status: this._status.value,
      totalAmount: this.totalAmount.toJSON(),
      notes: this._notes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      confirmedAt: this._confirmedAt?.toISOString(),
      dispatchedAt: this._dispatchedAt?.toISOString(),
      deliveredAt: this._deliveredAt?.toISOString(),
      cancelledAt: this._cancelledAt?.toISOString(),
    };
  }
}
