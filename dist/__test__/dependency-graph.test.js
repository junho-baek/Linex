import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../core/dependency-graph";
const makeMeta = (name) => ({
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
        expect(vis).toContain("A -> [B]");
    });
});
