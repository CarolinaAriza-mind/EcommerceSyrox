import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback_secret_dev', // ← fix
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) throw new UnauthorizedException();

    return { id: admin.id, email: admin.email, name: admin.name };
  }
}
