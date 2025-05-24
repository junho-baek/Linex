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
        for (const [from, deps] of this.edges.entries()) {
            result += `${from} -> [${Array.from(deps).join(", ")}]
`;
        }
        return result.trim();
    }
}
