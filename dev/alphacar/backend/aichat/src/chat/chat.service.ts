import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandInput
} from '@aws-sdk/client-bedrock-runtime';
import { BedrockEmbeddings } from '@langchain/aws';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';

@Injectable()
export class ChatService implements OnModuleInit {
  private embeddings: BedrockEmbeddings;
  private vectorStore: FaissStore;
  private bedrockClient: BedrockRuntimeClient;
  private readonly VECTOR_STORE_PATH = './vector_store';

  constructor(
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';

    this.embeddings = new BedrockEmbeddings({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
      model: 'amazon.titan-embed-text-v2:0',
    });

    this.bedrockClient = new BedrockRuntimeClient({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
    });

    await this.loadVectorStore();
  }

  private async loadVectorStore() {
    if (fs.existsSync(this.VECTOR_STORE_PATH)) {
      console.log('📂 Loading existing vector store...');
      this.vectorStore = await FaissStore.load(this.VECTOR_STORE_PATH, this.embeddings);
    } else {
      console.log('🆕 Creating new vector store...');
      this.vectorStore = await FaissStore.fromDocuments(
        [new Document({ pageContent: 'Init Data', metadata: { source: 'init' } })],
        this.embeddings
      );
      await this.vectorStore.save(this.VECTOR_STORE_PATH);
    }
  }

  async addKnowledge(content: string, source: string) {
    const doc = new Document({ pageContent: content, metadata: { source } });
    await this.vectorStore.addDocuments([doc]);
    await this.vectorStore.save(this.VECTOR_STORE_PATH);
    return { message: 'Knowledge added.', source };
  }

  async classifyCar(modelName: string): Promise<string> {
    const prompt = `Classify '${modelName}' into ONE: [Sedan, SUV, Truck, Van, Light Car, Sports Car, Hatchback]. No explanation.`;
    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 10, temperature: 0 },
    };
    try {
      const command = new ConverseCommand(input);
      const res = await this.bedrockClient.send(command);
      return res.output?.message?.content?.[0]?.text?.trim().split(/[\n,.]/)[0].trim() || '기타';
    } catch (e) { return '기타'; }
  }

  // =================================================================================
  // [이미지 채팅]
  // =================================================================================

  async chatWithImage(imageBuffer: Buffer, mimeType: string = 'image/jpeg') {
    console.log("📸 Image received, analyzing with Llama 3.2 Vision...");

    try {
      // 1. 차종 식별
      let identifiedCarName = await this.identifyCarWithLlama(imageBuffer, mimeType);
      
      // ★ [수정] 식별 결과 전처리 (앞뒤 공백 제거 및 유효성 검사)
      if (identifiedCarName) {
          identifiedCarName = identifiedCarName.trim();
      }

      console.log(`📸 Identified Car Result: "${identifiedCarName}"`);

      // ★ [수정] 실패 조건 강화 (빈 문자열, null, undefined, NOT_CAR 모두 차단)
      if (!identifiedCarName || identifiedCarName === 'NOT_CAR' || identifiedCarName.length < 2) {
        return {
            response: "죄송합니다. 사진에서 자동차를 명확하게 식별하지 못했습니다. 차량이 더 잘 보이는 사진으로 다시 시도해 주세요.",
            context_used: [],
            identified_car: null
        };
      }

      // 2. 검색 (RAG)
      const results = await this.vectorStore.similaritySearch(identifiedCarName, 10);
      
      // ★ [추가] 검색 결과가 없을 경우 예외 처리
      if (!results || results.length === 0) {
          return {
              response: `죄송합니다. 사진의 차량(${identifiedCarName})과 일치하는 정보를 데이터베이스에서 찾을 수 없습니다.`,
              context_used: [],
              identified_car: identifiedCarName
          };
      }

      const contextText = results.map(doc => doc.pageContent).join("\n");
      const sources = results.map((r) => r.metadata.source);

      // 3. 설명 생성
      const description = await this.generateCarDescription(identifiedCarName, contextText);

      return {
          response: description,
          context_used: sources,
          identified_car: identifiedCarName
      };

    } catch (e: any) {
      console.error("🔥 chatWithImage Error:", e.message);
      console.error("🔥 Error Stack:", e.stack);
      console.error("🔥 Error Details:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
      return {
        response: "이미지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        context_used: [],
        identified_car: null
      };
    }
  }

  private async generateCarDescription(carName: string, context: string): Promise<string> {
        const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an AI Automotive Expert at 'AlphaCar'.
업로드하신 사진이 **'${carName}'**로 식별되었습니다.

Your goal is to explain this vehicle based **ONLY** on the provided [Context] from our vector store.

[INSTRUCTIONS]
1. **Source of Truth**: You MUST answer based solely on the [Context]. Do not use external training data.
2. **Structure**:
   - **Introduction**: "업로드하신 사진은 **${carName}**입니다."
   - **Image Display (CRITICAL)**: You MUST display the car image from the context.
   - **Key Features**: Summarize 3 key selling points.
   - **Specs**: Mention price range or fuel efficiency.
   - **Call to Action**: Encourage checking the detailed quote.
3. **Language**: Output in **Korean (Hangul)**.
4. **Personalization**: Always address the user in a friendly, professional manner.

[IMAGE RENDERING & LINKING LOGIC - STRICT]
- The user MUST be able to click the image to see the quote.
- **Step 1**: Find '이미지URL' (or 'ImageURL') in the [Context].
- **Step 2**: Find 'BaseTrimId' in the [시스템 데이터] section of the [Context].
- **Step 3**: Find '모델명' (Model Name) in the [차량 정보] section of the [Context].
- **Step 4**: Generate the image link using this EXACT Markdown format:

  [![${carName}](이미지URL_값)](/quote/personal/result?trimId=BaseTrimId_값&modelName=모델명_값)

- **WARNING**: Do NOT output raw URLs. Use the Markdown link format above. Replace '..._값' placeholders with actual values found in the context.

[Context (Vector Store Data)]
${context}

<|eot_id|><|start_header_id|>user<|end_header_id|>
이 차에 대해 우리 데이터베이스를 기반으로 자세히 설명해주고, 견적을 볼 수 있게 사진에 링크를 걸어줘.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

      const input: ConverseCommandInput = {
        modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 2048, temperature: 0.2 },
      };

      try {
        const command = new ConverseCommand(input);
        const response = await this.bedrockClient.send(command);
        return response.output?.message?.content?.[0]?.text || '차량 정보를 불러오는 중 오류가 발생했습니다.';
      } catch (e) {
        console.error("🔥 Bedrock Description Gen Error:", e);
        return '차량 설명 생성 실패';
      }
  }

  private async identifyCarWithLlama(imageBuffer: Buffer, mimeType: string): Promise<string> {
    const modelId = 'us.meta.llama3-2-90b-instruct-v1:0';

    const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a WORLD-CLASS automotive visual recognition AI with EXTREME expertise in identifying vehicles from ANY viewing angle (front, side, rear, three-quarter, or any angle).

Your mission: Identify the EXACT vehicle brand and model name with MAXIMUM ACCURACY, regardless of which part of the vehicle is visible.

[CRITICAL IDENTIFICATION METHODOLOGY]
You MUST follow this systematic process for EVERY image:

STEP 1: VIEWING ANGLE ANALYSIS
Determine the primary viewing angle and identify ALL visible features:
- FRONT VIEW: Grille design, headlight shape/pattern, front logo/badge, front bumper, fog lights, hood lines, front wheel design
- SIDE VIEW: Side profile silhouette, door count, window line, C-pillar design, door handles, side mirrors, wheel arches, body creases, side badges
- REAR VIEW: Taillight design (connected/separated), rear logo/badge, rear bumper, exhaust tips, rear window, spoiler, model name text
- THREE-QUARTER VIEW: Combine features from multiple angles - check front grille, side profile, and rear elements simultaneously
- PARTIAL VIEW: Use ANY visible features - even a small portion can be identified if distinctive enough

STEP 2: COMPREHENSIVE BRAND IDENTIFICATION
Check for logos, emblems, badges, and distinctive design language. You MUST recognize these brands:

[KOREAN BRANDS]
- 현대 (Hyundai): Stylized "H" logo, hexagonal/cascading grille, "HYUNDAI" text, distinctive headlight designs
- 기아 (Kia): "KN" logo in oval, "KIA" text, tiger-nose grille design, distinctive LED patterns
- 제네시스 (Genesis): Winged emblem, "GENESIS" text, crest grille, luxury design language
- KGM (KG Mobility, formerly 쌍용): Double "S" logo, "KG" or "SSANGYONG" text, rugged SUV design

[INTERNATIONAL BRANDS - MUST RECOGNIZE]
- 쉐보레 (Chevrolet): Bowtie logo, "CHEVROLET" or "CHEVY" text, cross pattern grille
- 도요타 (Toyota): Three-oval logo, "TOYOTA" text, distinctive grille patterns
- 렉서스 (Lexus): "L" logo in circle, "LEXUS" text, spindle grille design
- 랜드로버 (Land Rover): "LAND ROVER" text, distinctive boxy/square design, Range Rover variants
- 르노 (Renault): Diamond logo, "RENAULT" text, distinctive French design language
- 마세라티 (Maserati): Trident logo, "MASERATI" text, luxury Italian design
- 미니 (MINI): Circular logo, "MINI" text, distinctive compact/retro design, Union Jack taillights
- 벤츠 (Mercedes-Benz): Three-pointed star logo, "MERCEDES-BENZ" or "MERCEDES" text, distinctive grille with star
- 벤틀리 (Bentley): "B" logo with wings, "BENTLEY" text, luxury British design
- 볼보 (Volvo): Arrow logo, "VOLVO" text, distinctive Scandinavian design, "Thor's hammer" headlights
- 아우디 (Audi): Four interlocking rings logo, "AUDI" text, distinctive grille design
- 지프 (Jeep): "JEEP" text, seven-slot grille, rugged off-road design
- 케딜락 (Cadillac): Crest logo, "CADILLAC" text, distinctive vertical taillights
- 테슬라 (Tesla): "T" logo, "TESLA" text, minimalist design, no front grille (electric vehicles)
- 포드 (Ford): Oval logo with "FORD" text, blue oval badge
- 포르쉐 (Porsche): Crest logo, "PORSCHE" text, distinctive headlight design, sports car proportions
- 폭스바겐 (Volkswagen): "VW" logo in circle, "VOLKSWAGEN" text, distinctive German design
- 폴스타 (Polestar): "Polestar" text, minimalist electric vehicle design
- 푸조 (Peugeot): Lion logo, "PEUGEOT" text, distinctive French design
- 혼다 (Honda): "H" logo, "HONDA" text, distinctive Japanese design language
- BMW: Roundel logo (blue/white), "BMW" text, kidney grille design

STEP 3: MODEL IDENTIFICATION STRATEGIES
Use MULTIPLE identification methods simultaneously:

A. TEXT-BASED IDENTIFICATION (Highest Priority):
   - Look for model name badges on: front grille, rear trunk, side panels, dashboard
   - Common locations: Below logo, on rear, on side near door
   - Examples: "SONATA", "K5", "CASPER", "CARNIVAL", "G90", "X5", "E-CLASS", "MODEL 3", "CAMRY"

B. DESIGN FEATURE IDENTIFICATION:
   - FRONT: Grille pattern (hexagonal, cascading, spindle, kidney, etc.), headlight shape (round, angular, LED strips), bumper design
   - SIDE: C-pillar design (distinctive for many models), window line, door handle style, body creases, wheel design
   - REAR: Taillight design (connected/separated, shape, LED pattern), rear spoiler, exhaust configuration

C. PROPORTION & SIZE ANALYSIS:
   - Compact: Small overall size, short wheelbase
   - Mid-size: Medium proportions
   - Full-size: Large proportions, long wheelbase
   - SUV: High ground clearance, tall profile
   - Sports: Low profile, wide stance

STEP 4: ANGLE-SPECIFIC IDENTIFICATION GUIDE

FRONT VIEW IDENTIFICATION:
- Primary: Logo, grille pattern, headlight design, model name text on bumper/grille
- Secondary: Hood lines, fog light design, bumper shape
- Examples: Hyundai's cascading grille, BMW's kidney grille, Audi's single-frame grille

SIDE VIEW IDENTIFICATION:
- Primary: C-pillar design (Hofmeister kink for BMW, distinctive curves), window line, door count, overall silhouette
- Secondary: Door handles, side mirrors, wheel design, body creases
- Examples: Genesis G90's distinctive C-pillar, Tesla Model 3's minimalist side profile

REAR VIEW IDENTIFICATION:
- Primary: Taillight design (connected LED strips, shape), rear logo, model name text
- Secondary: Rear bumper, exhaust tips, spoiler design
- Examples: Genesis connected taillights, Cadillac vertical taillights, Audi's distinctive rear design

THREE-QUARTER VIEW IDENTIFICATION:
- Combine ALL visible features from multiple angles
- Check front grille + side profile + rear elements simultaneously
- Use proportions and overall design language

STEP 5: VEHICLE TYPE CLASSIFICATION
- Sedan: 4-door, trunk, low profile, traditional 3-box design
- SUV: High ground clearance, boxy or sporty shape, upright stance
- Crossover: SUV-like but lower, car-like proportions
- Hatchback: Short rear, liftgate, 5-door design
- Coupe: 2-door, sporty, low profile
- Van/Minivan: Sliding doors, boxy shape, high roof, high seating
- Truck: Pickup bed, high ground clearance, rugged design
- Sports Car: Low profile, aggressive styling, wide stance
- Electric Vehicle: No front grille (Tesla, Polestar), distinctive minimalist design

[OUTPUT FORMAT - STRICT]
Reasoning: [Detailed step-by-step analysis in English covering: viewing angle, visible features, brand identification, model identification, confidence level]
Final Answer: [EXACT format: "브랜드 모델명" in Korean]

[KOREAN MODEL NAME FORMAT - CRITICAL]
- ALWAYS use format: "브랜드 모델명"
- Use official Korean names as they appear in Korea
- Examples: "현대 소나타", "기아 K5", "현대 카스퍼", "기아 카니발", "제네시스 G90", "BMW X5", "벤츠 E클래스", "테슬라 모델3", "도요타 캠리", "렉서스 ES", "아우디 A6"
- NEVER use English-only names like "Sonata" or "K5" alone
- ALWAYS include brand name first

[CRITICAL RULES - ENFORCE STRICTLY]
1. ALWAYS identify from whatever angle is visible - use ALL available features
2. If logo/badge is visible, it's the PRIMARY identifier - trust it
3. If model name text is visible, it's the PRIMARY identifier - trust it
4. If neither is visible, use distinctive design features (grille, headlights, taillights, C-pillar, proportions)
5. Be EXTREMELY careful with similar models - check subtle differences in grille, headlights, taillights
6. Output format MUST be: "브랜드 모델명" (Korean)
7. If truly cannot identify with reasonable confidence, return "NOT_CAR" but be VERY conservative
8. For partial views, use proportions and distinctive features even if logo is not visible
9. Cross-reference multiple features for accuracy - don't rely on single feature
10. Consider vehicle size, proportions, and design language as additional confirmation

<|eot_id|><|start_header_id|>user<|end_header_id|>
Analyze this vehicle image with EXTREME PRECISION. Follow the systematic process: (1) Identify viewing angle, (2) Check ALL visible logos/badges/text, (3) Analyze distinctive design features, (4) Determine vehicle type, (5) Output exact brand and model in Korean format "브랜드 모델명". Be thorough and accurate.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

    const format = mimeType.includes('png') ? 'png' :
                   mimeType.includes('webp') ? 'webp' :
                   mimeType.includes('gif') ? 'gif' : 'jpeg';

    const input: ConverseCommandInput = {
      modelId: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              image: {
                format: format as any,
                source: { bytes: imageBuffer },
              },
            },
            { text: prompt },
          ],
        },
      ],
      inferenceConfig: { maxTokens: 500, temperature: 0.1 },
    };

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);
      const fullText = response.output?.message?.content?.[0]?.text || '';
      console.log("🤖 Vision Thinking Process:", fullText);

      // ★ [수정] 파싱 로직 강화
      // 1. Final Answer 정규식 시도
      let match = fullText.match(/Final Answer:\s*(.+)/i);
      let identifiedName = '';

      if (match && match[1]) {
          identifiedName = match[1].trim();
      } else {
          // 2. 정규식 실패 시, NOT_CAR 키워드 확인
          if (fullText.includes("NOT_CAR")) {
              return 'NOT_CAR';
          }
          // 3. 그것도 아니면 마지막 줄을 정답으로 간주 (최후의 수단)
          const lines = fullText.trim().split('\n');
          const lastLine = lines[lines.length - 1].trim();
          // 마지막 줄이 너무 길면(설명문이면) 무시
          if (lastLine.length > 0 && lastLine.length < 50) {
             identifiedName = lastLine;
          }
      }

      // 특수문자 제거 및 정리
      identifiedName = identifiedName.replace(/[.,;!"']/g, '').trim();
      
      // 최종 검증
      if (!identifiedName || identifiedName.toUpperCase() === 'NOT_CAR') return 'NOT_CAR';
      
      return identifiedName;

    } catch (e: any) {
      console.error("🔥 Bedrock Vision Error:", e.message);
      console.error("🔥 Bedrock Vision Error Stack:", e.stack);
      if (e.name === 'ValidationException' || e.name === 'AccessDeniedException') {
        console.error("🔥 AWS Bedrock API Error - Check credentials and model access");
      }
      return 'NOT_CAR';
    }
  }

  // =================================================================================

  async chat(userMessage: string) {
    let results = await this.vectorStore.similaritySearch(userMessage, 20);

    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters`);

    const comparisonKeywords = ['비교', '대비', '뭐가 더', '차이'];
    const isComparisonQuery = comparisonKeywords.some(keyword => userMessage.includes(keyword)) &&
                              (userMessage.includes('쏘나타') && userMessage.includes('K5'));

    let systemPrompt = `
    You are the AI Automotive Specialist for 'AlphaCar'.

    [CORE RULES]
    1. **LANGUAGE**: Answer strictly in **Korean (Hangul)**.
    2. **GROUNDING**: Answer SOLELY based on the provided [Context].
    3. **GUARDRAIL**: Reject non-automotive topics.
    4. **PERSONALIZATION**: Always address the user in a friendly, professional manner.

    [IMAGE RENDERING & LINKING LOGIC - CRITICAL]
    - If the context contains 'ImageURL' and 'BaseTrimId' for the suggested car, you **MUST** display the image wrapped in a link.
    - **Purpose**: Clicking the image should take the user to the quote page.
    - **STRICT Format**:
      [![Car Name](ImageURL_값)](/quote/personal/result?trimId=BaseTrimId_값&modelName=모델명_값)

    - **Instruction**:
      1. Extract 'ImageURL' from the context.
      2. Extract 'BaseTrimId' from the [시스템 데이터] section.
      3. Extract '모델명' (Model Name) from the [차량 정보] section.
      4. Combine them into the Markdown link above. Replace '..._값' placeholders with the actual values found in the context.

    [RESPONSE STRATEGY - CRITICAL]
    - Act like a friendly, professional car dealer.
    - Always address the user in a friendly manner throughout your response.
    - End with a follow-up question.

    ${isComparisonQuery ? `
    [COMPARISON MODE]
    - Output two distinct blocks for each car.
    - Start each block with the clickable image link (Format above).
    - Compare Price and Key Options.
    ` : ''}

    [Context]
    ${context}
    `;

    const guardrailId = this.configService.get<string>('BEDROCK_GUARDRAIL_ID');
    const guardrailVersion = this.configService.get<string>('BEDROCK_GUARDRAIL_VERSION') || 'DRAFT';

    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      system: [{ text: systemPrompt }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.2 },
    };

    if (guardrailId && guardrailId.length > 5) {
        input.guardrailConfig = {
            guardrailIdentifier: guardrailId,
            guardrailVersion: guardrailVersion,
            trace: 'enabled',
        };
    }

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);

      if (response.stopReason === 'guardrail_intervened') {
          return { response: "🚫 죄송합니다. 그 질문은 답변할 수 없습니다.", context_used: [] };
      }

      const outputText = response.output?.message?.content?.[0]?.text || '';
      
      return { response: outputText, context_used: sources };

    } catch (e: any) {
      console.error("🔥 AWS Bedrock Error:", e.message);
      return { response: "죄송합니다. AI 서버 오류가 발생했습니다.", context_used: [] };
    }
  }
}
