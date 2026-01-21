import { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client';

import { User, UserRole } from '../../../domain/entities';
import { IUserRepository, UserFilters } from '../../../domain/repositories';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role as PrismaUserRole,
        retailerId: user.retailerId,
        isActive: user.isActive,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomain(user);
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    const where = this.buildWhereClause(filters);

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.mapToDomain(user));
  }

  async findByRetailerId(retailerId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.mapToDomain(user));
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return !!user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  private buildWhereClause(filters?: UserFilters): Record<string, unknown> {
    if (!filters) {
      return {};
    }

    const where: Record<string, unknown> = {};

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.retailerId) {
      where.retailerId = filters.retailerId;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  private mapToDomain(data: {
    id: string;
    email: string;
    password: string;
    name: string;
    role: PrismaUserRole;
    retailerId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  }): User {
    return User.reconstitute({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role as UserRole,
      retailerId: data.retailerId || undefined,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt || undefined,
    });
  }
}
