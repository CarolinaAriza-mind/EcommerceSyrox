import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
