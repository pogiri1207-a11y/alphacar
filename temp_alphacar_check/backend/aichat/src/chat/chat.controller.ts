// src/chat/chat.controller.ts
import { 
  Body, 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  ParseFilePipeBuilder, 
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import type { Express } from 'express'; // 타입 정의용 (없으면 무시 가능)

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 1. [기존] 텍스트 질문하기
  @Post('ask')
  async ask(@Body('message') message: string) {
    return this.chatService.chat(message);
  }

  // 2. [추가] 이미지 업로드 및 분석 요청
  // 프론트엔드가 /api/chat/image 로 보내면 -> HAProxy가 /chat/image 로 변환해서 여기로 전달함
  // 'file' 또는 'image' 필드명 모두 지원 (하위 호환성)
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = /(jpg|jpeg|png|webp|gif)$/i;
      if (allowedMimes.test(file.mimetype) || allowedMimes.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp, gif만 허용)'), false);
      }
    }
  }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|gif)$/i, // 허용할 이미지 형식 (대소문자 무시)
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB 용량 제한
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: (error) => {
            // error는 단일 객체 또는 배열일 수 있음
            const errors = Array.isArray(error) ? error : [error];
            const errorMessages = errors.map((err: any) => {
              if (err?.constraint === 'fileType') {
                return '지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp, gif만 허용)';
              }
              if (err?.constraint === 'maxSize') {
                return '이미지 크기는 5MB 이하여야 합니다.';
              }
              return '파일 업로드 중 오류가 발생했습니다.';
            });
            return new BadRequestException(errorMessages.join(' '));
          },
        }),
    )
    file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 제공되지 않았습니다.');
    }
    
    // ChatService의 이미지 처리 메서드 호출
    return this.chatService.chatWithImage(file.buffer, file.mimetype);
  }

  // 3. [기존] 지식 추가 (테스트용)
  @Post('knowledge')
  async addKnowledge(@Body() body: { content: string; source: string }) {
    return this.chatService.addKnowledge(body.content, body.source);
  }
}
