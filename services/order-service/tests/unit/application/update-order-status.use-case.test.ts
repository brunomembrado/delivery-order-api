import { UpdateOrderStatusUseCase } from '../../../src/application/use-cases';
import { Order, OrderItem, Address, Money, OrderStatusEnum } from '../../../src/domain';
import {
  NotFoundError,
  InvalidStateTransitionError,
  BusinessRuleViolationError,
} from '../../../src/domain/errors';
import { IOrderRepository } from '../../../src/domain/repositories';

describe('UpdateOrderStatusUseCase', () => {
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let useCase: UpdateOrderStatusUseCase;

  const createTestOrder = (status: string = 'CREATED', withItems: boolean = true) => {
    const order = Order.reconstitute({
      id: 'order-1',
      orderNumber: 'ORD-TEST-001',
      retailerId: 'retailer-1',
      customerId: 'customer-1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      deliveryAddress: Address.create({
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'USA',
      }),
      items: withItems
        ? [
            OrderItem.reconstitute({
              id: 'item-1',
              orderId: 'order-1',
              productId: 'prod-1',
              productName: 'Test Product',
              quantity: 2,
              unitPrice: Money.create(10.99, 'USD'),
            }),
          ]
        : [],
      status: require('../../../src/domain/value-objects').OrderStatus.create(status),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return order;
  };

  beforeEach(() => {
    mockOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      findAll: jest.fn(),
      findByRetailerId: jest.fn(),
      findByCustomerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      countByStatus: jest.fn(),
    };

    useCase = new UpdateOrderStatusUseCase(mockOrderRepository);
  });

  describe('CREATED -> CONFIRMED', () => {
    it('should confirm order with items', async () => {
      const order = createTestOrder('CREATED', true);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockImplementation(async o => o);

      const result = await useCase.execute('order-1', { status: 'CONFIRMED' });

      expect(result.status).toBe(OrderStatusEnum.CONFIRMED);
      expect(mockOrderRepository.update).toHaveBeenCalled();
    });

    it('should throw error when confirming order without items', async () => {
      const order = createTestOrder('CREATED', false);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'CONFIRMED' })).rejects.toThrow(
        BusinessRuleViolationError
      );
    });
  });

  describe('CONFIRMED -> DISPATCHED', () => {
    it('should dispatch confirmed order', async () => {
      const order = createTestOrder('CONFIRMED', true);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockImplementation(async o => o);

      const result = await useCase.execute('order-1', { status: 'DISPATCHED' });

      expect(result.status).toBe(OrderStatusEnum.DISPATCHED);
    });

    it('should throw error when dispatching from CREATED', async () => {
      const order = createTestOrder('CREATED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'DISPATCHED' })).rejects.toThrow(
        InvalidStateTransitionError
      );
    });
  });

  describe('DISPATCHED -> DELIVERED', () => {
    it('should deliver dispatched order', async () => {
      const order = createTestOrder('DISPATCHED', true);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockImplementation(async o => o);

      const result = await useCase.execute('order-1', { status: 'DELIVERED' });

      expect(result.status).toBe(OrderStatusEnum.DELIVERED);
    });

    it('should throw error when delivering from CONFIRMED', async () => {
      const order = createTestOrder('CONFIRMED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'DELIVERED' })).rejects.toThrow(
        InvalidStateTransitionError
      );
    });
  });

  describe('Cancellation', () => {
    it('should cancel order from CREATED', async () => {
      const order = createTestOrder('CREATED', true);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockImplementation(async o => o);

      const result = await useCase.execute('order-1', { status: 'CANCELLED' });

      expect(result.status).toBe(OrderStatusEnum.CANCELLED);
    });

    it('should cancel order from CONFIRMED', async () => {
      const order = createTestOrder('CONFIRMED', true);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockImplementation(async o => o);

      const result = await useCase.execute('order-1', { status: 'CANCELLED' });

      expect(result.status).toBe(OrderStatusEnum.CANCELLED);
    });

    it('should throw error when cancelling from DISPATCHED', async () => {
      const order = createTestOrder('DISPATCHED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'CANCELLED' })).rejects.toThrow(
        BusinessRuleViolationError
      );
    });

    it('should throw error when cancelling from DELIVERED', async () => {
      const order = createTestOrder('DELIVERED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'CANCELLED' })).rejects.toThrow(
        BusinessRuleViolationError
      );
    });
  });

  describe('Terminal States', () => {
    it('should throw error when transitioning from DELIVERED', async () => {
      const order = createTestOrder('DELIVERED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'CONFIRMED' })).rejects.toThrow(
        BusinessRuleViolationError
      );
    });

    it('should throw error when transitioning from CANCELLED', async () => {
      const order = createTestOrder('CANCELLED', true);
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(useCase.execute('order-1', { status: 'CONFIRMED' })).rejects.toThrow(
        BusinessRuleViolationError
      );
    });
  });

  describe('Not Found', () => {
    it('should throw NotFoundError when order does not exist', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent', { status: 'CONFIRMED' })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid status', async () => {
      await expect(useCase.execute('order-1', { status: 'INVALID' as never })).rejects.toThrow();
    });
  });
});
