// src/auth/auth.controller.ts
import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth') // 경로: /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ 1. 카카오 로그인 시작 (GET /auth/kakao)
  @Get('kakao')
  kakaoLogin(@Res() res: Response) {
    const KAKAO_CLIENT_ID = "342d0463be260fc289926a0c63c4badc";
    // 프론트엔드 주소 (HTTPS 8000번)
    const REDIRECT_URI = "https://192.168.0.160:8000/mypage/login"; 

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    // ❌ [핵심 수정] 404를 유발했던 직접 링크 대신, 백엔드가 카카오로 리다이렉트 시켜줌
    return res.redirect(kakaoAuthUrl); 
  }

  // ✅ 2. 카카오 로그인 콜백 처리 (POST /auth/kakao-login)
  @Post('kakao-login')
  async kakaoLoginCallback(@Body('code') code: string) {
    return this.authService.kakaoLogin(code);
  }

  // ✅ [추가] 구글 로그인 (이게 없어서 404가 떴던 겁니다!)
  @Post('google-login')
  async googleLogin(@Body('code') code: string) {
    return this.authService.googleLogin(code);
  }
}
