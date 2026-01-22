import { validateOrThrow } from '@delivery/shared/validation';

import { Order } from '../../../domain';
import { IOrderRepository, OrderFilters, PaginationOptions } from '../../../domain/repositories';
import { OrderStatusEnum } from '../../../domain/value-objects';
import {
  OrderFilterDTO,
  PaginationDTO,
  PaginatedOrdersResponseDTO,
  OrderResponseDTO,
  orderFilterSchema,
  paginationSchema,
} from '../../dtos';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    filterDto?: OrderFilterDTO,
    paginationDto?: PaginationDTO
  ): Promise<PaginatedOrdersResponseDTO> {
    // Validate filters if provided
    const validatedFilters = filterDto ? validateOrThrow(orderFilterSchema, filterDto) : {};
    const filters: OrderFilters = {
      ...validatedFilters,
      status: validatedFilters.status as OrderStatusEnum | undefined,
    };

    // Validate and set default pagination (schema has defaults, but TS needs explicit fallbacks)
    const validatedPagination = validateOrThrow(paginationSchema, paginationDto ?? {});
    const pagination: PaginationOptions = {
      page: validatedPagination.page ?? 1,
      limit: validatedPagination.limit ?? 10,
      sortBy: validatedPagination.sortBy,
      sortOrder: validatedPagination.sortOrder,
    };

    const result = await this.orderRepository.findAll(filters, pagination);

    return {
      orders: result.orders.map(order => this.mapToResponse(order)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrevious: result.page > 1,
      },
    };
  }

  async executeByRetailer(
    retailerId: string,
    paginationDto?: PaginationDTO
  ): Promise<PaginatedOrdersResponseDTO> {
    const validatedPagination = validateOrThrow(paginationSchema, paginationDto ?? {});
    const pagination: PaginationOptions = {
      page: validatedPagination.page ?? 1,
      limit: validatedPagination.limit ?? 10,
      sortBy: validatedPagination.sortBy,
      sortOrder: validatedPagination.sortOrder,
    };

    const result = await this.orderRepository.findByRetailerId(retailerId, pagination);

    return {
      orders: result.orders.map(order => this.mapToResponse(order)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrevious: result.page > 1,
      },
    };
  }

  private mapToResponse(order: Order): OrderResponseDTO {
    return {
      id: order.id!,
      orderNumber: order.orderNumber,
      retailerId: order.retailerId,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress.toJSON(),
      items: order.items.map(item => ({
        id: item.id!,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
        currency: item.unitPrice.currency,
        totalPrice: item.totalPrice.amount,
      })),
      itemCount: order.itemCount,
      status: order.status.value,
      totalAmount: order.totalAmount.amount,
      currency: order.totalAmount.currency,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString(),
      dispatchedAt: order.dispatchedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString(),
    };
  }
}
