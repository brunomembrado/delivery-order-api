import { OrderStatus, OrderStatusEnum } from '../../../src/domain/value-objects';

describe('OrderStatus Value Object', () => {
  describe('Creation', () => {
    it('should create status from valid string', () => {
      const status = OrderStatus.create('CREATED');

      expect(status.value).toBe(OrderStatusEnum.CREATED);
    });

    it('should handle case insensitive input', () => {
      const status = OrderStatus.create('created');

      expect(status.value).toBe(OrderStatusEnum.CREATED);
    });

    it('should create default status as CREATED', () => {
      const status = OrderStatus.createDefault();

      expect(status.value).toBe(OrderStatusEnum.CREATED);
    });

    it('should throw error for invalid status', () => {
      expect(() => OrderStatus.create('INVALID')).toThrow('Invalid order status: INVALID');
    });
  });

  describe('State Transitions', () => {
    it('CREATED can transition to CONFIRMED', () => {
      const created = OrderStatus.create('CREATED');
      const confirmed = OrderStatus.create('CONFIRMED');

      expect(created.canTransitionTo(confirmed)).toBe(true);
    });

    it('CREATED can transition to CANCELLED', () => {
      const created = OrderStatus.create('CREATED');
      const cancelled = OrderStatus.create('CANCELLED');

      expect(created.canTransitionTo(cancelled)).toBe(true);
    });

    it('CREATED cannot transition to DISPATCHED', () => {
      const created = OrderStatus.create('CREATED');
      const dispatched = OrderStatus.create('DISPATCHED');

      expect(created.canTransitionTo(dispatched)).toBe(false);
    });

    it('CONFIRMED can transition to DISPATCHED', () => {
      const confirmed = OrderStatus.create('CONFIRMED');
      const dispatched = OrderStatus.create('DISPATCHED');

      expect(confirmed.canTransitionTo(dispatched)).toBe(true);
    });

    it('CONFIRMED can transition to CANCELLED', () => {
      const confirmed = OrderStatus.create('CONFIRMED');
      const cancelled = OrderStatus.create('CANCELLED');

      expect(confirmed.canTransitionTo(cancelled)).toBe(true);
    });

    it('DISPATCHED can transition to DELIVERED', () => {
      const dispatched = OrderStatus.create('DISPATCHED');
      const delivered = OrderStatus.create('DELIVERED');

      expect(dispatched.canTransitionTo(delivered)).toBe(true);
    });

    it('DISPATCHED cannot transition to CANCELLED', () => {
      const dispatched = OrderStatus.create('DISPATCHED');
      const cancelled = OrderStatus.create('CANCELLED');

      expect(dispatched.canTransitionTo(cancelled)).toBe(false);
    });
  });

  describe('Terminal States', () => {
    it('DELIVERED is a terminal state', () => {
      const delivered = OrderStatus.create('DELIVERED');

      expect(delivered.isTerminal()).toBe(true);
    });

    it('CANCELLED is a terminal state', () => {
      const cancelled = OrderStatus.create('CANCELLED');

      expect(cancelled.isTerminal()).toBe(true);
    });

    it('CREATED is not a terminal state', () => {
      const created = OrderStatus.create('CREATED');

      expect(created.isTerminal()).toBe(false);
    });

    it('CONFIRMED is not a terminal state', () => {
      const confirmed = OrderStatus.create('CONFIRMED');

      expect(confirmed.isTerminal()).toBe(false);
    });

    it('DISPATCHED is not a terminal state', () => {
      const dispatched = OrderStatus.create('DISPATCHED');

      expect(dispatched.isTerminal()).toBe(false);
    });
  });

  describe('Cancellable States', () => {
    it('CREATED is cancellable', () => {
      const created = OrderStatus.create('CREATED');

      expect(created.isCancellable()).toBe(true);
    });

    it('CONFIRMED is cancellable', () => {
      const confirmed = OrderStatus.create('CONFIRMED');

      expect(confirmed.isCancellable()).toBe(true);
    });

    it('DISPATCHED is not cancellable', () => {
      const dispatched = OrderStatus.create('DISPATCHED');

      expect(dispatched.isCancellable()).toBe(false);
    });

    it('DELIVERED is not cancellable', () => {
      const delivered = OrderStatus.create('DELIVERED');

      expect(delivered.isCancellable()).toBe(false);
    });

    it('CANCELLED is not cancellable', () => {
      const cancelled = OrderStatus.create('CANCELLED');

      expect(cancelled.isCancellable()).toBe(false);
    });
  });

  describe('Equality', () => {
    it('should be equal for same status', () => {
      const status1 = OrderStatus.create('CREATED');
      const status2 = OrderStatus.create('CREATED');

      expect(status1.equals(status2)).toBe(true);
    });

    it('should not be equal for different statuses', () => {
      const status1 = OrderStatus.create('CREATED');
      const status2 = OrderStatus.create('CONFIRMED');

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should return all statuses', () => {
      const statuses = OrderStatus.getAllStatuses();

      expect(statuses).toContain(OrderStatusEnum.CREATED);
      expect(statuses).toContain(OrderStatusEnum.CONFIRMED);
      expect(statuses).toContain(OrderStatusEnum.DISPATCHED);
      expect(statuses).toContain(OrderStatusEnum.DELIVERED);
      expect(statuses).toContain(OrderStatusEnum.CANCELLED);
      expect(statuses.length).toBe(5);
    });

    it('should return valid transitions for CREATED', () => {
      const transitions = OrderStatus.getValidTransitions(OrderStatusEnum.CREATED);

      expect(transitions).toContain(OrderStatusEnum.CONFIRMED);
      expect(transitions).toContain(OrderStatusEnum.CANCELLED);
      expect(transitions.length).toBe(2);
    });

    it('should return empty array for terminal states', () => {
      const deliveredTransitions = OrderStatus.getValidTransitions(OrderStatusEnum.DELIVERED);
      const cancelledTransitions = OrderStatus.getValidTransitions(OrderStatusEnum.CANCELLED);

      expect(deliveredTransitions.length).toBe(0);
      expect(cancelledTransitions.length).toBe(0);
    });
  });
});
