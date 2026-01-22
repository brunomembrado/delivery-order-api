'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';

interface OrderItemInput {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  isNew?: boolean;
}

interface FormErrors {
  items?: string;
  general?: string;
}

interface EditOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  CREATED: { label: 'Created', color: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-yellow-100 text-yellow-800' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function EditOrderModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}: EditOrderModalProps): React.JSX.Element | null {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [newItemsToAdd, setNewItemsToAdd] = useState<OrderItemInput[]>([]);
  const [itemsToRemove, setItemsToRemove] = useState<string[]>([]);

  const canEdit = order?.status === 'CREATED';

  useEffect(() => {
    if (order) {
      setItems(
        order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );
      setNewItemsToAdd([]);
      setItemsToRemove([]);
      setErrors({});
    }
  }, [order]);

  const handleAddNewItem = (): void => {
    setNewItemsToAdd([
      ...newItemsToAdd,
      {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        isNew: true,
      },
    ]);
  };

  const handleRemoveExistingItem = (productId: string): void => {
    setItemsToRemove([...itemsToRemove, productId]);
    setItems(items.filter(item => item.productId !== productId));
  };

  const handleRemoveNewItem = (index: number): void => {
    setNewItemsToAdd(newItemsToAdd.filter((_, i) => i !== index));
  };

  const handleNewItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: string | number
  ): void => {
    const updated = [...newItemsToAdd];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setNewItemsToAdd(updated);
  };

  const calculateTotal = (): number => {
    const existingTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const newTotal = newItemsToAdd.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return existingTotal + newTotal;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if there are valid new items to add
    const validNewItems = newItemsToAdd.filter(
      item =>
        item.productId.trim() && item.productName.trim() && item.quantity > 0 && item.unitPrice >= 0
    );

    // Check if all new items have required fields filled
    const invalidNewItems = newItemsToAdd
      .filter(
        item =>
          item.productId.trim() ||
          item.productName.trim() ||
          item.quantity !== 1 ||
          item.unitPrice !== 0
      )
      .filter(
        item =>
          !item.productId.trim() ||
          !item.productName.trim() ||
          item.quantity <= 0 ||
          item.unitPrice < 0
      );

    if (invalidNewItems.length > 0) {
      newErrors.items = 'Please fill all fields for new items';
    }

    // Check if at least one item remains
    if (items.length === 0 && validNewItems.length === 0) {
      newErrors.items = 'Order must have at least one item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!order || !canEdit) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Remove items
      for (const productId of itemsToRemove) {
        await api.removeOrderItem(order.id, productId);
      }

      // Add new items
      const validNewItems = newItemsToAdd.filter(
        item =>
          item.productId.trim() &&
          item.productName.trim() &&
          item.quantity > 0 &&
          item.unitPrice >= 0
      );

      for (const item of validNewItems) {
        await api.addOrderItem(order.id, {
          productId: item.productId.trim(),
          productName: item.productName.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      setErrors({
        general: (error as Error).message || 'Failed to update order',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (!isSubmitting) {
      setErrors({});
      setNewItemsToAdd([]);
      setItemsToRemove([]);
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{canEdit ? 'Edit Order' : 'Order Details'}</h2>
            <p className="text-sm text-gray-500">{order.orderNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig[order.status].color
              }`}
            >
              {statusConfig[order.status].label}
            </span>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {!canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Read-only mode</p>
                <p className="text-sm">
                  This order cannot be edited because it is in {order.status} status. Only orders in
                  CREATED status can be modified.
                </p>
              </div>
            </div>
          )}

          {/* Customer Information (Read-only) */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Customer ID</label>
                <p className="text-gray-900">{order.customerId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Customer Name
                </label>
                <p className="text-gray-900">{order.customerName}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Customer Email
                </label>
                <p className="text-gray-900">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address (Read-only) */}
          <div>
            <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
            <p className="text-gray-900">
              {order.deliveryAddress.street}
              <br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
              {order.deliveryAddress.postalCode}
              <br />
              {order.deliveryAddress.country}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Order Items</h3>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="btn-secondary flex items-center space-x-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              )}
            </div>
            {errors.items && <p className="text-red-500 text-sm mb-2">{errors.items}</p>}

            {/* Existing Items */}
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id || item.productId}
                  className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      ID: {item.productId} | Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingItem(item.productId)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* New Items to Add */}
              {newItemsToAdd.map((item, index) => (
                <div
                  key={`new-${index}`}
                  className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm text-primary-700">New Item</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product ID *
                      </label>
                      <input
                        type="text"
                        value={item.productId}
                        onChange={e => handleNewItemChange(index, 'productId', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="PROD-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => handleNewItemChange(index, 'productName', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e =>
                          handleNewItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unit Price ($) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e =>
                          handleNewItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="input w-full text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && newItemsToAdd.length === 0 && (
                <div className="text-center py-8 text-gray-500">No items in this order</div>
              )}
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{order.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium mb-4">Timeline</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
              {order.confirmedAt && (
                <p>Confirmed: {new Date(order.confirmedAt).toLocaleString()}</p>
              )}
              {order.dispatchedAt && (
                <p>Dispatched: {new Date(order.dispatchedAt).toLocaleString()}</p>
              )}
              {order.deliveredAt && (
                <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>
              )}
              {order.cancelledAt && (
                <p>Cancelled: {new Date(order.cancelledAt).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              {canEdit ? 'Cancel' : 'Close'}
            </button>
            {canEdit && (itemsToRemove.length > 0 || newItemsToAdd.length > 0) && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
