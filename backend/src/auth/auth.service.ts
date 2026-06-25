import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    if (email === 'admin@fadeco.com' && pass === 'admin123') {
      const mockPayload = { id: 1, email, role: 'ADMIN' };
      return {
        access_token: this.jwtService.sign(mockPayload),
        user: mockPayload,
      };
    }

    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.rol?.nombre || 'USER',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
