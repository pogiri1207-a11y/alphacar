import { Controller, Get, Req, UseGuards, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express'; 
import { AppService } from './app.service';
import { User } from './entities/user.entity'; // 👈 [추가] User 엔티티를 임포트하여 타입 정의에 사용

// AuthenticatedRequest 인터페이스 유지
interface AuthenticatedRequest extends Request {
    user: { socialId: string } | null; 
}

// 1. MockAuthGuard: JWT 토큰의 존재 유무를 확인하고, 사용자 정보를 요청 객체에 주입합니다.
@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as AuthenticatedRequest; 
    const authHeader = request.headers.authorization;

    // 🚨 [로그 추가] Guard가 수신한 Authorization 헤더 값
    console.log(`[BE LOG 3] Received Auth Header: ${authHeader}`);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        // 🚨 토큰 문자열 자체를 socialId로 간주하여 동적으로 사용자 식별
        const dynamicSocialId = token;

        // 🚨 [로그 추가] 추출된 Social ID 확인
        console.log(`[BE LOG 4] Extracted Social ID: ${dynamicSocialId}`);	
        
        request.user = { socialId: dynamicSocialId };
        return true;
    }
    
    // 토큰이 없으면 로그인되지 않은 것으로 간주
    request.user = null;
    return true; 
  }
}

@Controller('mypage')
export class AppController {
  constructor(private readonly appService: AppService) {} 

  @Get()
  @UseGuards(MockAuthGuard)
  async getMypageInfo(@Req() req: AuthenticatedRequest) { 
    const socialId = req.user ? req.user.socialId : null;
    
    // 🚨 [핵심 수정] user 변수의 타입을 명시적으로 Partial<User> | null 로 정의
    let user: Partial<User> | null = null; 

    if (socialId) {
        user = await this.appService.getUserBySocialId(socialId);
    }
    
    if (user) {
      // 이제 TypeScript는 user가 Partial<User> 타입임을 인식합니다.
      return {
        isLoggedIn: true,
        message: `${user.nickname}님 환영합니다.`,
        user: {
            id: user.id, 
            nickname: user.nickname, 
            email: user.email,
        }
      };
    } else {
      return {
        isLoggedIn: false, 
        message: '로그인이 필요한 페이지입니다.',
        user: null
      };
    }
  }
}
