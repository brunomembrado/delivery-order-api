import { PrismaClient } from '@prisma/client';

import { Retailer, Address } from '../../../domain';
import {
  IRetailerRepository,
  RetailerFilters,
  PaginatedRetailers,
} from '../../../domain/repositories';

export class PrismaRetailerRepository implements IRetailerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(retailer: Retailer): Promise<Retailer> {
    const created = await this.prisma.retailer.create({
      data: {
        name: retailer.name,
        email: retailer.email,
        phone: retailer.phone,
        street: retailer.address?.street,
        city: retailer.address?.city,
        state: retailer.address?.state,
        postalCode: retailer.address?.postalCode,
        country: retailer.address?.country,
        isActive: retailer.isActive,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Retailer | null> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
    });

    if (!retailer) {
      return null;
    }

    return this.mapToDomain(retailer);
  }

  async findByEmail(email: string): Promise<Retailer | null> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!retailer) {
      return null;
    }

    return this.mapToDomain(retailer);
  }

  async findAll(
    filters?: RetailerFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedRetailers> {
    const where = this.buildWhereClause(filters);
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [retailers, total] = await Promise.all([
      this.prisma.retailer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.retailer.count({ where }),
    ]);

    return {
      retailers: retailers.map(retailer => this.mapToDomain(retailer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(retailer: Retailer): Promise<Retailer> {
    const updated = await this.prisma.retailer.update({
      where: { id: retailer.id },
      data: {
        name: retailer.name,
        email: retailer.email,
        phone: retailer.phone,
        street: retailer.address?.street,
        city: retailer.address?.city,
        state: retailer.address?.state,
        postalCode: retailer.address?.postalCode,
        country: retailer.address?.country,
        isActive: retailer.isActive,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.retailer.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!retailer;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return !!retailer;
  }

  private buildWhereClause(filters?: RetailerFilters): Record<string, unknown> {
    if (!filters) {
      return {};
    }

    const where: Record<string, unknown> = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  private mapToDomain(data: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Retailer {
    let address: Address | undefined;

    if (data.street && data.city && data.state && data.postalCode && data.country) {
      address = Address.create({
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      });
    }

    return Retailer.reconstitute({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
