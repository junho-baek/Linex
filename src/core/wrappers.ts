// src/core/wrappers.ts
import { LinexMeta, WrapOptions } from "./types";
import { extractProperties } from "./metadata-extractor";

/** 스키마 래핑 함수 */
export function wrapSchema<T>(schema: T, options?: WrapOptions): LinexMeta<T> {
  return {
    original: schema,
    name: options?.name || (schema as any).constructor.name,
    description: options?.description || "",
    type: "schema",
    properties: extractProperties(schema),
    examples: [],
    tags: options?.autoTag ? ["schema"] : [],
  };
}
