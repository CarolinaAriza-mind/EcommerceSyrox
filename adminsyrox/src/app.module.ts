import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SalesModule } from './sales/sales.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CustomersModule } from './customer/customer.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ← carga el .env
    PrismaModule,
    AuthModule,
    AdminModule,
    SalesModule,
    CategoriesModule,
    ProductsModule,
    CloudinaryModule,
    CustomersModule,
    BrandsModule,
  ],
})
export class AppModule {}
