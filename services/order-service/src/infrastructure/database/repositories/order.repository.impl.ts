import { PrismaClient, OrderStatus as PrismaOrderStatus } from '@prisma/client';

import { Order, OrderItem, Address, Money, OrderStatus, OrderStatusEnum } from '../../../domain';
import {
  IOrderRepository,
  OrderFilters,
  PaginationOptions,
  PaginatedOrders,
} from '../../../domain/repositories';

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(order: Order): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        retailerId: order.retailerId,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        deliveryStreet: order.deliveryAddress.street,
        deliveryCity: order.deliveryAddress.city,
        deliveryState: order.deliveryAddress.state,
        deliveryPostalCode: order.deliveryAddress.postalCode,
        deliveryCountry: order.deliveryAddress.country,
        status: order.status.value as PrismaOrderStatus,
        notes: order.notes,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.amount,
            currency: item.unitPrice.currency,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    return this.mapToDomain(order);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    return this.mapToDomain(order);
  }

  async findAll(filters?: OrderFilters, pagination?: PaginationOptions): Promise<PaginatedOrders> {
    const where = this.buildWhereClause(filters);
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        skip,
        take: limit,
        orderBy: {
          [pagination?.sortBy || 'createdAt']: pagination?.sortOrder || 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(order => this.mapToDomain(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByRetailerId(
    retailerId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedOrders> {
    return this.findAll({ retailerId }, pagination);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.mapToDomain(order));
  }

  async update(order: Order): Promise<Order> {
    // Delete existing items and recreate them
    await this.prisma.orderItem.deleteMany({
      where: { orderId: order.id },
    });

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status.value as PrismaOrderStatus,
        notes: order.notes,
        confirmedAt: order.confirmedAt,
        dispatchedAt: order.dispatchedAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.amount,
            currency: item.unitPrice.currency,
          })),
        },
      },
      include: { items: true },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!order;
  }

  async countByStatus(retailerId?: string): Promise<Record<OrderStatusEnum, number>> {
    const where = retailerId ? { retailerId } : {};

    const counts = await this.prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const result: Record<OrderStatusEnum, number> = {
      [OrderStatusEnum.CREATED]: 0,
      [OrderStatusEnum.CONFIRMED]: 0,
      [OrderStatusEnum.DISPATCHED]: 0,
      [OrderStatusEnum.DELIVERED]: 0,
      [OrderStatusEnum.CANCELLED]: 0,
    };

    counts.forEach(count => {
      result[count.status as OrderStatusEnum] = count._count.status;
    });

    return result;
  }

  private buildWhereClause(filters?: OrderFilters): Record<string, unknown> {
    if (!filters) {
      return {};
    }

    const where: Record<string, unknown> = {};

    if (filters.retailerId) {
      where.retailerId = filters.retailerId;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.orderNumber) {
      where.orderNumber = { contains: filters.orderNumber, mode: 'insensitive' };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, Date>).lte = filters.endDate;
      }
    }

    return where;
  }

  private mapToDomain(data: {
    id: string;
    orderNumber: string;
    retailerId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    deliveryStreet: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryPostalCode: string;
    deliveryCountry: string;
    status: PrismaOrderStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    dispatchedAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    items: Array<{
      id: string;
      orderId: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: { toNumber(): number } | number;
      currency: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): Order {
    const items = data.items.map(item =>
      OrderItem.reconstitute({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Money.create(
          typeof item.unitPrice === 'number' ? item.unitPrice : item.unitPrice.toNumber(),
          item.currency
        ),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    );

    return Order.reconstitute({
      id: data.id,
      orderNumber: data.orderNumber,
      retailerId: data.retailerId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      deliveryAddress: Address.create({
        street: data.deliveryStreet,
        city: data.deliveryCity,
        state: data.deliveryState,
        postalCode: data.deliveryPostalCode,
        country: data.deliveryCountry,
      }),
      items,
      status: OrderStatus.create(data.status),
      notes: data.notes || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      confirmedAt: data.confirmedAt || undefined,
      dispatchedAt: data.dispatchedAt || undefined,
      deliveredAt: data.deliveredAt || undefined,
      cancelledAt: data.cancelledAt || undefined,
    });
  }
}
