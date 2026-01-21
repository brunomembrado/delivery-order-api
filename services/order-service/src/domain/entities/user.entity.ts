export enum UserRole {
  ADMIN = 'ADMIN',
  RETAILER = 'RETAILER',
}

export interface UserProps {
  id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  retailerId?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export class User {
  private readonly _id: string | undefined;
  private _email: string;
  private _password: string;
  private _name: string;
  private readonly _role: UserRole;
  private readonly _retailerId: string | undefined;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _lastLoginAt: Date | undefined;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email.toLowerCase();
    this._password = props.password;
    this._name = props.name;
    this._role = props.role;
    this._retailerId = props.retailerId;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._lastLoginAt = props.lastLoginAt;
  }

  static create(props: UserProps): User {
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('Email is required');
    }
    if (!props.password || props.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!Object.values(UserRole).includes(props.role)) {
      throw new Error('Invalid user role');
    }
    if (props.role === UserRole.RETAILER && !props.retailerId) {
      throw new Error('Retailer ID is required for retailer users');
    }

    return new User(props);
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): string | undefined {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get name(): string {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  get retailerId(): string | undefined {
    return this._retailerId;
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

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  // Check permissions
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  isRetailer(): boolean {
    return this._role === UserRole.RETAILER;
  }

  canManageRetailer(retailerId: string): boolean {
    return this.isAdmin() || (this.isRetailer() && this._retailerId === retailerId);
  }

  // Business methods
  updatePassword(hashedPassword: string): void {
    this._password = hashedPassword;
    this._updatedAt = new Date();
  }

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

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  toJSON(): object {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      retailerId: this._retailerId,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      lastLoginAt: this._lastLoginAt?.toISOString(),
    };
  }

  // Excludes sensitive data
  toPublicJSON(): object {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      retailerId: this._retailerId,
    };
  }
}
