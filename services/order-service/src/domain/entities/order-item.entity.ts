import { Money } from '../value-objects';

export interface OrderItemProps {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrderItem {
  private readonly _id: string | undefined;
  private _orderId: string | undefined;
  private readonly _productId: string;
  private readonly _productName: string;
  private _quantity: number;
  private readonly _unitPrice: Money;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrderItemProps) {
    this._id = props.id;
    this._orderId = props.orderId;
    this._productId = props.productId;
    this._productName = props.productName;
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  static create(props: OrderItemProps): OrderItem {
    if (!props.productId || props.productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }
    if (!props.productName || props.productName.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
    if (!props.unitPrice || props.unitPrice.amount <= 0) {
      throw new Error('Unit price must be positive');
    }

    return new OrderItem(props);
  }

  static reconstitute(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  get id(): string | undefined {
    return this._id;
  }

  get orderId(): string | undefined {
    return this._orderId;
  }

  get productId(): string {
    return this._productId;
  }

  get productName(): string {
    return this._productName;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get totalPrice(): Money {
    return this._unitPrice.multiply(this._quantity);
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  setOrderId(orderId: string): void {
    this._orderId = orderId;
  }

  updateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
    this._quantity = quantity;
    this._updatedAt = new Date();
  }

  equals(other: OrderItem): boolean {
    if (this._id && other._id) {
      return this._id === other._id;
    }
    return this._productId === other._productId;
  }

  toJSON(): object {
    return {
      id: this._id,
      orderId: this._orderId,
      productId: this._productId,
      productName: this._productName,
      quantity: this._quantity,
      unitPrice: this._unitPrice.toJSON(),
      totalPrice: this.totalPrice.toJSON(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
