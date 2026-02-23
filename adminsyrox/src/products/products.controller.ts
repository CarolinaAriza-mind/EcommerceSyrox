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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      price: string;
      stock?: string;
      status?: string;
      categoryId?: string;
      brandId?: string;
      options?: string; // JSON string
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) imageUrl = await this.cloudinaryService.uploadImage(file);

    const options = body.options
      ? (JSON.parse(body.options) as { name: string; values: string[] }[])
      : undefined;

    return this.productsService.create({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stock: body.stock ? Number(body.stock) : 0,
      status: body.status ?? 'ACTIVE',
      categoryId: body.categoryId,
      brandId: body.brandId,
      imageUrl,
      options,
    });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: string;
      stock?: string;
      status?: string;
      categoryId?: string;
      brandId?: string;
      options?: string; // JSON string
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) imageUrl = await this.cloudinaryService.uploadImage(file);

    const options = body.options
      ? (JSON.parse(body.options) as { name: string; values: string[] }[])
      : undefined;

    return this.productsService.update(id, {
      name: body.name,
      description: body.description,
      price: body.price ? Number(body.price) : undefined,
      stock: body.stock ? Number(body.stock) : undefined,
      status: body.status,
      categoryId: body.categoryId,
      brandId: body.brandId,
      imageUrl,
      options,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
