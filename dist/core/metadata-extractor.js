// src/core/metadata-extractor.ts
import "reflect-metadata";
/**
 * 객체에서 속성 메타데이터 추출
 * @param target - 대상 객체
 * @returns PropertyMeta 레코드
 */
export function extractProperties(target) {
    const properties = {};
    // 리플렉션을 이용한 타입 정보 추출
    const designType = Reflect.getMetadata("design:type", target);
    // 실제 구현은 타입 분석 라이브러리와 통합 필요
    // 예시 구현:
    for (const [key, value] of Object.entries(target)) {
        let typeStr = typeof value;
        if (Array.isArray(value))
            typeStr = "array";
        else if (value === null)
            typeStr = "null";
        else if (typeStr === "object")
            typeStr = value?.constructor?.name?.toLowerCase() || "object";
        else if (typeStr === "function")
            typeStr = "function";
        properties[key] = {
            type: typeStr,
            description: "", // JSDoc 파싱 등은 추후 확장 가능
            required: value !== undefined,
            defaultValue: value,
        };
    }
    return properties;
}
