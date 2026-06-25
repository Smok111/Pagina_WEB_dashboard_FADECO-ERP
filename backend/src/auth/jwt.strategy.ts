import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: any) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['auth_token'];
        }
        return token || req?.headers?.authorization?.replace('Bearer ', '');
      },
      ignoreExpiration: false,
      secretOrKey:
        process.env.NEXTAUTH_SECRET || 'fadeco_super_secret_key_2026_xyz123', // Reusing the same secret for smooth transition
    });
  }

  async validate(payload: any) {
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
