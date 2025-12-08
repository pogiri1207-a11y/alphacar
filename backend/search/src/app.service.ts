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

    // 5. 최종 반환 데이터 포맷팅 (JavaScript에서 처리)
    return cars.map(car => {
      // 가격 범위 계산
      let minPrice = 0;
      let maxPrice = 0;
      if (car.trims && Array.isArray(car.trims) && car.trims.length > 0) {
        const prices = car.trims.map(t => t.price || 0).filter(p => p > 0);
        if (prices.length > 0) {
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
        }
      }
      const priceRangeStr = minPrice > 0 
        ? (maxPrice > minPrice 
          ? `${(minPrice / 10000).toLocaleString()}만원 ~ ${(maxPrice / 10000).toLocaleString()}만원`
          : `${(minPrice / 10000).toLocaleString()}만원`)
        : '가격 정보 없음';

      // 배기량 추출
      const displacements: number[] = [];
      if (car.trims && Array.isArray(car.trims)) {
        car.trims.forEach((trim: any) => {
          if (trim.specifications && trim.specifications['배기량']) {
            const dispStr = String(trim.specifications['배기량']).replace(/[^0-9.]/g, '');
            const disp = parseFloat(dispStr);
            if (!isNaN(disp) && disp > 0 && disp < 10000) {
              displacements.push(disp);
            }
          }
        });
      }
      const displacementStr = displacements.length > 0
        ? (displacements.length === 1 || Math.min(...displacements) === Math.max(...displacements)
          ? `${Math.min(...displacements).toLocaleString()}cc`
          : `${Math.min(...displacements).toLocaleString()}cc ~ ${Math.max(...displacements).toLocaleString()}cc`)
        : null;

      // 복합연비 추출
      const fuelEfficiencies: number[] = [];
      if (car.trims && Array.isArray(car.trims)) {
        car.trims.forEach((trim: any) => {
          if (trim.specifications && trim.specifications['복합연비']) {
            const effStr = String(trim.specifications['복합연비']).replace(/[^0-9.]/g, '');
            const eff = parseFloat(effStr);
            if (!isNaN(eff) && eff > 0) {
              fuelEfficiencies.push(eff);
            }
          }
        });
      }
      const fuelEfficiencyStr = fuelEfficiencies.length > 0
        ? (fuelEfficiencies.length === 1 || Math.min(...fuelEfficiencies) === Math.max(...fuelEfficiencies)
          ? `${Math.min(...fuelEfficiencies).toFixed(1)}km/L`
          : `${Math.min(...fuelEfficiencies).toFixed(1)}km/L ~ ${Math.max(...fuelEfficiencies).toFixed(1)}km/L`)
        : null;

      return {
        id: car.lineup_id || car._id?.toString() || '',
        name: `[${car.brand_name}] ${car.vehicle_name}`,
        image: car.main_image || '',
        priceRange: priceRangeStr,
        releaseDate: car.release_date || car.model_year || null,
        displacement: displacementStr,
        fuelEfficiency: fuelEfficiencyStr,
        brandName: car.brand_name || '',
        logoUrl: car.logo_url || '',
      };
    });
  }
}
