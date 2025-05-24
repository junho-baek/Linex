import { LinexMeta } from "./types";

export class DependencyGraph {
  private nodes: Map<string, LinexMeta<any>> = new Map();
  private edges: Map<string, Set<string>> = new Map();

  constructor() {}

  addNode(meta: LinexMeta<any>): void {
    this.nodes.set(meta.name, meta);
    if (!this.edges.has(meta.name)) {
      this.edges.set(meta.name, new Set());
    }
  }

  removeNode(name: string): void {
    this.nodes.delete(name);
    this.edges.delete(name);
    for (const deps of this.edges.values()) {
      deps.delete(name);
    }
  }

  addDependency(from: string, to: string): void {
    if (!this.edges.has(from)) this.edges.set(from, new Set());
    this.edges.get(from)!.add(to);

    // 사이클 체크
    if (this.hasCycle()) {
      this.edges.get(from)!.delete(to); // 롤백
      throw new Error(`Adding dependency ${from} -> ${to} creates a cycle!`);
    }
  }

  removeDependency(from: string, to: string): void {
    this.edges.get(from)?.delete(to);
  }

  getDependencies(name: string): LinexMeta<any>[] {
    const deps = this.edges.get(name);
    if (!deps) return [];
    return Array.from(deps)
      .map((depName) => this.nodes.get(depName))
      .filter(Boolean) as LinexMeta<any>[];
  }

  getDependents(name: string): LinexMeta<any>[] {
    const result: LinexMeta<any>[] = [];
    for (const [node, deps] of this.edges.entries()) {
      if (deps.has(name)) {
        const meta = this.nodes.get(node);
        if (meta) result.push(meta);
      }
    }
    return result;
  }

  getAll(): LinexMeta<any>[] {
    return Array.from(this.nodes.values());
  }

  visualize(): string {
    let result = "";
    for (const [from, deps] of this.edges.entries()) {
      if (deps.size === 0) {
        result += `[${from}] (no dependencies)\n`;
      } else {
        for (const to of deps) {
          result += `[${from}] ──▶ [${to}]\n`;
        }
      }
    }
    return result.trim();
  }
  hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const visit = (node: string): boolean => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);

        for (const dep of this.edges.get(node) || []) {
          if (!visited.has(dep) && visit(dep)) return true;
          else if (recStack.has(dep)) return true;
        }
      }
      recStack.delete(node);
      return false;
    };

    for (const node of this.nodes.keys()) {
      if (visit(node)) return true;
    }
    return false;
  }
  toJSON() {
    return {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()).map(([k, v]) => [
        k,
        Array.from(v),
      ]),
    };
  }
  static fromJSON(json: any): DependencyGraph {
    const graph = new DependencyGraph();
    for (const [name, meta] of json.nodes) {
      graph.nodes.set(name, meta);
    }
    for (const [from, toArr] of json.edges) {
      graph.edges.set(from, new Set(toArr));
    }
    return graph;
  }
  //시각화 포맷 다양화: visualizeMermaid(), visualizeTree() 등 다양한 출력 지원 예정
}
