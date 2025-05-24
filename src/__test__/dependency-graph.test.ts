import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../core/dependency-graph";
import { LinexMeta } from "../core/types";

const makeMeta = (name: string): LinexMeta<any> => ({
  original: {},
  name,
  description: "",
  type: "schema",
});

describe("DependencyGraph", () => {
  it("노드 추가/조회", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    graph.addNode(metaA);
    expect(graph.getAll()).toHaveLength(1);
    expect(graph.getAll()[0].name).toBe("A");
  });

  it("노드 삭제", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    graph.addNode(metaA);
    graph.removeNode("A");
    expect(graph.getAll()).toHaveLength(0);
  });

  it("의존성 추가/조회", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    const deps = graph.getDependencies("A");
    expect(deps).toHaveLength(1);
    expect(deps[0].name).toBe("B");
  });

  it("의존성 삭제", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    graph.removeDependency("A", "B");
    expect(graph.getDependencies("A")).toHaveLength(0);
  });

  it("역의존성(Dependents) 조회", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    const dependents = graph.getDependents("B");
    expect(dependents).toHaveLength(1);
    expect(dependents[0].name).toBe("A");
  });

  it("그래프 시각화", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    const vis = graph.visualize();
    expect(vis.replace(/\s/g, "")).toContain("[A]──▶[B]");
  });

  it("그래프 직렬화/역직렬화", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    const json = graph.toJSON();
    const restored = DependencyGraph.fromJSON(json);
    expect(
      restored
        .getAll()
        .map((m) => m.name)
        .sort(),
    ).toEqual(["A", "B"]);
    expect(restored.getDependencies("A")[0].name).toBe("B");
    expect(restored.visualize().replace(/\s/g, "")).toContain("[A]──▶[B]");
  });

  it("사이클 감지: 순환 의존성 추가 시 에러 발생", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addDependency("A", "B");
    expect(() => graph.addDependency("B", "A")).toThrow(/cycle/i);
  });

  it("사이클 감지: hasCycle() 직접 호출", () => {
    const graph = new DependencyGraph();
    const metaA = makeMeta("A");
    const metaB = makeMeta("B");
    const metaC = makeMeta("C");
    graph.addNode(metaA);
    graph.addNode(metaB);
    graph.addNode(metaC);
    graph.addDependency("A", "B");
    graph.addDependency("B", "C");
    // 아직 사이클 없음
    expect(graph.hasCycle()).toBe(false);
    // 사이클 생성 시도 → 예외 발생해야 함
    expect(() => graph.addDependency("C", "A")).toThrow(/cycle/i);
  });
});
