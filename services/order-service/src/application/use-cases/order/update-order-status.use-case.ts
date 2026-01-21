import { validateOrThrow } from '@delivery/shared/validation';

import { Order } from '../../../domain';
import { NotFoundError } from '../../../domain/errors';
import { IOrderRepository } from '../../../domain/repositories';
import { UpdateOrderStatusDTO, updateOrderStatusSchema, OrderResponseDTO } from '../../dtos';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, dto: UpdateOrderStatusDTO): Promise<OrderResponseDTO> {
    // Validate input
    const validatedDto = validateOrThrow(updateOrderStatusSchema, dto);

    // Find the order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    // Perform state transition (this will throw if invalid)
    order.transitionTo(validatedDto.status);

    // Persist the updated order
    const updatedOrder = await this.orderRepository.update(order);

    return this.mapToResponse(updatedOrder);
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
