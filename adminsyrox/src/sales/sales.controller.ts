import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      notes?: string;
      trackingCode?: string;
      address?: string;
      adminName?: string;
    },
  ) {
    return this.salesService.updateStatus(
      id,
      body.status,
      body.notes,
      body.trackingCode,
      body.address,
      body.adminName,
    );
  }
}
