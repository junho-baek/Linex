import { extractProperties } from "./metadata-extractor";
/** 스키마 래핑 함수 */
export function wrapSchema(schema, options) {
    return {
        original: schema,
        name: options?.name || schema.constructor.name,
        description: options?.description || "",
        type: "schema",
        properties: extractProperties(schema),
        examples: [],
        tags: options?.autoTag ? ["schema"] : [],
    };
}
