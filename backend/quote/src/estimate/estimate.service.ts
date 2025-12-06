import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// ✅ 경로 수정: '../schemas/estimate.schema' -> './schemas/estimate.schema'
import { Estimate, EstimateDocument } from './schemas/estimate.schema'; 
import { CreateEstimateDto } from './dto/create-estimate.dto';

@Injectable()
export class EstimateService {
  constructor(
    @InjectModel(Estimate.name, 'estimate_conn')
    private estimateModel: Model<EstimateDocument>,
  ) {}
  // 1. 견적 저장
  async create(createEstimateDto: CreateEstimateDto) {
    const createdEstimate = new this.estimateModel(createEstimateDto);
    return createdEstimate.save();
  }

  // 2. 내 견적 목록 조회
  async findAll(userId: string) {
    return this.estimateModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  // 3. 내 견적 개수 조회 (마이페이지용)
  async count(userId: string) {
    return this.estimateModel.countDocuments({ userId }).exec();
  }

  // 4. 견적 삭제 메서드
  async delete(id: string) {
    return this.estimateModel.findByIdAndDelete(id).exec();
  }
}
