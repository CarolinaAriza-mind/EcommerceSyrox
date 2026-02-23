import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true, brand: true, options: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, options: true },
    });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    status?: string;
    categoryId?: string;
    brandId?: string;
    gender?: string;
    imageUrl?: string;
    options?: { name: string; values: string[] }[];
  }) {
    const { categoryId, brandId, options, ...rest } = data;
    return this.prisma.product.create({
      data: {
        name: rest.name,
        description: rest.description,
        price: rest.price,
        stock: rest.stock ?? 0,
        status: rest.status ?? 'ACTIVE',
        imageUrl: rest.imageUrl,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(brandId && { brand: { connect: { id: brandId } } }),
        ...(options?.length && { options: { create: options } }),
      },
      include: { category: true, brand: true, options: true },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      status?: string;
      categoryId?: string;
      brandId?: string;
      imageUrl?: string;
      options?: { name: string; values: string[] }[];
    },
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);

    const { categoryId, brandId, options, ...rest } = data;

    if (options) {
      await this.prisma.productOption.deleteMany({ where: { productId: id } });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(brandId && { brand: { connect: { id: brandId } } }),
        ...(options?.length && { options: { create: options } }),
      },
      include: { category: true, brand: true, options: true },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);

    // Eliminar items de ventas asociados
    await this.prisma.saleItem.deleteMany({ where: { productId: id } });

    // Eliminar opciones del producto
    await this.prisma.productOption.deleteMany({ where: { productId: id } });

    return this.prisma.product.delete({ where: { id } });
  }
}
