'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/types';

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface FormErrors {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  items?: string;
  general?: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  retailerId?: string;
}

const initialItem: OrderItemInput = {
  productId: '',
  productName: '',
  quantity: 1,
  unitPrice: 0,
};

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
  retailerId,
}: CreateOrderModalProps): React.JSX.Element | null {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Customer fields
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Items
  const [items, setItems] = useState<OrderItemInput[]>([{ ...initialItem }]);

  // Notes
  const [notes, setNotes] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Customer validation
    if (!customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!validateEmail(customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }

    // Address validation
    if (!street.trim()) {
      newErrors.street = 'Street is required';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Items validation
    const validItems = items.filter(
      item =>
        item.productId.trim() && item.productName.trim() && item.quantity > 0 && item.unitPrice >= 0
    );
    if (validItems.length === 0) {
      newErrors.items = 'At least one valid item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = (): void => {
    setItems([...items, { ...initialItem }]);
  };

  const handleRemoveItem = (index: number): void => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: string | number
  ): void => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const resetForm = (): void => {
    setCustomerId('');
    setCustomerName('');
    setCustomerEmail('');
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
    setItems([{ ...initialItem }]);
    setNotes('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const validItems = items.filter(
        item =>
          item.productId.trim() &&
          item.productName.trim() &&
          item.quantity > 0 &&
          item.unitPrice >= 0
      );

      const response = await api.createOrder({
        retailerId: retailerId,
        customerId: customerId.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        items: validItems,
        notes: notes.trim() || undefined,
      });

      if (response.data) {
        onSuccess(response.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      setErrors({
        general: (error as Error).message || 'Failed to create order',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Order</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID *
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className={`input w-full ${errors.customerId ? 'border-red-500' : ''}`}
                  placeholder="e.g., CUST-001"
                />
                {errors.customerId && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={`input w-full ${errors.customerName ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className={`input w-full ${errors.customerEmail ? 'border-red-500' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className={`input w-full ${errors.street ? 'border-red-500' : ''}`}
                  placeholder="123 Main Street"
                />
                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className={`input w-full ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="New York"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className={`input w-full ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="NY"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className={`input w-full ${errors.postalCode ? 'border-red-500' : ''}`}
                  placeholder="10001"
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className={`input w-full ${errors.country ? 'border-red-500' : ''}`}
                  placeholder="USA"
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Order Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
            {errors.items && <p className="text-red-500 text-sm mb-2">{errors.items}</p>}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm text-gray-600">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product ID
                      </label>
                      <input
                        type="text"
                        value={item.productId}
                        onChange={e => handleItemChange(index, 'productId', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="PROD-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => handleItemChange(index, 'productName', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e =>
                          handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="input w-full text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="input w-full"
              placeholder="Any special instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Creating...' : 'Create Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
