import { NestFactory } from '@nestjs/core';
import { ChatModule } from '../src/chat/chat.module';
import { ChatService } from '../src/chat/chat.service';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function bootstrap() {
  console.log('🚀 [Final Fix] 트림 ID 매핑 누락 해결 및 데이터 동기화 시작...');

  // 1. 기존 벡터 스토어 삭제
  const vectorStorePath = './vector_store';
  if (fs.existsSync(vectorStorePath)) {
      fs.rmSync(vectorStorePath, { recursive: true, force: true });
  }

  const app = await NestFactory.createApplicationContext(ChatModule);
  const chatService = app.get(ChatService);

  const mongoUrl = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db('triple_db');

    const danawaCol = db.collection('danawa_vehicle_data');
    const mfrCol = db.collection('manufacturers');
    const vehCol = db.collection('vehicles');
    const trimCol = db.collection('vehicletrims');
    const optCol = db.collection('vehicleoptions');

    const newVehicles = await danawaCol.find({}).toArray();
    console.log(`📦 총 ${newVehicles.length}대의 최신 차량 데이터를 처리합니다.`);

    let successCount = 0;

    for (const car of newVehicles as any[]) {
      process.stdout.write(`🔄 동기화: ${car.vehicle_name}... `);

      // 1️⃣ 제조사 동기화
      let mfrId: ObjectId;
      const existingMfr = await mfrCol.findOne({ name: car.brand_name });
      if (existingMfr) {
          mfrId = existingMfr._id;
      } else {
          const res = await mfrCol.insertOne({ name: car.brand_name });
          mfrId = res.insertedId;
      }

      // 2️⃣ 차량 모델 동기화
      let vehId: ObjectId;
      const existingVeh = await vehCol.findOne({ 
          $or: [
              { model_name: car.vehicle_name, manufacturer_id: mfrId },
              { name: car.vehicle_name, brand_id: mfrId }
          ]
      });

      if (existingVeh) {
          vehId = existingVeh._id;
          await vehCol.updateOne({ _id: vehId }, { $set: { 
              image_url: car.main_image,
              model_year: car.model_year,
              name: car.vehicle_name,       
              brand_id: mfrId
          }});
      } else {
          const res = await vehCol.insertOne({
              model_name: car.vehicle_name,
              manufacturer_id: mfrId,
              name: car.vehicle_name,
              brand_id: mfrId,
              image_url: car.main_image,
              model_year: car.model_year,
              created_at: new Date()
          });
          vehId = res.insertedId;
      }

      // 3️⃣ 트림 및 옵션 동기화
      const trims = car.trims || [];
      trims.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
      
      let baseTrimIdStr = ''; 

      for (let i = 0; i < trims.length; i++) {
          const t = trims[i];
          let trimId: ObjectId;

          const existingTrim = await trimCol.findOne({ 
              vehicle_id: vehId, 
              name: t.trim_name 
          });

          if (existingTrim) {
              trimId = existingTrim._id;
              await trimCol.updateOne({ _id: trimId }, { $set: { base_price: t.price } });
          } else {
              const res = await trimCol.insertOne({
                  vehicle_id: vehId,
                  name: t.trim_name,
                  base_price: t.price,
                  created_at: new Date()
              });
              trimId = res.insertedId;
          }

          // ★ [핵심 수정] 생성된 진짜 ID를 객체에 저장해둡니다. (나중에 텍스트 만들 때 씀)
          t.legacy_id = trimId.toString();

          if (i === 0) baseTrimIdStr = trimId.toString();

          // 옵션 동기화
          if (t.options && t.options.length > 0) {
              for (const o of t.options) {
                  const existingOpt = await optCol.findOne({ trim_id: trimId, name: o.option_name });
                  if (!existingOpt) {
                      await optCol.insertOne({
                          trim_id: trimId,
                          vehicle_id: vehId,
                          name: o.option_name,
                          price: o.option_price,
                          is_selected: false
                      });
                  }
              }
          }
      }

      // 4️⃣ 임베딩 데이터 생성
      const formatPrice = (p: number) => !p ? '가격 미정' : Math.round(p / 10000).toLocaleString() + '만원';
      const prices = trims.map((t: any) => t.price).filter((p: any) => typeof p === 'number');
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      // ★ [핵심 수정] 텍스트 생성 시 저장해둔 legacy_id를 포함시킵니다.
      const trimInfo = trims.map((t: any) => 
          `- ${t.trim_name} (ID: ${t.legacy_id}): ${formatPrice(t.price)}`
      ).join('\n        ');

      let optionText = '옵션 정보 없음';
      if (trims[0]?.options?.length > 0) {
        const optList = trims[0].options.map((o: any) => 
            `- ${o.option_name}: ${o.option_price ? formatPrice(o.option_price) : ''}`
        ).join('\n        ');
        optionText = `[주요 옵션 및 가격 (기본트림 기준)]\n        ${optList}`;
      }

      let specText = '';
      if (trims[0]?.specifications) {
          const s = trims[0].specifications;
          const keySpecs = ['복합 주행거리', '복합전비', '배터리 용량', '최고속도', '제로백', '충전시간 (급속)', '구동방식', '승차정원', '연료'];
          const specLines = keySpecs.filter(key => s[key]).map(key => `- ${key}: ${s[key]}`);
          if (specLines.length > 0) specText = `[주요 제원/스펙]\n        ${specLines.join('\n        ')}`;
      }

      const finalKnowledge = `
        [차량 정보]
        브랜드: ${car.brand_name}
        모델명: ${car.vehicle_name} (연식: ${car.model_year || '최신'})
        전체이름: ${car.vehicle_name_full || car.vehicle_name}

        [분류 정보]
        - 차종: ${car.vehicle_type || '기타'} 
        - 연료: ${car.fuel_type || '정보없음'}

        [가격 및 옵션 요약]
        가격 범위: ${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}
        이미지URL: ${car.main_image}

        ${specText}

        [트림별 상세 정보 (ID 포함)]
        ${trimInfo}

        ${optionText}

        [시스템 데이터]
        BaseTrimId: ${baseTrimIdStr} 
        OriginID: ${car._id}
      `.trim();

      const source = `car-${car._id}`;
      await chatService.addKnowledge(finalKnowledge, source);
      
      process.stdout.write(`✅ (BaseID: ${baseTrimIdStr})\n`);
      successCount++;
    }

    console.log(`\n🎉 완료! 이제 챗봇은 모든 트림의 진짜 ID를 알게 되었습니다.`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await client.close();
    await app.close();
  }
}

bootstrap();
