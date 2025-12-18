import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 🟡 카카오 로그인
  async kakaoLogin(code: string) {
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', '342d0463be260fc289926a0c63c4badc');
    
    // ✅ 카카오는 nip.io 주소 사용 (프론트와 일치해야 함)
    params.append('redirect_uri', 'https://192.168.0.160.nip.io:8000/mypage');
    params.append('code', code);

    let accessToken = '';
    try {
      const response = await firstValueFrom(
        this.httpService.post(kakaoTokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      accessToken = response.data.access_token;
    } catch (e) {
      this.logger.error('카카오 토큰 발급 실패', e.response?.data);
      throw new BadRequestException('카카오 토큰 발급 실패');
    }

    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    let kakaoUser;
    try {
      const response = await firstValueFrom(
        this.httpService.get(userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      kakaoUser = response.data;
    } catch (e) {
      throw new BadRequestException('카카오 유저 정보 조회 실패');
    }

    return this.saveUser(kakaoUser.id.toString(), kakaoUser.properties?.nickname, kakaoUser.kakao_account?.email, 'kakao');
  }

  // 🔵 [추가] 구글 로그인 로직
  async googleLogin(code: string) {
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    
    // ⭐ [필수] 구글 클라우드 콘솔에서 발급받은 키 입력
    params.append('client_id', '1030657487130-g7891k55pfhijc8gh1kedccnkf75v2qf.apps.googleusercontent.com'); 
    params.append('client_secret', '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'); 
    
    // ✅ 구글도 nip.io 주소 사용 (중요!)
    params.append('redirect_uri', 'https://192.168.0.160.nip.io:8000/mypage');
    params.append('code', code);

    let accessToken = '';
    try {
      const response = await firstValueFrom(
        this.httpService.post(googleTokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      accessToken = response.data.access_token;
    } catch (e) {
      this.logger.error('구글 토큰 실패', e.response?.data);
      throw new BadRequestException('구글 로그인 실패');
    }

    const { data: googleUser } = await firstValueFrom(
      this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return this.saveUser(googleUser.id, googleUser.name, googleUser.email, 'google');
  }

  // 🛠️ 공통 저장 함수
  private async saveUser(socialId: string, nickname: string, email: string, provider: string) {
    let user = await this.userRepository.findOne({ where: { socialId } });

    if (!user) {
      user = this.userRepository.create({
        socialId,
        nickname,
        email,
        provider,
        point: 0,
        quoteCount: 0,
      });
      await this.userRepository.save(user);
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    return { access_token: accessToken, user };
  }
}
