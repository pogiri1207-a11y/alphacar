// backend/mypage/src/app.service.ts (변경 없음)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserBySocialId(socialId: string): Promise<Partial<User> | null> {
    if (!socialId) {
	console.log(`[BE LOG 5] socialId is null. Skipping DB lookup.`);
        return null;
    }

    // 🚨 [로그 추가] DB 조회에 사용될 socialId 확인
    console.log(`[BE LOG 6] Looking up user with Social ID: ${socialId}`);
    
    // 전달받은 socialId를 기준으로 DB에서 사용자 정보를 동적으로 조회합니다.
    const user = await this.userRepository.findOne({ 
        where: { socialId: socialId }
    });
    
    if (!user) {
        console.log(`Social ID ${socialId}에 해당하는 유저를 찾을 수 없습니다.`);
        return null;
    }

    return user;
  }
}
