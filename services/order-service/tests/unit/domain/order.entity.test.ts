import {
  Order,
  OrderItem,
  Address,
  Money,
  OrderStatus,
  OrderStatusEnum,
} from '../../../src/domain';
import {
  InvalidStateTransitionError,
  BusinessRuleViolationError,
} from '../../../src/domain/errors';

describe('Order Entity', () => {
  const createTestAddress = () =>
    Address.create({
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    });

  const createTestOrderItem = () =>
    OrderItem.create({
      productId: 'prod-1',
      productName: 'Test Product',
      quantity: 2,
      unitPrice: Money.create(10.99, 'USD'),
    });

  const createTestOrder = (items: OrderItem[] = []) =>
    Order.create({
      retailerId: 'retailer-1',
      customerId: 'customer-1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      deliveryAddress: createTestAddress(),
      items,
    });

  describe('Order Creation', () => {
    it('should create an order with default CREATED status', () => {
      const order = createTestOrder();

      expect(order.status.value).toBe(OrderStatusEnum.CREATED);
      expect(order.retailerId).toBe('retailer-1');
      expect(order.customerId).toBe('customer-1');
      expect(order.customerName).toBe('John Doe');
      expect(order.customerEmail).toBe('john@example.com');
      expect(order.orderNumber).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD-/);
    });

    it('should generate unique order numbers', () => {
      const order1 = createTestOrder();
      const order2 = createTestOrder();

      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it('should throw error if retailerId is missing', () => {
      expect(() =>
        Order.create({
          retailerId: '',
          customerId: 'customer-1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: createTestAddress(),
        })
      ).toThrow('Retailer ID is required');
    });

    it('should throw error if customerEmail is missing', () => {
      expect(() =>
        Order.create({
          retailerId: 'retailer-1',
          customerId: 'customer-1',
          customerName: 'John Doe',
          customerEmail: '',
          deliveryAddress: createTestAddress(),
        })
      ).toThrow('Customer email is required');
    });
  });

  describe('Order Items Management', () => {
    it('should add items to order in CREATED status', () => {
      const order = createTestOrder();
      const item = createTestOrderItem();

      order.addItem(item);

      expect(order.itemCount).toBe(1);
      expect(order.items[0].productId).toBe('prod-1');
    });

    it('should calculate total amount correctly', () => {
      const order = createTestOrder();
      const item1 = OrderItem.create({
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        unitPrice: Money.create(10, 'USD'),
      });
      const item2 = OrderItem.create({
        productId: 'prod-2',
        productName: 'Product 2',
        quantity: 3,
        unitPrice: Money.create(5, 'USD'),
      });

      order.addItem(item1);
      order.addItem(item2);

      // (2 * 10) + (3 * 5) = 20 + 15 = 35
      expect(order.totalAmount.amount).toBe(35);
    });

    it('should merge quantities for same product', () => {
      const order = createTestOrder();
      const item1 = OrderItem.create({
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 2,
        unitPrice: Money.create(10, 'USD'),
      });
      const item2 = OrderItem.create({
        productId: 'prod-1',
        productName: 'Product 1',
        quantity: 3,
        unitPrice: Money.create(10, 'USD'),
      });

      order.addItem(item1);
      order.addItem(item2);

      expect(order.itemCount).toBe(1);
      expect(order.items[0].quantity).toBe(5);
    });

    it('should remove items from order', () => {
      const order = createTestOrder();
      order.addItem(createTestOrderItem());

      expect(order.itemCount).toBe(1);

      order.removeItem('prod-1');

      expect(order.itemCount).toBe(0);
    });

    it('should throw error when removing non-existent item', () => {
      const order = createTestOrder();

      expect(() => order.removeItem('non-existent')).toThrow(
        'Item with product ID non-existent not found'
      );
    });
  });

  describe('Order State Transitions', () => {
    describe('CREATED -> CONFIRMED', () => {
      it('should transition to CONFIRMED with items', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());

        order.confirm();

        expect(order.status.value).toBe(OrderStatusEnum.CONFIRMED);
        expect(order.confirmedAt).toBeDefined();
      });

      it('should throw BusinessRuleViolationError when confirming with zero items', () => {
        const order = createTestOrder();

        expect(() => order.confirm()).toThrow(BusinessRuleViolationError);
        expect(() => order.confirm()).toThrow('An order with zero items cannot be confirmed');
      });
    });

    describe('CONFIRMED -> DISPATCHED', () => {
      it('should transition to DISPATCHED from CONFIRMED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();

        order.dispatch();

        expect(order.status.value).toBe(OrderStatusEnum.DISPATCHED);
        expect(order.dispatchedAt).toBeDefined();
      });

      it('should not transition to DISPATCHED from CREATED', () => {
        const order = createTestOrder();

        expect(() => order.dispatch()).toThrow(InvalidStateTransitionError);
      });
    });

    describe('DISPATCHED -> DELIVERED', () => {
      it('should transition to DELIVERED from DISPATCHED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();
        order.dispatch();

        order.deliver();

        expect(order.status.value).toBe(OrderStatusEnum.DELIVERED);
        expect(order.deliveredAt).toBeDefined();
      });

      it('should not transition to DELIVERED from CONFIRMED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();

        expect(() => order.deliver()).toThrow(InvalidStateTransitionError);
      });
    });

    describe('Cancellation', () => {
      it('should cancel order from CREATED status', () => {
        const order = createTestOrder();

        order.cancel();

        expect(order.status.value).toBe(OrderStatusEnum.CANCELLED);
        expect(order.cancelledAt).toBeDefined();
      });

      it('should cancel order from CONFIRMED status', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();

        order.cancel();

        expect(order.status.value).toBe(OrderStatusEnum.CANCELLED);
      });

      it('should NOT cancel order from DISPATCHED status', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();
        order.dispatch();

        expect(() => order.cancel()).toThrow(BusinessRuleViolationError);
        expect(() => order.cancel()).toThrow(
          'Order can only be cancelled when in CREATED or CONFIRMED status'
        );
      });

      it('should NOT cancel order from DELIVERED status', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();
        order.dispatch();
        order.deliver();

        expect(() => order.cancel()).toThrow(BusinessRuleViolationError);
      });
    });

    describe('Terminal States', () => {
      it('should not allow transitions from DELIVERED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();
        order.dispatch();
        order.deliver();

        expect(() => order.transitionTo('CONFIRMED')).toThrow(BusinessRuleViolationError);
      });

      it('should not allow transitions from CANCELLED', () => {
        const order = createTestOrder();
        order.cancel();

        expect(() => order.transitionTo('CONFIRMED')).toThrow(BusinessRuleViolationError);
      });
    });

    describe('Item Modification Restrictions', () => {
      it('should not add items after CONFIRMED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();

        expect(() =>
          order.addItem(
            OrderItem.create({
              productId: 'prod-2',
              productName: 'Product 2',
              quantity: 1,
              unitPrice: Money.create(5, 'USD'),
            })
          )
        ).toThrow(BusinessRuleViolationError);
      });

      it('should not remove items after CONFIRMED', () => {
        const order = createTestOrder();
        order.addItem(createTestOrderItem());
        order.confirm();

        expect(() => order.removeItem('prod-1')).toThrow(BusinessRuleViolationError);
      });
    });
  });

  describe('Order Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const order = createTestOrder();
      order.addItem(createTestOrderItem());

      const json = order.toJSON();

      expect(json).toHaveProperty('orderNumber');
      expect(json).toHaveProperty('retailerId', 'retailer-1');
      expect(json).toHaveProperty('status', 'CREATED');
      expect(json).toHaveProperty('items');
      expect(json).toHaveProperty('totalAmount');
    });
  });
});
