/**
 * Address Value Object
 * Represents a delivery address
 */
export interface AddressProps {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class Address {
  private readonly _street: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _postalCode: string;
  private readonly _country: string;

  private constructor(props: AddressProps) {
    this._street = props.street;
    this._city = props.city;
    this._state = props.state;
    this._postalCode = props.postalCode;
    this._country = props.country;
  }

  static create(props: AddressProps): Address {
    if (!props.street || props.street.trim().length === 0) {
      throw new Error('Street is required');
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (!props.state || props.state.trim().length === 0) {
      throw new Error('State is required');
    }
    if (!props.postalCode || props.postalCode.trim().length === 0) {
      throw new Error('Postal code is required');
    }
    if (!props.country || props.country.trim().length === 0) {
      throw new Error('Country is required');
    }

    return new Address({
      street: props.street.trim(),
      city: props.city.trim(),
      state: props.state.trim(),
      postalCode: props.postalCode.trim(),
      country: props.country.trim(),
    });
  }

  get street(): string {
    return this._street;
  }

  get city(): string {
    return this._city;
  }

  get state(): string {
    return this._state;
  }

  get postalCode(): string {
    return this._postalCode;
  }

  get country(): string {
    return this._country;
  }

  equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._city === other._city &&
      this._state === other._state &&
      this._postalCode === other._postalCode &&
      this._country === other._country
    );
  }

  format(): string {
    return `${this._street}, ${this._city}, ${this._state} ${this._postalCode}, ${this._country}`;
  }

  toString(): string {
    return this.format();
  }

  toJSON(): AddressProps {
    return {
      street: this._street,
      city: this._city,
      state: this._state,
      postalCode: this._postalCode,
      country: this._country,
    };
  }
}
