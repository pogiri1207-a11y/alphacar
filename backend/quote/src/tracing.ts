import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const setupTracing = (serviceName: string) => {
  // 1. 모니터링 서버(Tempo)의 실제 위치를 지정합니다.
  // 환경변수가 없으면 192.168.0.175 (모니터링 서버 IP)로 보냅니다.
  const tempoEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://192.168.0.175:4317';

  const traceExporter = new OTLPTraceExporter({
    url: tempoEndpoint,
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter,
    instrumentations: [
      // NestJS, Express, HTTP 요청 등을 자동으로 수집하는 마법의 도구
      getNodeAutoInstrumentations(),
    ],
  });

  try {
    sdk.start();
    console.log(`\n---------------------------------------------------`);
    console.log(`[OpenTelemetry] '${serviceName}' Tracing Started! 🚀`);
    console.log(`[OpenTelemetry] Sending traces to: ${tempoEndpoint}`);
    console.log(`---------------------------------------------------\n`);
  } catch (error) {
    console.error('[OpenTelemetry] Failed to start:', error);
  }

  // 프로세스 종료 시 우아하게 종료
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};
