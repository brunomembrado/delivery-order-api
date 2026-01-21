import { validateOrThrow } from '@delivery/shared/validation';

import { Order, OrderItem, Address, Money } from '../../../domain';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { IOrderRepository, IRetailerRepository } from '../../../domain/repositories';
import { CreateOrderDTO, createOrderSchema, OrderResponseDTO } from '../../dtos';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly retailerRepository: IRetailerRepository
  ) {}

  async execute(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    // Validate input
    const validatedDto = validateOrThrow(createOrderSchema, dto);

    // Verify retailer exists
    const retailerExists = await this.retailerRepository.exists(validatedDto.retailerId);
    if (!retailerExists) {
      throw new NotFoundError('Retailer', validatedDto.retailerId);
    }

    // Create delivery address
    const deliveryAddress = Address.create({
      street: validatedDto.deliveryAddress.street,
      city: validatedDto.deliveryAddress.city,
      state: validatedDto.deliveryAddress.state,
      postalCode: validatedDto.deliveryAddress.postalCode,
      country: validatedDto.deliveryAddress.country,
    });

    // Create order entity
    const order = Order.create({
      retailerId: validatedDto.retailerId,
      customerId: validatedDto.customerId,
      customerName: validatedDto.customerName,
      customerEmail: validatedDto.customerEmail,
      deliveryAddress,
      notes: validatedDto.notes,
    });

    // Add items if provided
    if (validatedDto.items && validatedDto.items.length > 0) {
      for (const itemDto of validatedDto.items) {
        const orderItem = OrderItem.create({
          productId: itemDto.productId,
          productName: itemDto.productName,
          quantity: itemDto.quantity,
          unitPrice: Money.create(itemDto.unitPrice, itemDto.currency || 'USD'),
        });
        order.addItem(orderItem);
      }
    }

    // Persist order
    const createdOrder = await this.orderRepository.create(order);

    return this.mapToResponse(createdOrder);
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
