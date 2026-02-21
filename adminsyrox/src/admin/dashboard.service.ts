import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getData() {
    const [products, recentSales] = await Promise.all([
      this.prisma.product.findMany({
        take: 10,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.findMany({
        take: 10,
        include: {
          customer: true,
          items: { include: { product: true } },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    const inventoryValue = products.reduce(
      (acc, p) => acc + Number(p.price) * p.stock,
      0,
    );

    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductIds = topProducts.map((p) => p.productId);
    const topProductDetails = await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
    });

    const topProductsWithDetails = topProducts.map((tp) => ({
      ...tp,
      product: topProductDetails.find((p) => p.id === tp.productId),
    }));

    return {
      inventory: {
        total: products.length,
        value: inventoryValue,
        products,
      },
      recentSales,
      topProducts: topProductsWithDetails,
    };
  }
}
