import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        include: {
          parent: true,
          children: true,
          _count: { select: { children: true } },
        },
        orderBy: { position: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.category.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return {
      items,
      total,
      page,
      perPage,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return category;
  }

  create(data: { name: string; parentId?: string; position?: number }) {
    const { parentId, ...rest } = data;
    return this.prisma.category.create({
      data: {
        ...rest,
        position: data.position ?? 1,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; parentId?: string; position?: number },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);

    const { parentId, ...rest } = data;
    return this.prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(parentId !== undefined && {
          parent: parentId
            ? { connect: { id: parentId } }
            : { disconnect: true },
        }),
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } },
    });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);

    if (category._count.children > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con subcategorías',
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
