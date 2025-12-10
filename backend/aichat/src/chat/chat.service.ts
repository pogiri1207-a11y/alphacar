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

  // [기존 유지] AI 텍스트 기반 차종 분류
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

    try {
      // 1. Vision 모델로 차종 식별
      const identifiedCarName = await this.identifyCarWithLlama(imageBuffer, mimeType);

      console.log(`📸 Identified Car Result: "${identifiedCarName}"`);

      // ★ [수정] 방어 코드: 식별 실패 시 RAG 검색을 건너뛰고 에러 메시지 반환
      if (!identifiedCarName || identifiedCarName === 'NOT_CAR' || identifiedCarName.trim() === '') {
        return {
            response: "죄송합니다. 사진에서 자동차를 명확하게 식별하지 못했습니다. 차량이 잘 보이는 사진으로 다시 시도해 주세요.",
            context_used: [],
            identified_car: null
        };
      }

      // 2. 식별된 차종으로 벡터 스토어 검색 (RAG)
      // identifiedCarName이 확실히 문자열일 때만 실행됨
      const results = await this.vectorStore.similaritySearch(identifiedCarName, 10);
      const contextText = results.map(doc => doc.pageContent).join("\n");
      const sources = results.map((r) => r.metadata.source);

      // 3. 검색된 정보(Context)를 기반으로 설명 생성 (링크 포함 기능 추가됨)
      const description = await this.generateCarDescription(identifiedCarName, contextText);

      return {
          response: description,
          context_used: sources,
          identified_car: identifiedCarName
      };

    } catch (e: any) {
      console.error("🔥 chatWithImage Error:", e.message);
      return {
        response: "이미지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        context_used: [],
        identified_car: null
      };
    }
  }

  // [Helper] 식별된 정보로 설명 생성 (Llama 3.3 70B 사용) - 링크 로직 수정됨
  private async generateCarDescription(carName: string, context: string): Promise<string> {
      const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an AI Automotive Expert at 'AlphaCar'.
An image uploaded by the user has been identified as **'${carName}'**.

Your goal is to explain this vehicle to the user based **ONLY** on the provided [Context] from our vector store.

[INSTRUCTIONS]
1. **Source of Truth**: You MUST answer based solely on the [Context]. Do not use external training data.
2. **Structure**:
   - **Introduction**: "업로드하신 사진은 **${carName}**입니다."
   - **Image Display (CRITICAL)**: You MUST display the car image from the context.
   - **Key Features**: Summarize 3 key selling points.
   - **Specs**: Mention price range or fuel efficiency.
   - **Call to Action**: Encourage checking the detailed quote.
3. **Language**: Output in **Korean (Hangul)**.

[IMAGE RENDERING & LINKING LOGIC - STRICT]
- The user MUST be able to click the image to see the quote.
- **Step 1**: Find '이미지URL' (or 'ImageURL') in the [Context].
- **Step 2**: Find 'BaseTrimId' in the [시스템 데이터] section of the [Context].
- **Step 3**: Find '모델명' (Model Name) in the [차량 정보] section of the [Context].
- **Step 4**: Generate the image link using this EXACT Markdown format:

  [![${carName}](이미지URL_값)](/quote/personal/result?trimId=BaseTrimId_값&modelName=모델명_값)

- **WARNING**: Do NOT output raw URLs. Only use the Markdown link format above. Replace '..._값' placeholders with actual values found in the context.

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

  // [Helper] 이미지 식별 (Llama 3.2 90B Vision)
  private async identifyCarWithLlama(imageBuffer: Buffer, mimeType: string): Promise<string> {
    const modelId = 'us.meta.llama3-2-90b-instruct-v1:0';

    const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert automotive visual recognition AI.
Your task is to identify the vehicle in the image with extreme precision.

[OUTPUT FORMAT]
Reasoning: [Reasoning in English]
Final Answer: [Manufacturer ModelName in Korean]

[EXAMPLES]
User:
Assistant:
Reasoning: I see the KN logo and sliding doors. It is a minivan.
Final Answer: 기아 카니발

User:
Assistant:
Reasoning: This is a dog.
Final Answer: NOT_CAR
<|eot_id|><|start_header_id|>user<|end_header_id|>
Identify the car in this image.
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
      inferenceConfig: { maxTokens: 300, temperature: 0.1 },
    };

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);
      const fullText = response.output?.message?.content?.[0]?.text || '';
      console.log("🤖 Vision Thinking Process:", fullText);

      // ★ [수정] 결과 파싱 로직 강화
      const match = fullText.match(/Final Answer:\s*(.*)/i);
      let identifiedName = 'NOT_CAR';

      if (match && match[1]) {
          identifiedName = match[1].trim();
      } else if (fullText.includes("NOT_CAR")) {
          identifiedName = "NOT_CAR";
      } else {
          // Final Answer 형식이 깨졌을 때 마지막 줄을 가져오기 시도
          const lines = fullText.trim().split('\n');
          const lastLine = lines[lines.length - 1].trim();
          if (lastLine.length > 0 && lastLine.length < 50) {
             identifiedName = lastLine;
          }
      }

      // 특수문자 제거
      identifiedName = identifiedName.replace(/\.$/, '').trim();
      
      if (!identifiedName) return 'NOT_CAR';
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
    let results = await this.vectorStore.similaritySearch(userMessage, 20);

    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters`);

    const comparisonKeywords = ['비교', '대비', '뭐가 더', '차이'];
    const isComparisonQuery = comparisonKeywords.some(keyword => userMessage.includes(keyword)) &&
                              (userMessage.includes('쏘나타') && userMessage.includes('K5'));

    // 2. 시스템 프롬프트 (링크 로직 수정됨)
    let systemPrompt = `
    You are the AI Automotive Specialist for 'AlphaCar'.

    [CORE RULES]
    1. **LANGUAGE**: Answer strictly in **Korean (Hangul)**.
    2. **GROUNDING**: Answer SOLELY based on the provided [Context].
    3. **GUARDRAIL**: Reject non-automotive topics.

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

    [RESPONSE STRATEGY]
    - Act like a friendly, professional car dealer.
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

    // 3. Bedrock Converse API
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
