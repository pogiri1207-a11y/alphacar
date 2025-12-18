// backend/community/src/app.controller.ts (Auth Guard 준비 포함)

import { Controller, Get, Post, Body, InternalServerErrorException, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
// ⚠️ AuthGuard 경로는 실제 마이페이지/인증 모듈 설정에 따라 달라질 수 있습니다.
// 여기서는 임시로 'jwt' 가드를 사용한다고 가정합니다.
import { AuthGuard } from '@nestjs/passport'; // @nestjs/passport가 설치되어 있다고 가정

@Controller('community')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // GET /community 요청 처리
  async getCommunityPosts() {
    try {
      const posts = await this.appService.getAllPosts();

      const formattedPosts = posts.map(post => {
        // DB에서 가져온 Date 객체를 YYYY-MM-DD 형식으로 안전하게 변환
        const dateString = post.createdAt instanceof Date
          ? post.createdAt.toISOString().split('T')[0]
          : 'N/A';

        return {
          id: post.id,
          category: post.category || '구매 고민',
          title: post.title,
          content: post.content,
          author: post.author,
          date: dateString,
          views: post.views
        };
      });

      return {
        message: '커뮤니티 게시글 목록입니다.',
        posts: formattedPosts
      };
    } catch (error) {
      console.error('커뮤니티 목록 조회 중 오류 발생:', error.message, error.stack);
      throw new InternalServerErrorException('게시글 데이터를 불러오는 데 실패했습니다.');
    }
  }

  // ✅ [수정] UseGuards와 @Req를 추가하여 인증 정보를 받을 준비를 합니다.
  @Post('write') // POST /community/write 요청 처리
  // @UseGuards(AuthGuard('jwt')) 👈 주석 처리 (현재는 토큰이 없으므로 주석 처리하여 401 방지)
  async createPost(@Body() body: any, @Req() req: any) { // 👈 [수정] @Req() req: any 추가
    if (!body.title || !body.content) {
      throw new InternalServerErrorException("제목과 내용은 필수입니다.");
    }

    // req.user를 통해 로그인된 사용자의 닉네임을 가져오도록 준비
    const authorNickname = req.user?.nickname || body.author; 

    try {
      const savedPost = await this.appService.createPost({
	userId: body.userId, // 👈 [수정] 프론트에서 받은 userId 저장
        category: body.category || '구매 고민',
        title: body.title,
        content: body.content,
        author: authorNickname || '익명', // ✅ [수정] 인증된 닉네임 사용
        views: 0,
      });

      return {
        success: true,
        message: '글이 등록되었습니다.',
        id: savedPost.id
      };
    } catch (error) {
      console.error('커뮤니티 글 등록 중 오류 발생:', error.message, error.stack);
      throw new InternalServerErrorException('글 등록 중 서버 오류가 발생했습니다.');
    }
  }
}
