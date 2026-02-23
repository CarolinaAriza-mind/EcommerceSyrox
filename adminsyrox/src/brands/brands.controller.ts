import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: { name: string }) {
    return this.brandsService.create(body.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.brandsService.update(id, body.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
