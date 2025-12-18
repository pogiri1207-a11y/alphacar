// main/src/tracing.ts (수정된 버전)

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// 서비스 이름을 매개변수로 받도록 함수화
export function setupTracing(serviceName: string) {
  // 1. 트레이스 엔드포인트 설정: 
  //    OTEL_EXPORTER_OTLP_ENDPOINT 환경 변수 (http://alloy-agent:4317)를 우선 사용하고,
  //    환경 변수가 없을 경우 quote_backend와 동일하게 모니터링 서버 IP로 대체합니다.
  const tempoEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://192.168.0.175:4317';

  const traceExporter = new OTLPTraceExporter({
    url: tempoEndpoint, // 수정된 엔드포인트를 사용
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    // SDK 시작 및 상세 로그 출력 (quote_backend와 동일하게 디버깅 용이하도록 수정)
    sdk.start();
    console.log(`\n---------------------------------------------------`);
    console.log(`[OpenTelemetry] '${serviceName}' Tracing Started! 🚀`);
    console.log(`[OpenTelemetry] Sending traces to: ${tempoEndpoint}`);
    console.log(`---------------------------------------------------\n`);
  } catch (error) {
    console.error('[OpenTelemetry] Failed to start:', error); // 오류 처리 추가
  }

  // 프로세스 종료 시 처리
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
}
