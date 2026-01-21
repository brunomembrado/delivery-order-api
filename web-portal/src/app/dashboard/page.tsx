/**
 * @fileoverview Dashboard page component for order management.
 * Displays order statistics, order list with filtering, and order details modal.
 * @module app/dashboard/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  LogOut,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Order, OrderStats, OrderStatus } from '@/types';

/**
 * Configuration for order status display.
 * Maps each status to its label, CSS color class, and icon component.
 *
 * @constant
 * @type {Record<OrderStatus, { label: string; color: string; icon: React.ElementType }>}
 */
const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  CREATED: { label: 'Created', color: 'status-created', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'status-confirmed', icon: CheckCircle },
  DISPATCHED: { label: 'Dispatched', color: 'status-dispatched', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'status-delivered', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'status-cancelled', icon: XCircle },
};

/**
 * Dashboard page component for viewing and managing orders.
 *
 * Features:
 * - Order statistics cards showing counts by status
 * - Filterable order list with status, customer, and date info
 * - Quick actions for status transitions (Confirm, Dispatch, Deliver, Cancel)
 * - Order detail modal with full order information
 * - Real-time data refresh
 *
 * Requires authentication - redirects to login if unauthenticated.
 *
 * @returns Dashboard page with order management interface
 *
 * @example
 * ```tsx
 * // Accessed at '/dashboard'
 * // Displays order list and stats for authenticated users
 * ```
 */
export default function DashboardPage(): React.JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();

  /** List of orders fetched from the API */
  const [orders, setOrders] = useState<Order[]>([]);

  /** Order statistics grouped by status */
  const [stats, setStats] = useState<OrderStats | null>(null);

  /** Loading state for data fetching */
  const [isLoading, setIsLoading] = useState(true);

  /** Currently selected order for detail modal */
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /** Current status filter for order list */
  const [statusFilter, setStatusFilter] = useState<string>('');

  /**
   * Effect hook to redirect unauthenticated users to login.
   */
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  /**
   * Effect hook to initialize API client and fetch data when session is available.
   */
  useEffect(() => {
    if (session?.accessToken) {
      api.setAccessToken(session.accessToken as string);
      fetchData();
    }
  }, [session]);

  /**
   * Fetches orders and statistics from the API.
   * Applies the current status filter to the orders query.
   *
   * @async
   */
  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.getOrders({ status: statusFilter || undefined }),
        api.getOrderStats(),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates the status of an order and refreshes the data.
   *
   * @async
   * @param orderId - ID of the order to update
   * @param newStatus - New status to set
   */
  const handleStatusUpdate = async (orderId: string, newStatus: string): Promise<void> => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchData();
      setSelectedOrder(null);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  /**
   * Determines the next valid status in the order workflow.
   *
   * Status flow: CREATED → CONFIRMED → DISPATCHED → DELIVERED
   * DELIVERED and CANCELLED are terminal states.
   *
   * @param currentStatus - Current order status
   * @returns Next status in the workflow, or null if at terminal state
   */
  const getNextStatus = (currentStatus: OrderStatus): string | null => {
    const transitions: Record<OrderStatus, string | null> = {
      CREATED: 'CONFIRMED',
      CONFIRMED: 'DISPATCHED',
      DISPATCHED: 'DELIVERED',
      DELIVERED: null,
      CANCELLED: null,
    };
    return transitions[currentStatus];
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Delivery Order Portal
                </h1>
                <p className="text-sm text-gray-500">
                  {session?.user?.name} ({(session?.user as { role?: string })?.role})
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = stats[key as OrderStatus] || 0;
              return (
                <div
                  key={key}
                  className="card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setStatusFilter(key === statusFilter ? '' : key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{config.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                    <Icon className={`h-8 w-8 opacity-50`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchData();
              }}
              className="input w-48"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const config = statusConfig[order.status];
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.itemCount} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </button>
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, nextStatus)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {nextStatus === 'CONFIRMED' && 'Confirm'}
                            {nextStatus === 'DISPATCHED' && 'Dispatch'}
                            {nextStatus === 'DELIVERED' && 'Deliver'}
                          </button>
                        )}
                        {(order.status === 'CREATED' ||
                          order.status === 'CONFIRMED') && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order.id, 'CANCELLED')
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Order {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Status
                  </h3>
                  <span
                    className={`status-badge ${
                      statusConfig[selectedOrder.status].color
                    }`}
                  >
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Customer
                  </h3>
                  <p className="text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Delivery Address
                  </h3>
                  <p className="text-gray-900">
                    {selectedOrder.deliveryAddress.street}
                    <br />
                    {selectedOrder.deliveryAddress.city},{' '}
                    {selectedOrder.deliveryAddress.state}{' '}
                    {selectedOrder.deliveryAddress.postalCode}
                    <br />
                    {selectedOrder.deliveryAddress.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Items
                  </h3>
                  <div className="border rounded-md divide-y">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="p-3 flex items-center justify-between bg-gray-50">
                      <p className="font-medium">Total</p>
                      <p className="font-bold text-lg">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Notes
                    </h3>
                    <p className="text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Timeline
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    {selectedOrder.confirmedAt && (
                      <p>
                        Confirmed:{' '}
                        {new Date(selectedOrder.confirmedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedOrder.dispatchedAt && (
                      <p>
                        Dispatched:{' '}
                        {new Date(selectedOrder.dispatchedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedOrder.deliveredAt && (
                      <p>
                        Delivered:{' '}
                        {new Date(selectedOrder.deliveredAt).toLocaleString()}
                      </p>
                    )}
                    {selectedOrder.cancelledAt && (
                      <p>
                        Cancelled:{' '}
                        {new Date(selectedOrder.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
