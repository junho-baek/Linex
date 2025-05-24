// tests/core.test.ts
import { wrapSchema } from "../core/wrappers";
import { describe, test, expect } from "vitest";
describe("LinexMeta Wrappers", () => {
    test("wrapSchema - 기본 객체", () => {
        const userSchema = {
            name: "string",
            age: "number",
        };
        const wrapped = wrapSchema(userSchema, {
            name: "UserSchema",
            description: "사용자 스키마",
        });
        expect(wrapped.type).toBe("schema");
        expect(wrapped.properties?.name.type).toBe("string");
    });
});
