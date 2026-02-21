import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Buscar admin por email
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) throw new UnauthorizedException('Credenciales incorrectas');

    // 2. Verificar contraseña
    const isValid = await bcrypt.compare(dto.password, admin.password);
    if (!isValid) throw new UnauthorizedException('Credenciales incorrectas');

    // 3. Generar JWT
    const payload = { sub: admin.id, email: admin.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }
}
