import {
  CreateOrderUseCase,
  GetOrderUseCase,
  ListOrdersUseCase,
  UpdateOrderStatusUseCase,
  AddOrderItemUseCase,
  RemoveOrderItemUseCase,
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
} from '../../application/use-cases';
import { prisma } from '../database/prisma/client';
import {
  PrismaOrderRepository,
  PrismaUserRepository,
  PrismaRetailerRepository,
} from '../database/repositories';
import { BcryptPasswordService, JwtTokenService } from '../services';

// Repositories
const orderRepository = new PrismaOrderRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const retailerRepository = new PrismaRetailerRepository(prisma);

// Services
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();

// Order Use Cases
const createOrderUseCase = new CreateOrderUseCase(orderRepository, retailerRepository);
const getOrderUseCase = new GetOrderUseCase(orderRepository);
const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
const addOrderItemUseCase = new AddOrderItemUseCase(orderRepository);
const removeOrderItemUseCase = new RemoveOrderItemUseCase(orderRepository);

// Auth Use Cases
const loginUseCase = new LoginUseCase(userRepository, passwordService, tokenService);
const registerUseCase = new RegisterUseCase(
  userRepository,
  retailerRepository,
  passwordService,
  tokenService
);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

// Container export
export const container = {
  // Repositories
  orderRepository,
  userRepository,
  retailerRepository,

  // Services
  passwordService,
  tokenService,

  // Order Use Cases
  createOrderUseCase,
  getOrderUseCase,
  listOrdersUseCase,
  updateOrderStatusUseCase,
  addOrderItemUseCase,
  removeOrderItemUseCase,

  // Auth Use Cases
  loginUseCase,
  registerUseCase,
  refreshTokenUseCase,
};

export type Container = typeof container;
