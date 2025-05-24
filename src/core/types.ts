// src/core/types.ts
/**
 * LinexMeta 메인 인터페이스 (LLM 친화적 메타데이터 구조)
 * @template T - 원본 객체 타입
 */
export interface LinexMeta<T> {
  /** 원본 객체 (스키마/컴포넌트/객체) */
  original: T;
  /** 이름 (식별자) */
  name: string;
  /** 설명 (LLM용 간결한 설명) */
  description: string;
  /** 타입 구분 */
  type: "schema" | "component" | "object";
  /** 속성 메타데이터 */
  properties?: Record<string, PropertyMeta>;
  /** 메서드 메타데이터 */
  methods?: Record<string, MethodMeta>;
  /** 사용 예시 배열 */
  examples?: any[];
  /** 상세 문서 (Markdown 지원) */
  documentation?: string;
  /** 검색용 태그 */
  tags?: string[];
}

/** 속성 메타데이터 */
export interface PropertyMeta {
  /** 타입 문자열 (예: 'string', 'number[]') */
  type: string;
  /** 설명 */
  description: string;
  /** 필수 여부 */
  required: boolean;
  /** 기본값 (선택 사항) */
  defaultValue?: any;
}

/** 메서드 메타데이터 */
export interface MethodMeta {
  /** 메서드 설명 */
  description: string;
  /** 파라미터 정보 */
  parameters: Record<string, ParameterMeta>;
  /** 반환 타입 */
  returnType: string;
  /** 반환값 설명 */
  returnDescription: string;
}

/** 파라미터 메타데이터 */
export interface ParameterMeta {
  /** 타입 문자열 */
  type: string;
  /** 설명 */
  description: string;
  /** 필수 여부 */
  required: boolean;
  /** 기본값 (선택 사항) */
  defaultValue?: any;
}

/** 래퍼 함수 옵션 */
export interface WrapOptions {
  /** 커스텀 이름 (기본값: 원본 객체 이름) */
  name?: string;
  /** 추가 설명 */
  description?: string;
  /** 자동 태그 생성 여부 */
  autoTag?: boolean;
}
