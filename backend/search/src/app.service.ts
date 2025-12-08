import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './vehicle.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async searchCars(keyword: string) {
    if (!keyword) return [];

    const regex = new RegExp(keyword, 'i'); // 대소문자 무시 검색

    const cars = await this.vehicleModel.aggregate([
      // 1. 검색 조건: 차량명 또는 제조사 이름에 키워드가 포함된 경우
      {
        $match: {
          $or: [
            { vehicle_name: { $regex: regex } },  // 차량명 검색
            { brand_name: { $regex: regex } }     // 제조사명 검색
          ],
        },
      },

      // 2. 필요한 필드만 프로젝션 (logo_url 포함)
      {
        $project: {
          _id: 1,
          lineup_id: 1,
          brand_name: 1,
          vehicle_name: 1,
          main_image: 1,
          release_date: 1,
          model_year: 1,
          logo_url: 1,
          trims: 1,
        },
      },
    ]).exec();

    // 트림별로 개별 결과를 생성
    const results: any[] = [];
    
    cars.forEach(car => {
      if (!car.trims || !Array.isArray(car.trims) || car.trims.length === 0) {
        // 트림이 없는 경우 차량 단위로 하나만 추가
        results.push({
          id: car.lineup_id || car._id?.toString() || '',
          name: `[${car.brand_name}] ${car.vehicle_name}`,
          trimName: null,
          image: car.main_image || '',
          priceRange: '가격 정보 없음',
          releaseDate: car.release_date || car.model_year || null,
          displacement: null,
          fuelEfficiency: null,
          brandName: car.brand_name || '',
          logoUrl: car.logo_url || '',
        });
        return;
      }

      // 각 트림별로 개별 결과 생성
      car.trims.forEach((trim: any) => {
        const trimPrice = trim.price || 0;
        const priceRangeStr = trimPrice > 0 
          ? `${(trimPrice / 10000).toLocaleString()}만원`
          : '가격 정보 없음';

        // 배기량 추출
        let displacementStr: string | null = null;
        if (trim.specifications && trim.specifications['배기량']) {
          const dispStr = String(trim.specifications['배기량']).replace(/[^0-9.]/g, '');
          const disp = parseFloat(dispStr);
          if (!isNaN(disp) && disp > 0 && disp < 10000) {
            displacementStr = `${disp.toLocaleString()}cc`;
          }
        }

        // 복합연비 추출
        let fuelEfficiencyStr: string | null = null;
        if (trim.specifications && trim.specifications['복합연비']) {
          const effStr = String(trim.specifications['복합연비']).replace(/[^0-9.]/g, '');
          const eff = parseFloat(effStr);
          if (!isNaN(eff) && eff > 0) {
            fuelEfficiencyStr = `${eff.toFixed(1)}km/L`;
          }
        }

        results.push({
          id: car.lineup_id || car._id?.toString() || '',
          name: `[${car.brand_name}] ${car.vehicle_name}`,
          trimName: trim.trim_name || trim.name || null,
          image: car.main_image || trim.image || '',
          priceRange: priceRangeStr,
          releaseDate: car.release_date || car.model_year || null,
          displacement: displacementStr,
          fuelEfficiency: fuelEfficiencyStr,
          brandName: car.brand_name || '',
          logoUrl: car.logo_url || '',
        });
      });
    });

    return results;
  }
}
