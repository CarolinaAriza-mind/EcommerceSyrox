import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; price: number; categoryId?: string | null }) {
    const { categoryId, ...rest } = data;

    return this.prisma.product.create({
      data: {
        ...rest,
        ...(categoryId && {
          category: { connect: { id: categoryId } },
        }),
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  update(
    id: string,
    data: Partial<{ name: string; price: number; categoryId?: string | null }>,
  ) {
    const { categoryId, ...rest } = data;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId && {
          category: { connect: { id: categoryId } },
        }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
