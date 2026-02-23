import { Controller, Get, UseGuards } from '@nestjs/common';
import { CustomersService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }
}
