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

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';

    // 1. 임베딩 모델 (LangChain)
    this.embeddings = new BedrockEmbeddings({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
      model: 'amazon.titan-embed-text-v2:0',
    });

    // 2. Bedrock SDK Client (Converse API용)
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

  // [기존 유지] AI 텍스트 기반 차종 분류 (Llama 3.3 70B)
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
  // [신규 기능] 이미지 채팅 (Llama 3.2 Vision + RAG Pipeline + CoT Reasoning)
  // =================================================================================

  async chatWithImage(imageBuffer: Buffer, mimeType: string = 'image/jpeg') {
    console.log("📸 Image received, analyzing with Llama 3.2 Vision...");

    // 1. Vision 모델로 차종 식별 (추론 로직 적용됨)
    const identifiedCarName = await this.identifyCarWithLlama(imageBuffer, mimeType);

    if (identifiedCarName === 'NOT_CAR') {
        return {
            response: "죄송합니다. 사진에서 자동차를 명확하게 식별하지 못했습니다. 차량이 잘 보이는 사진으로 다시 시도해 주세요.",
            context_used: [],
            identified_car: null
        };
    }

    console.log(`📸 Identified Car: ${identifiedCarName}`);

    // 2. 식별된 차종으로 벡터 스토어 검색 (RAG)
    // 메모리에 로드된 this.vectorStore 사용 (디스크 로드 최소화)
    const results = await this.vectorStore.similaritySearch(identifiedCarName, 10);
    const contextText = results.map(doc => doc.pageContent).join("\n");
    const sources = results.map((r) => r.metadata.source);

    // 3. 검색된 정보(Context)를 기반으로 설명 생성 (Generate Description)
    const description = await this.generateCarDescription(identifiedCarName, contextText);

    return {
        response: description,
        context_used: sources,
        identified_car: identifiedCarName
    };
  }

  // [Helper] 식별된 정보로 설명 생성 (Llama 3.3 70B 사용)
  private async generateCarDescription(carName: string, context: string): Promise<string> {
      const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an AI Automotive Expert at 'AlphaCar'.
An image uploaded by the user has been identified as **'${carName}'**.

Your goal is to explain this vehicle to the user based **ONLY** on the provided [Context] from our vector store.

[INSTRUCTIONS]
1. **Source of Truth**: You MUST answer based solely on the [Context]. Do not use external training data.
2. **Structure**:
   - **Introduction**: "업로드하신 사진은 **${carName}**입니다." (Confirm the identity first).
   - **Key Features**: Summarize 3 key selling points from the context.
   - **Specs**: Mention price range or fuel efficiency if available in the context.
   - **Dealer Persona**: Be professional yet friendly.
3. **Language**: Output in **Korean (Hangul)**.

[Context (Vector Store Data)]
${context}

<|eot_id|><|start_header_id|>user<|end_header_id|>
이 차에 대해 우리 데이터베이스를 기반으로 자세히 설명해줘.
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

  // [Helper] 이미지 식별 (Llama 3.2 90B Vision) - 추론(Reasoning) 로직 강화
  private async identifyCarWithLlama(imageBuffer: Buffer, mimeType: string): Promise<string> {
    const modelId = 'us.meta.llama3-2-90b-instruct-v1:0';

    const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert automotive visual recognition AI.
Your task is to identify the vehicle in the image with extreme precision, distinguishing between similar boxy vehicles like Vans, SUVs, and Pickup Trucks.

[CRITICAL ANALYSIS STEPS]
Before giving the final answer, you MUST analyze the image step-by-step:
1. **Emblem/Logo Check**: Look specifically at the logo.
   - Is it 'Kia' (KN or Oval)? -> Then consider Carnival/Sorento.
   - Is it 'SsangYong'/'KGM' (Winged logo, Two Dragons, or 'KG')? -> Then consider Musso, Rexton, Torres, Actyon.
2. **Body Type Check**:
   - Open Cargo Bed? -> It is a **Pickup Truck** (e.g., Musso, Rexton Sports Khan). It is NOT a Carnival.
   - Sliding Doors? -> It is a **Minivan** (e.g., Carnival).
   - Sloping Coupe Roof? -> It might be an Actyon or XM3.
3. **Final Decision**: Combine the logo and body type to confirm the model.

[OUTPUT FORMAT]
You must output in the following structure exactly:

Reasoning: [Describe the logo, grill, and body type you see in English]
Final Answer: [Manufacturer ModelName in Korean]

[EXAMPLES]
User: 
Assistant:
Reasoning: I see a winged logo on the grill, which is SsangYong. It has an open cargo bed in the rear, making it a pickup truck. It looks like the Khan model.
Final Answer: 쌍용 렉스턴 스포츠 칸

User: 
Assistant:
Reasoning: The logo is the new KN logo. It has a long body with sliding door rails. It is a minivan.
Final Answer: 기아 카니발

User: 

[Image of a Dog]

Assistant:
Reasoning: This is an animal, not a vehicle.
Final Answer: NOT_CAR
<|eot_id|><|start_header_id|>user<|end_header_id|>
Identify the car in this image following the steps above.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

    const format = mimeType === 'image/png' ? 'png' :
                   mimeType === 'image/webp' ? 'webp' :
                   mimeType === 'image/gif' ? 'gif' : 'jpeg';

    const input: ConverseCommandInput = {
      modelId: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              image: {
                format: format as any, // Type casting for safety
                source: { bytes: imageBuffer },
              },
            },
            { text: prompt },
          ],
        },
      ],
      // 토큰을 조금 더 늘려줍니다 (추론 글을 써야 하므로)
      inferenceConfig: { maxTokens: 300, temperature: 0.1 },
    };

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);

      const fullText = response.output?.message?.content?.[0]?.text || '';
      console.log("🤖 Vision Thinking Process:", fullText); // 로그로 추론 과정 확인 가능

      // 파싱 로직: "Final Answer:" 뒷부분만 추출
      const match = fullText.match(/Final Answer:\s*(.*)/i);
      
      let identifiedName = 'NOT_CAR';
      if (match && match[1]) {
          identifiedName = match[1].trim();
      } else if (fullText.includes("NOT_CAR")) {
          identifiedName = "NOT_CAR";
      } else {
          // 형식이 안 맞을 경우 전체 텍스트에서 한글/영어 모델명 추정 (Fallback)
          identifiedName = fullText.replace(/Reasoning:[\s\S]*?Final Answer:/i, "").trim();
      }

      // 후처리: 불필요한 특수문자 제거
      identifiedName = identifiedName.replace(/\.$/, '').trim();

      if (identifiedName.includes('NOT_CAR')) return 'NOT_CAR';
      
      return identifiedName;

    } catch (e) {
      console.error("🔥 Bedrock Vision Error:", e);
      return 'NOT_CAR';
    }
  }

  // =================================================================================

  async chat(userMessage: string) {
    // 1. RAG 검색
    // 검색량을 50개로 유지합니다.
    let results = await this.vectorStore.similaritySearch(userMessage, 50);

    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters`);

    // 👇 [FIX: 비교 모드 감지 로직]
    const comparisonKeywords = ['비교', '대비', '뭐가 더', '차이'];
    const isComparisonQuery = comparisonKeywords.some(keyword => userMessage.includes(keyword)) &&
                              (userMessage.includes('쏘나타') && userMessage.includes('K5')); // 예시 로직 유지

    // 2. 시스템 프롬프트 (최신 업데이트: 딜러 페르소나 및 가드레일 강화)
    let systemPrompt = `
    You are the AI Automotive Specialist for 'AlphaCar'.

    [CORE RULES - STRICT COMPLIANCE]
    1. **LANGUAGE**: Answer strictly in **Korean (Hangul)**. No Hanja.
    2. **GROUNDING**: Answer SOLELY based on the provided [Context].
    3. **GUARDRAIL**: If the user asks about Non-Automotive topics, REJECT immediately.
    4. **Image**: The provided context contains image paths (labeled as 'imageUrl' or '이미지경로'). You MUST extract the exact image path associated with the analyzed vehicle from the context and include it in the response. Do not generate a fake URL; use only the path provided in the source data.

    [CONVERSATION FLOW - KEEP IT ALIVE]
    **Do NOT just answer and stop.** Always end your response with a **Follow-up Question** to guide the user.

    - **If you recommended cars**: "이 중에서 마음에 드는 모델이 있으신가요? 아니면 다른 조건(예: 연비, 디자인)으로 더 찾아볼까요?"
    - **If you gave a price**: "생각하신 예산 범위에 맞으신가요? 할부 견적이나 옵션 정보도 알려드릴까요?"
    - **If info is missing**: "더 정확한 추천을 위해 선호하시는 브랜드나 연료 타입(전기/가솔린)을 알려주시겠어요?"
    - **General**: Act like a friendly and proactive car dealer.

    [RESPONSE_STRATEGY]
    1. **QUANTITY**: Recommend at least 3 different models if possible.
    2. **FORMAT**: Use a numbered list.
    3. **Persona**: Adapt to the context of the question and respond kindly and professionally, acting as if a **seasoned car dealer** is consulting face-to-face. (Avoid a stiff, robotic tone).
       - **⚠️ Data Guardrails**: Even while maintaining a natural conversation flow, you **MUST** state vehicle specifications, prices, and features **EXACTLY as provided in the [Context]**. Do not hallucinate or invent non-existent options or prices for the sake of roleplay.

    // 👇 [최종 FIX] 비교 쿼리일 경우, 구조화된 블록 출력을 강제하여 정보 누락을 막습니다.
    ${isComparisonQuery ? `
    4. **COMPARISON_RULE (CRITICAL)**: The user wants a side-by-side comparison. YOU MUST NOT fail to find either model. Search the Context for both "쏘나타" and "K5". Your entire response MUST output two distinct, separate content blocks (one for Sonata, one for K5) separated only by TWO consecutive newlines (\\n\\n).
    5. **BLOCK_STRUCTURE**: Each block MUST start with the image link for the model it describes, followed immediately by a short summary of its Price Range and Key Options text. DO NOT output a comparison table. DO NOT output the block numbers (1, 2).
    ` : `
    4. **IMAGE_PRIORITY**: If the context provides the ImageURL and BaseTrimId for the car you are discussing, you MUST include its image and link following the [IMAGE RENDERING & LINKING LOGIC].
    `}

    [SMART FILTERING LOGIC]
    1. **Price Flexibility**: Allow ±10% margin.
    2. **Type Filtering**:
        - "Sedan" -> Sedan/Coupe/Hatchback.
        - "SUV" -> SUV/RV.
    3. **Scenarios**:
        - "Camping": SUV, Van.
        - "Commute/First Car": Compact Sedan, Hybrid, Light Car.

    [IMAGE RENDERING & LINKING LOGIC]
    - MUST display images if 'ImageURL' exists in context.
    - **CRITICAL**: You MUST wrap the image in a link to the quote page.

    - **⛔ STRICT RULE (NO RAW URLs)**:
      - Do NOT write the raw Image URL (http://...) as plain text in the response.
      - ONLY output the URL inside the Markdown link syntax.

    - **ID Selection Rules (Smart Linking)**:
      1. Find the **BaseTrimId** value from the [시스템 데이터] section of the vehicle you are describing.
      2. **ABSOLUTELY MUST**: The resulting link MUST use the actual ID value, not a placeholder.

    - **Link Format (Template - MUST FOLLOW)**:
      [![Car Model Name](ImageURL)](/quote/personal/result?trimId=실제_BaseTrimId_값)

    [Context]
    ${context}
    `;

    // 3. Bedrock Converse API (Llama 3.3 70B - 텍스트 생성용)
    const guardrailId = this.configService.get<string>('BEDROCK_GUARDRAIL_ID');
    const guardrailVersion = this.configService.get<string>('BEDROCK_GUARDRAIL_VERSION') || 'DRAFT';

    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      system: [{ text: systemPrompt }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.2 }, // 토큰 수 2048로 최적화
    };

    if (guardrailId && guardrailId.length > 5) {
        input.guardrailConfig = {
            guardrailIdentifier: guardrailId,
            guardrailVersion: guardrailVersion,
            trace: 'enabled',
        };
        console.log(`🛡️ Guardrail Active: ${guardrailId} (${guardrailVersion})`);
    }

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);

      if (response.stopReason === 'guardrail_intervened') {
          console.log("🚫 Blocked by AWS Guardrail!");
          return {
              response: "🚫 죄송합니다. 그 질문은 답변할 수 없습니다.",
              context_used: [],
          };
      }

      const outputText = response.output?.message?.content?.[0]?.text || '';
      return { response: outputText, context_used: sources };

    } catch (e: any) {
      console.error("🔥 AWS Bedrock Error:", e.message);
      if (e.name === 'ValidationException' && e.message.includes('guardrail')) {
         return {
             response: `⚠️ [System Error] Guardrail Config Error.\n${e.message}`,
             context_used: []
         };
      }
      return {
          response: "죄송합니다. AI 서버 오류가 발생했습니다.",
          context_used: []
      };
    }
  }
}
