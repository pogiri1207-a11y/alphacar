// src/app.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { Manufacturer, ManufacturerDocument } from './manufacturer.schema';
import { ReviewAnalysis, ReviewAnalysisDocument } from './review-analysis.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Manufacturer.name) private manufacturerModel: Model<ManufacturerDocument>,
    @InjectModel(ReviewAnalysis.name) private reviewAnalysisModel: Model<ReviewAnalysisDocument>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async findAllMakers() {
    return this.manufacturerModel.find().exec();
  }

  // ✅ [추가] danawa_vehicle_data에서 브랜드 목록 가져오기 (logo_url 포함)
  async getBrandsWithLogo() {
    const brands = await this.vehicleModel.aggregate([
      {
        $match: {
          $and: [
            { brand_name: { $exists: true } },
            { brand_name: { $ne: null } },
            { brand_name: { $ne: '' } }
          ]
        }
      },
      {
        $group: {
          _id: '$brand_name',
          logo_url: { $first: '$logo_url' }, // 첫 번째 logo_url 사용
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          logo_url: { $ifNull: ['$logo_url', ''] }
        }
      }
    ]).exec();
    
    // 우선순위 브랜드 목록
    const priorityBrands = ['현대', '기아', '제네시스', '쉐보레'];
    
    // 브랜드를 우선순위와 일반으로 분리
    const priorityList: any[] = [];
    const normalList: any[] = [];
    
    brands.forEach((brand) => {
      if (priorityBrands.includes(brand.name)) {
        priorityList.push(brand);
      } else {
        normalList.push(brand);
      }
    });
    
    // 우선순위 브랜드는 지정된 순서대로 정렬
    priorityList.sort((a, b) => {
      const indexA = priorityBrands.indexOf(a.name);
      const indexB = priorityBrands.indexOf(b.name);
      return indexA - indexB;
    });
    
    // 일반 브랜드는 한글 순서로 정렬
    normalList.sort((a, b) => {
      return a.name.localeCompare(b.name, 'ko');
    });
    
    // 우선순위 브랜드 + 일반 브랜드 순서로 합치기
    return [...priorityList, ...normalList];
  }

  // ✅ [수정] 브랜드별 필터링 및 가격 범위(최소~최대) 계산
  async getCarList(brand?: string) {
    
    // 브랜드 필터링 조건 생성
    const brandMatch: any = {};
    if (brand && brand !== '전체' && brand !== 'all') {
      brandMatch.brand_name = brand;
    }
    
    
    const pipeline: any[] = [];
    
    // 브랜드 필터링을 먼저 적용 (가능한 경우)
    if (Object.keys(brandMatch).length > 0) {
      pipeline.push({ $match: brandMatch });
    }
    
    pipeline.push(
      {
        $project: {
          // 1. _id는 건드리지 않고 그대로 둡니다 (Mongoose 오류 방지)
          _id: 1, 
          
          // 2. [핵심] 프론트엔드 전용 ID 필드를 새로 만듭니다.
          // lineup_id가 있으면 쓰고, 없으면 _id를 문자열로 바꿔서 넣습니다.
          vehicleId: { 
            $ifNull: [ '$lineup_id', { $toString: '$_id' } ] 
          },

          // 3. 나머지 필드 매핑
          name: { $ifNull: ['$vehicle_name', '$name'] },
          imageUrl: { $ifNull: ['$main_image', '$image_url'] },
          
          // 4. [수정] trims 배열에서 가격 범위 계산 (최소값과 최대값)
          // trims 배열이 있고 price 필드가 있는 경우 최소값과 최대값을 구함
          priceRange: {
            $let: {
              vars: {
                prices: {
                  $filter: {
                    input: {
                      $map: {
                        input: { $ifNull: ['$trims', []] },
                        as: 'trim',
                        in: {
                          $cond: {
                            if: {
                              $and: [
                                { $ne: ['$$trim.price', null] },
                                { $ne: ['$$trim.price', undefined] },
                                { $gt: [{ $toDouble: '$$trim.price' }, 0] }
                              ]
                            },
                            then: { $toDouble: '$$trim.price' },
                            else: null
                          }
                        }
                      }
                    },
                    as: 'price',
                    cond: { $ne: ['$$price', null] }
                  }
                }
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: '$$prices' }, 0] },
                  then: {
                    minPrice: { $min: '$$prices' },
                    maxPrice: { $max: '$$prices' }
                  },
                  else: {
                    minPrice: { $ifNull: ['$min_price', 0] },
                    maxPrice: { $ifNull: ['$min_price', 0] }
                  }
                }
              }
            }
          },
          
          // 5. [수정] brand_name 처리: $ifNull과 $cond 조합
          // 빈 문자열도 체크하기 위해 $cond 사용
          manufacturer: {
            $cond: {
              if: { $eq: ['$brand_name', ''] },
              then: '미분류',
              else: { $ifNull: ['$brand_name', '미분류'] }
            }
          },
          
          trimName: '$base_trim_name',
          
          // 6. 브랜드 필터링을 위해 brand_name도 포함
          brand_name: '$brand_name'
        },
      }
    );
    
    // 7. [수정] 가격이 0보다 큰 경우만 필터링
    pipeline.push({ 
      $match: { 
        'priceRange.minPrice': { $gt: 0 }
      } 
    });
    
    // 8. 가격 범위를 평탄화 (priceRange 객체를 개별 필드로)
    pipeline.push({
      $project: {
        _id: 1,
        vehicleId: 1,
        name: 1,
        imageUrl: 1,
        minPrice: '$priceRange.minPrice',
        maxPrice: '$priceRange.maxPrice',
        manufacturer: 1,
        trimName: 1,
        brand_name: 1,
        vehicle_name: '$name' // 그룹화를 위해 vehicle_name 저장
      }
    });
    
    // 9. 차량 이름 기준으로 그룹화하여 중복 제거
    pipeline.push({
      $group: {
        _id: '$vehicle_name', // vehicle_name으로 그룹화
        vehicleId: { $first: '$vehicleId' }, // 첫 번째 vehicleId 사용
        name: { $first: '$name' }, // 첫 번째 이름 사용
        imageUrl: { $first: '$imageUrl' }, // 첫 번째 이미지 사용
        manufacturer: { $first: '$manufacturer' }, // 첫 번째 제조사 사용
        minPrice: { $min: '$minPrice' }, // 전체 중 최소 가격
        maxPrice: { $max: '$maxPrice' } // 전체 중 최대 가격
      }
    });
    
    // 10. 최종 결과 정렬 및 포맷팅
    pipeline.push({
      $project: {
        _id: 1,
        vehicleId: 1,
        name: 1,
        imageUrl: 1,
        minPrice: 1,
        maxPrice: 1,
        manufacturer: 1
      }
    });
    
    pipeline.push({
      $sort: { minPrice: 1 } // 최소가격 순으로 정렬
    });
    
    
    // 디버깅: 브랜드 필터링 전 데이터 확인
    if (Object.keys(brandMatch).length > 0) {
      const beforeFilter = await this.vehicleModel.countDocuments(brandMatch).exec();
    }
    
    const vehicles = await this.vehicleModel.aggregate(pipeline).exec();
    
    if (vehicles.length > 0) {
    } else {
    }

    
    // 디버깅: 처음 몇 개 데이터 확인
    if (vehicles.length > 0) {
    }
    
    return vehicles;
  }

  async getModelsByMaker(makerId: string) {
    return this.vehicleModel.find({ brand_id: makerId }).exec();
  }

  async getTrims(vehicleId: string) {
    const vehicle = await this.vehicleModel.findById(vehicleId).exec();
    if (!vehicle) return [];
    return vehicle.trims || [];
  }

  // 리뷰 분석 데이터 조회
  async getReviewAnalysis(vehicleName: string) {
    if (!vehicleName) return null;
    
    try {
      const analysis = await this.reviewAnalysisModel.findOne({ 
        vehicle_name: vehicleName 
      }).lean().exec();
      
      return analysis;
    } catch (error) {
      return null;
    }
  }
}

