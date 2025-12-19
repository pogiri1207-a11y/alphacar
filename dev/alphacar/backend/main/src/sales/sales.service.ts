// src/sales/sales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalesRanking } from './schemas/sales-ranking.schema';
import { CreateSalesRankingDto } from './dto/create-sales-ranking.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(SalesRanking.name) private salesRankingModel: Model<SalesRanking>,
  ) {}

  // ✅ [복구됨] 데이터 적재용 함수 (POST 요청 처리)
  async create(createSalesRankingDto: CreateSalesRankingDto) {
    const createdRanking = new this.salesRankingModel({
      ...createSalesRankingDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return createdRanking.save();
  }

  // ✅ [유지] 데이터 조회용 함수 (GET 요청 처리) - 실제 DB 값인 'all', 'import' 사용
  async getLatestRankings() {
    console.log(`[3] 💾 SERVICE START: DB 조회 시작`);

    // 1. 국산차 조회 (DB 값: "all")
    const domestic = await this.salesRankingModel
      .findOne({ data_type: 'all' })
      .sort({ year: -1, month: -1 })
      .exec();
    
    console.log(`   👉 국산차(all) 데이터 발견: ${domestic ? 'YES' : 'NO'}`);

    // 2. 수입차 조회 (DB 값: "import")
    const foreign = await this.salesRankingModel
      .findOne({ data_type: 'import' })
      .sort({ year: -1, month: -1 })
      .exec();

    console.log(`   👉 수입차(import) 데이터 발견: ${foreign ? 'YES' : 'NO'}`);

    return {
      domestic: domestic ? domestic.rankings : [],
      foreign: foreign ? foreign.rankings : [],
    };
  }
}
