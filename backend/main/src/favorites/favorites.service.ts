// src/favorites/favorites.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { Vehicle } from '../../schemas/vehicle.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
  ) {}

  // 1. 찜 토글 (추가/삭제)
  async toggle(dto: ToggleFavoriteDto) {
    const { userId, vehicleId } = dto;
    
    console.log('💖 [FavoritesService] toggle 호출:', { userId, vehicleId, vehicleIdType: typeof vehicleId });
    
    if (!userId || !vehicleId) {
      throw new Error('userId와 vehicleId는 필수입니다.');
    }
    
    // vehicleId 처리: ObjectId 형식이면 변환, 아니면 문자열로 저장
    let objectId;
    try {
      if (Types.ObjectId.isValid(vehicleId)) {
        objectId = new Types.ObjectId(vehicleId);
      } else {
        // ObjectId가 아닌 경우 (예: lineup_id 숫자 문자열), danawa_vehicle_data에서 _id 찾기
        console.log('💖 [FavoritesService] vehicleId가 ObjectId가 아닙니다. danawa_vehicle_data에서 찾기:', vehicleId);
        // lineup_id로 검색하여 실제 _id 찾기
        const vehicle = await this.vehicleModel.findOne({ lineup_id: vehicleId }).exec();
        if (vehicle && vehicle._id) {
          objectId = vehicle._id;
          console.log('💖 [FavoritesService] lineup_id로 찾은 _id:', objectId);
        } else {
          throw new Error(`vehicleId ${vehicleId}에 해당하는 차량을 찾을 수 없습니다.`);
        }
      }
    } catch (error) {
      console.error('💖 [FavoritesService] vehicleId 처리 실패:', error);
      throw error;
    }

    // 이미 찜했는지 확인
    const existing = await this.favoriteModel.findOne({ userId, vehicleId: objectId });

    if (existing) {
      // 이미 있으면 삭제 (찜 해제)
      await this.favoriteModel.deleteOne({ _id: existing._id });
      return { status: 'removed', message: '찜 목록에서 삭제되었습니다.' };
    } else {
      // 없으면 생성 (찜 하기)
      await new this.favoriteModel({ userId, vehicleId: objectId }).save();
      return { status: 'added', message: '찜 목록에 추가되었습니다.' };
    }
  }

  // 2. 특정 유저의 찜 목록 조회 (차량 정보 포함)
  async getFavorites(userId: string) {
    return this.favoriteModel.find({ userId })
      .populate('vehicleId') // Vehicle 컬렉션 조인
      .sort({ createdAt: -1 })
      .exec();
  }

  // 3. 특정 차량 찜 여부 확인 (모달 열 때 사용)
  async checkStatus(userId: string, vehicleId: string) {
    let objectId;
    if (Types.ObjectId.isValid(vehicleId)) {
      objectId = new Types.ObjectId(vehicleId);
    } else {
      // lineup_id로 검색하여 실제 _id 찾기
      const vehicle = await this.vehicleModel.findOne({ lineup_id: vehicleId }).exec();
      if (vehicle && vehicle._id) {
        objectId = vehicle._id;
      } else {
        return { isLiked: false };
      }
    }
    
    const count = await this.favoriteModel.countDocuments({ 
      userId, 
      vehicleId: objectId 
    });
    return { isLiked: count > 0 };
  }
}
