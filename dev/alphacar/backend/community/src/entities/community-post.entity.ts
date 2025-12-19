import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * MariaDB 테이블: community
 */
@Entity('community')
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 [추가] users 테이블의 고유 ID를 저장할 필드
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  category: string; // '구매 고민', '오너 리뷰'

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({ length: 50 }) // 👈 [수정] author 필드 추가 (TS2339 해결)
  author: string; 

  @Column({ default: 0 }) // 👈 [수정] views 필드 추가 (TS2339 해결)
  views: number; 

  @CreateDateColumn()
  createdAt: Date; // 작성일
}
