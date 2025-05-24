import { LinexRegistry } from "../core/linex-registry";
import { describe, test, expect, beforeEach } from "vitest";
import { DependencyGraph } from "../core/dependency-graph";
import { vi } from "vitest";
describe("LinexRegistry", () => {
    let registry;
    beforeEach(() => {
        registry = LinexRegistry.getInstance();
        // 싱글턴 상태 초기화
        registry.metaObjects.clear();
        registry.dependencyGraph = new DependencyGraph();
    });
    test("should register object", () => {
        const meta = registry.register({}, { name: "Test" });
        expect(registry.get("Test")).toBe(meta);
    });
    test("should emit event on registration", () => {
        const callback = vi.fn();
        registry.on("registered", callback);
        registry.register({}, { name: "Test" });
        expect(callback).toHaveBeenCalled();
    });
});
