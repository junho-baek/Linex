import { extractProperties } from "./metadata-extractor.js";
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
export function wrapObject(object, options) {
    return {
        original: object,
        name: options?.name || object.constructor?.name || "Object",
        description: options?.description || "",
        type: "object",
        properties: extractProperties(object),
        examples: [],
        tags: options?.autoTag ? ["object"] : [],
    };
}
export function wrapComponent(component, options) {
    return {
        original: component,
        name: options?.name || component.constructor?.name || "Component",
        description: options?.description || "",
        type: "component",
        properties: extractProperties(component),
        examples: [],
        tags: options?.autoTag ? ["component"] : [],
    };
}
