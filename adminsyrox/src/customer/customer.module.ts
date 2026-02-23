import { Module } from '@nestjs/common';
import { CustomersService } from './customer.service';
import { CustomersController } from './customer.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService],
})
export class CustomersModule {}
