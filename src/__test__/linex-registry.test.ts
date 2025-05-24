import { LinexRegistry } from "../core/linex-registry";
import { register } from "../index";
import { describe, test, expect, beforeEach } from "vitest";
import { DependencyGraph } from "../core/dependency-graph";
import { vi } from "vitest";

describe("LinexRegistry", () => {
  let registry: LinexRegistry;

  beforeEach(() => {
    registry = LinexRegistry.getInstance();
    // 싱글턴 상태 초기화
    (registry as any).metaObjects.clear();
    (registry as any).dependencyGraph = new DependencyGraph();
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
