export class DependencyGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
    }
    addNode(meta) {
        this.nodes.set(meta.name, meta);
        if (!this.edges.has(meta.name)) {
            this.edges.set(meta.name, new Set());
        }
    }
    removeNode(name) {
        this.nodes.delete(name);
        this.edges.delete(name);
        for (const deps of this.edges.values()) {
            deps.delete(name);
        }
    }
    addDependency(from, to) {
        if (!this.edges.has(from))
            this.edges.set(from, new Set());
        this.edges.get(from).add(to);
        // 사이클 체크
        if (this.hasCycle()) {
            this.edges.get(from).delete(to); // 롤백
            throw new Error(`Adding dependency ${from} -> ${to} creates a cycle!`);
        }
    }
    removeDependency(from, to) {
        this.edges.get(from)?.delete(to);
    }
    getDependencies(name) {
        const deps = this.edges.get(name);
        if (!deps)
            return [];
        return Array.from(deps)
            .map((depName) => this.nodes.get(depName))
            .filter(Boolean);
    }
    getDependents(name) {
        const result = [];
        for (const [node, deps] of this.edges.entries()) {
            if (deps.has(name)) {
                const meta = this.nodes.get(node);
                if (meta)
                    result.push(meta);
            }
        }
        return result;
    }
    getAll() {
        return Array.from(this.nodes.values());
    }
    visualize() {
        let result = "";
        for (const name of this.nodes.keys()) {
            const deps = this.edges.get(name);
            if (!deps || deps.size === 0) {
                result += `[${name}] (no dependencies)\n`;
            }
            else {
                for (const to of deps) {
                    result += `[${name}] ──▶ [${to}]\n`;
                }
            }
        }
        return result.trim();
    }
    hasCycle() {
        const visited = new Set();
        const recStack = new Set();
        const visit = (node) => {
            if (!visited.has(node)) {
                visited.add(node);
                recStack.add(node);
                for (const dep of this.edges.get(node) || []) {
                    if (!visited.has(dep) && visit(dep))
                        return true;
                    else if (recStack.has(dep))
                        return true;
                }
            }
            recStack.delete(node);
            return false;
        };
        for (const node of this.nodes.keys()) {
            if (visit(node))
                return true;
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
    static fromJSON(json) {
        const graph = new DependencyGraph();
        for (const [name, meta] of json.nodes) {
            graph.nodes.set(name, meta);
        }
        for (const [from, toArr] of json.edges) {
            graph.edges.set(from, new Set(toArr));
        }
        return graph;
    }
}
