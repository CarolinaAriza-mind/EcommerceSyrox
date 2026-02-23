import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
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
  findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.salesService.findAll({
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
    });
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
