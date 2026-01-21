import { Order } from '../../../domain';
import { NotFoundError } from '../../../domain/errors';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderResponseDTO } from '../../dtos';

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    return this.mapToResponse(order);
  }

  async executeByOrderNumber(orderNumber: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      throw new NotFoundError('Order', orderNumber);
    }

    return this.mapToResponse(order);
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
