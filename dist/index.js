import { DependencyGraph } from "./core/dependency-graph.js";
const makeMeta = (name) => ({
    original: {},
    name,
    description: "",
    type: "schema",
});
const graph = new DependencyGraph();
const metaA = makeMeta("A");
const metaB = makeMeta("B");
graph.addNode(metaA);
graph.addNode(metaB);
graph.addDependency("A", "B");
console.log(graph.visualize());
