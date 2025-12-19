import { NestFactory } from '@nestjs/core';
import { ChatModule } from '../src/chat/chat.module';
import { ChatService } from '../src/chat/chat.service';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import { ConverseCommand, ConverseCommandInput } from '@aws-sdk/client-bedrock-runtime';

dotenv.config();

const MODEL_ID = 'us.meta.llama3-3-70b-instruct-v1:0';

async function bootstrap() {
  console.log('🚀 [AI Review Analysis V9] TS 에러 수정 및 통합 분석 시작...');

  const app = await NestFactory.createApplicationContext(ChatModule);
  const chatService = app.get(ChatService);
  const bedrockClient = chatService['bedrockClient']; 

  const mongoUrl = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db('triple_db');
    
    const vehicleCol = db.collection('danawa_vehicle_data');
    const analysisCol = db.collection('review_analysis'); 

    // 0️⃣ 초기화
    console.log('🧹 기존 분석 데이터를 초기화합니다...');
    await analysisCol.deleteMany({});

    // 1️⃣ 데이터 로드
    const allVehicles = await vehicleCol.find({ 
        review: { $exists: true, $not: { $size: 0 } } 
    }).toArray();

    // 2️⃣ 그룹화 (TS 에러 수정된 로직)
    const groupedVehicles = new Map<string, { 
        ids: ObjectId[], 
        brand_name: string, 
        reviews: any[] 
    }>();

    for (const v of allVehicles) {
        const name = v.vehicle_name; 
        
        // 💡 [수정] get()을 먼저 하고, 없으면 생성해서 넣는 방식으로 변경 (Undefined 에러 방지)
        let group = groupedVehicles.get(name);
        
        if (!group) {
            group = { 
                ids: [], 
                brand_name: v.brand_name, 
                reviews: [] 
            };
            groupedVehicles.set(name, group);
        }
        
        // 이제 group은 무조건 존재함
        group.ids.push(v._id);
        if (Array.isArray(v.review)) {
            group.reviews.push(...v.review);
        }
    }

    console.log(`🔍 총 ${allVehicles.length}개의 데이터를 -> ${groupedVehicles.size}개의 차종으로 통합했습니다.`);

    // 3️⃣ 통합 분석 실행
    for (const [vehicleName, groupData] of groupedVehicles) {
        process.stdout.write(`🧠 통합 분석 중: ${vehicleName} (원본데이터 ${groupData.ids.length}개)... `);

        // --- 중복 제거 ---
        const uniqueReviewMap = new Map();
        for (const r of groupData.reviews) {
            const key = r.review_id || r.content;
            if (!uniqueReviewMap.has(key)) {
                uniqueReviewMap.set(key, r);
            }
        }
        const uniqueReviews = Array.from(uniqueReviewMap.values());
        
        if (uniqueReviews.length === 0) {
            console.log(' -> 유효 리뷰 없음 (Skip)');
            continue;
        }

        // --- 평점 계산 ---
        let totalOverall = 0;
        const breakdownSum = {
            driving_performance: 0, price: 0, comfort: 0, quality: 0, design: 0, fuel_efficiency: 0
        };
        let validScoreCount = 0;

        for (const r of uniqueReviews) {
            if (typeof r.overall_rating === 'number' && r.overall_rating > 0 && r.overall_rating <= 10) {
                totalOverall += r.overall_rating;
                if (r.rating_breakdown) {
                    breakdownSum.driving_performance += (r.rating_breakdown.driving_performance || 0);
                    breakdownSum.price += (r.rating_breakdown.price || 0);
                    breakdownSum.comfort += (r.rating_breakdown.comfort || 0);
                    breakdownSum.quality += (r.rating_breakdown.quality || 0);
                    breakdownSum.design += (r.rating_breakdown.design || 0);
                    breakdownSum.fuel_efficiency += (r.rating_breakdown.fuel_efficiency || 0);
                }
                validScoreCount++;
            }
        }

        const avgStats = {
            average_score: validScoreCount > 0 ? Number((totalOverall / validScoreCount).toFixed(1)) : 0,
            total_reviews: uniqueReviews.length,
            radar_chart: {
                driving: validScoreCount > 0 ? Number((breakdownSum.driving_performance / validScoreCount).toFixed(1)) : 0,
                price: validScoreCount > 0 ? Number((breakdownSum.price / validScoreCount).toFixed(1)) : 0,
                comfort: validScoreCount > 0 ? Number((breakdownSum.comfort / validScoreCount).toFixed(1)) : 0,
                quality: validScoreCount > 0 ? Number((breakdownSum.quality / validScoreCount).toFixed(1)) : 0,
                design: validScoreCount > 0 ? Number((breakdownSum.design / validScoreCount).toFixed(1)) : 0,
                fuel: validScoreCount > 0 ? Number((breakdownSum.fuel_efficiency / validScoreCount).toFixed(1)) : 0,
            }
        };

        // --- AI 분석 ---
        const reviewTexts = uniqueReviews.map((r: any) => r.content).join('\n');
        const truncatedText = reviewTexts.slice(0, 25000); 

        const prompt = `
        You are an expert car review analyst. Analyze the following user reviews for "${vehicleName}".
        
        [Reviews]
        ${truncatedText}

        [Instructions]
        Provide the output in valid JSON format ONLY. Do not add any explanation.
        1. "summary": A list of 3 strings summarizing the reviews in Korean (polite informal style).
        2. "pros": A list of 3-5 keywords for pros in Korean.
        3. "cons": A list of 3-5 keywords for cons in Korean.
        4. "sentiment_ratio": An object with "positive" and "negative" numbers (sum must be 100).

        Example JSON:
        {
          "summary": ["연비가 좋음", "디자인이 예쁨", "소음이 있음"],
          "pros": ["연비", "디자인"],
          "cons": ["소음"],
          "sentiment_ratio": { "positive": 80, "negative": 20 }
        }
        `;

        const input: ConverseCommandInput = {
            modelId: MODEL_ID,
            messages: [{ role: 'user', content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens: 1024, temperature: 0.1 },
        };

        let aiResult = {};
        try {
            const command = new ConverseCommand(input);
            const response = await bedrockClient.send(command);
            const responseText = response.output?.message?.content?.[0]?.text || '{}';
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
            aiResult = JSON.parse(jsonStr);
        } catch (e) {
            console.error(`AI 분석 실패: ${e.message}`);
            aiResult = { summary: [], pros: [], cons: [], sentiment_ratio: { positive: 0, negative: 0 } };
        }

        // --- 저장 (Upsert) ---
        const analysisDoc = {
            vehicle_name: vehicleName,
            brand_name: groupData.brand_name,
            related_vehicle_ids: groupData.ids,
            ...avgStats,
            ...aiResult,
            updated_at: new Date()
        };

        await analysisCol.updateOne(
            { vehicle_name: vehicleName },
            { $set: analysisDoc },
            { upsert: true }
        );

        process.stdout.write(`✅ 완료 (리뷰 ${uniqueReviews.length}건)\n`);
    }

    console.log('🎉 차종별 통합 분석이 완료되었습니다!');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await client.close();
    await app.close();
  }
}

bootstrap();
