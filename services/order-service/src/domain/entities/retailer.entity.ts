import { Address, AddressProps } from '../value-objects';

export interface RetailerProps {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Retailer {
  private readonly _id: string | undefined;
  private _name: string;
  private _email: string;
  private _phone: string | undefined;
  private _address: Address | undefined;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: RetailerProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email.toLowerCase();
    this._phone = props.phone;
    this._address = props.address;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  static create(props: RetailerProps): Retailer {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    return new Retailer(props);
  }

  static reconstitute(props: RetailerProps): Retailer {
    return new Retailer(props);
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get address(): Address | undefined {
    return this._address;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  updateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    this._email = email.toLowerCase();
    this._updatedAt = new Date();
  }

  updatePhone(phone: string | undefined): void {
    this._phone = phone;
    this._updatedAt = new Date();
  }

  updateAddress(addressProps: AddressProps): void {
    this._address = Address.create(addressProps);
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone,
      address: this._address?.toJSON(),
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
