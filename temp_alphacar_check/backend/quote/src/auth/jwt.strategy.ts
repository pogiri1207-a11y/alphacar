import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ⚠️ docker-compose.yml에 정의된 환경변수와 반드시 일치해야 함
      secretOrKey: process.env.JWT_SECRET || 'default-secret-key', 
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { userId: payload.sub, email: payload.email }; // req.user에 저장될 정보
  }
}
