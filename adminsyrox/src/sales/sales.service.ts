import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma, SaleStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { page?: number; perPage?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;

    const [items, total] = await Promise.all([
      this.prisma.sale.findMany({
        include: {
          customer: true,
          items: { include: { product: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.sale.count(),
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
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);
    return sale;
  }

  async updateStatus(
    id: string,
    status: string,
    notes?: string,
    trackingCode?: string,
    address?: string,
    adminName?: string,
  ) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);

    const statusMessages: Record<string, string> = {
      PREPARING: 'Pedido en preparación',
      SHIPPED: trackingCode
        ? `Pedido enviado con tracking: ${trackingCode}`
        : 'Pedido enviado',
      COMPLETED: 'Pedido completado',
      CANCELLED: 'Pedido cancelado',
    };

    const autoMessage =
      statusMessages[status] ?? `Estado actualizado a ${status}`;
    const adminSuffix = adminName ? `\nPor: ${adminName}` : '';
    const customNotes = notes ? `\n${notes}` : '';
    const finalNotes = `${autoMessage}${customNotes}${adminSuffix}`;

    return this.prisma.sale.update({
      where: { id },
      data: {
        status: status as SaleStatus,
        notes: finalNotes,
        ...(trackingCode && { trackingCode }),
        ...(address && { address }),
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  async create(createSaleDto: CreateSaleDto) {
    const { customerId, items, status } = createSaleDto;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer)
      throw new NotFoundException(`Cliente ${customerId} no encontrado`);

    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Productos no encontrados: ${missing.join(', ')}`,
      );
    }

    const productMap = new Map<string, (typeof products)[number]>(
      products.map((p) => [p.id, p]),
    );

    let total = 0;
    const saleItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product)
        throw new BadRequestException(
          `Producto ${item.productId} no encontrado`,
        );
      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        subtotal,
      };
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        return tx.sale.create({
          data: {
            customerId,
            status,
            total,
            date: new Date(),
            items: { createMany: { data: saleItems } },
          },
          include: { items: true, customer: true },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          `Error al crear la venta: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
