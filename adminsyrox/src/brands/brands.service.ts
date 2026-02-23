import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  create(name: string) {
    return this.prisma.brand.create({ data: { name } });
  }

  async update(id: string, name: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`Marca ${id} no encontrada`);
    return this.prisma.brand.update({ where: { id }, data: { name } });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Marca ${id} no encontrada`);
    if (brand._count.products > 0) {
      throw new NotFoundException(
        `No se puede eliminar la marca porque tiene ${brand._count.products} productos asociados`,
      );
    }
    return this.prisma.brand.delete({ where: { id } });
  }
}
