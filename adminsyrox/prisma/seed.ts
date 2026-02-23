import { PrismaClient, SaleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  categoryTree,
  brandsData,
  productsData,
  customersData,
  salesData,
} from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── ADMIN ───────────────────────────────────────────────
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@syrox.com' },
    update: {},
    create: {
      email: 'admin@syrox.com',
      password: hashed,
      name: 'Administrador',
    },
  });
  console.log('✅ Admin creado');

  // ─── CATEGORÍAS ──────────────────────────────────────────
  const categoryMap: Record<string, string> = {};
  for (const cat of categoryTree) {
    const parent = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    categoryMap[cat.name] = parent.id;

    for (const childName of cat.children) {
      const child = await prisma.category.upsert({
        where: { name: childName },
        update: {},
        create: { name: childName, parentId: parent.id },
      });
      categoryMap[childName] = child.id;
    }
  }
  console.log('✅ Categorías y subcategorías creadas');

  // ─── MARCAS ──────────────────────────────────────────────
  const brandMap: Record<string, string> = {};
  for (const brandName of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
    brandMap[brandName] = brand.id;
  }
  console.log('✅ Marcas creadas');

  // ─── PRODUCTOS ───────────────────────────────────────────
  const productMap: Record<string, string> = {};
  for (const p of productsData) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          stock: p.stock,
          status: 'ACTIVE',
          categoryId: categoryMap[p.category] ?? null,
          brandId: brandMap[p.brand] ?? null,
        },
      });
      productMap[p.name] = created.id;
    } else {
      productMap[p.name] = existing.id;
    }
  }
  console.log('✅ Productos creados');

  // ─── CLIENTES ────────────────────────────────────────────
  const customerMap: Record<string, string> = {};
  for (const c of customersData) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
    customerMap[c.name] = customer.id;
  }
  console.log('✅ Clientes creados');

  // ─── VENTAS ──────────────────────────────────────────────
  for (const saleData of salesData) {
    const customerId = customerMap[saleData.customer];
    if (!customerId) continue;

    const saleItems = saleData.items
      .filter((item) => productMap[item.product])
      .map((item) => {
        const product = productsData.find((p) => p.name === item.product);
        const unitPrice = product?.price ?? 0;
        return {
          productId: productMap[item.product],
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

    const total = saleItems.reduce((sum, i) => sum + i.subtotal, 0);

    await prisma.sale.create({
      data: {
        customerId,
        status: saleData.status as SaleStatus,
        total,
        paymentMethod: saleData.paymentMethod,
        trackingCode: saleData.trackingCode ?? null,
        notes: saleData.notes ?? null,
        date: new Date(),
        items: { createMany: { data: saleItems } },
      },
    });
  }
  console.log('✅ Ventas creadas');

  console.log('🎉 Seed completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
