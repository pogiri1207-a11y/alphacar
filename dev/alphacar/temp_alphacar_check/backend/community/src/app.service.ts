import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity'; 

@Injectable()
export class AppService {
  // Inject the TypeORM Repository
  constructor(
    @InjectRepository(CommunityPost)
    private postRepository: Repository<CommunityPost>,
  ) {}

  // 게시글 목록 조회 (ID 기준 최신순 정렬)
  async getAllPosts(): Promise<CommunityPost[]> {
    return this.postRepository.find({
      order: {
        id: 'DESC', 
      },
    });
  }

  // 게시글 작성
  async createPost(data: Partial<CommunityPost>): Promise<CommunityPost> {
    const newPost = this.postRepository.create(data);
    return this.postRepository.save(newPost);
  }
}
