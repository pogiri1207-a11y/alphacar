import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('drive') // 기본 주소: /drive
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. 드라이브 코스 목록 조회
  // GET http://localhost:3002/drive
  @Get()
  getDriveCourses() {
    return {
      message: '추천 드라이브 코스 목록입니다.',
      courses: [
        { id: 1, title: '한강 야경 코스', distance: '15km', time: '40분' },
        { id: 2, title: '북악 스카이웨이', distance: '10km', time: '30분' },
        { id: 3, title: '양평 두물머리', distance: '45km', time: '1시간 20분' }
      ]
    };
  }

  // 2. 특정 코스 상세 조회
  // GET http://localhost:3002/drive/1
  @Get(':id')
  getCourseDetail(@Param('id') id: string) {
    return {
      id: id,
      title: '한강 야경 코스',
      description: '서울의 밤을 가장 아름답게 볼 수 있는 드라이브 코스입니다.',
      mapUrl: 'https://map.naver.com/...'
    };
  }
}
