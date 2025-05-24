// src/core/wrappers.ts
import { LinexMeta, WrapOptions } from "./types";
import { extractProperties } from "./metadata-extractor.js";

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
export function wrapObject<T>(object: T, options?: any): LinexMeta<T> {
  return {
    original: object,
    name: options?.name || (object as any).constructor?.name || "Object",
    description: options?.description || "",
    type: "object",
    properties: extractProperties(object),
    examples: [],
    tags: options?.autoTag ? ["object"] : [],
  };
}
export function wrapComponent<T>(component: T, options?: any): LinexMeta<T> {
  return {
    original: component,
    name: options?.name || (component as any).constructor?.name || "Component",
    description: options?.description || "",
    type: "component",
    properties: extractProperties(component),
    examples: [],
    tags: options?.autoTag ? ["component"] : [],
  };
}
