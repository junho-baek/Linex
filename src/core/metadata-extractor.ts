// src/core/metadata-extractor.ts
import "reflect-metadata";

// PropertyMeta 타입 정의
export type PropertyMeta = {
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
};

/**
 * 객체에서 속성 메타데이터 추출
 * @param target - 대상 객체
 * @returns PropertyMeta 레코드
 */
export function extractProperties(target: any): Record<string, PropertyMeta> {
  const properties: Record<string, PropertyMeta> = {};

  // 리플렉션을 이용한 타입 정보 추출
  const designType = Reflect.getMetadata("design:type", target);
  // 실제 구현은 타입 분석 라이브러리와 통합 필요
  // 예시 구현:
  for (const [key, value] of Object.entries(target)) {
    properties[key] = {
      type: typeof value,
      description: "",
      required: true,
      defaultValue: undefined,
    };
  }
  return properties;
}
