// src/favorites/favorites.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // 찜 토글하기
  @Post('toggle')
  async toggleFavorite(@Body() dto: ToggleFavoriteDto) {
    try {
      console.log('💖 [FavoritesController] toggle 요청:', dto);
      const result = await this.favoritesService.toggle(dto);
      console.log('💖 [FavoritesController] toggle 성공:', result);
      return result;
    } catch (error) {
      console.error('💖 [FavoritesController] toggle 에러:', error);
      throw error;
    }
  }

  // 내 찜 목록 보기
  @Get('list')
  async getFavorites(@Query('userId') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  // 특정 차량 찜 상태 확인
  @Get('status')
  async checkStatus(@Query('userId') userId: string, @Query('vehicleId') vehicleId: string) {
    return this.favoritesService.checkStatus(userId, vehicleId);
  }
}
