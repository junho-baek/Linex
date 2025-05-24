import { EventEmitter } from "events";
import { LinexMeta, RegisterOptions } from "./types";
import { DependencyGraph } from "./dependency-graph";
import { wrapObject } from "./wrappers";

export class LinexRegistry extends EventEmitter {
  private static instance: LinexRegistry;
  private metaObjects: Map<string, LinexMeta<any>>;
  private dependencyGraph: DependencyGraph;

  private constructor() {
    super();
    this.metaObjects = new Map();
    this.dependencyGraph = new DependencyGraph();
  }

  static getInstance(): LinexRegistry {
    if (!LinexRegistry.instance) {
      LinexRegistry.instance = new LinexRegistry();
    }
    return LinexRegistry.instance;
  }

  register<T>(object: T, options?: RegisterOptions): LinexMeta<T> {
    // 기존 Task 2의 래퍼 함수 활용
    const wrapper = this.getWrapper(object, options?.type);
    const meta = wrapper(object, options);

    if (this.metaObjects.has(meta.name)) {
      throw new Error(`Object '${meta.name}' is already registered`);
    }

    this.metaObjects.set(meta.name, meta);
    this.dependencyGraph.addNode(meta);

    // 이벤트 발생
    this.emit("registered", meta);
    return meta;
  }

  private getWrapper(object: any, type?: "schema" | "component" | "object") {
    // 실제 구현은 type에 따라 분기 가능
    return wrapObject;
  }

  unregister(name: string): boolean {
    if (!this.metaObjects.has(name)) return false;

    const meta = this.metaObjects.get(name)!;
    this.metaObjects.delete(name);
    this.dependencyGraph.removeNode(name);

    this.emit("unregistered", meta);
    return true;
  }
  get<T>(name: string): LinexMeta<T> | undefined {
    return this.metaObjects.get(name);
  }

  getAll(): LinexMeta<any>[] {
    return Array.from(this.metaObjects.values());
  }

  getDependencies(name: string): LinexMeta<any>[] {
    return this.dependencyGraph.getDependencies(name);
  }

  getDependents(name: string): LinexMeta<any>[] {
    return this.dependencyGraph.getDependents(name);
  }
  exportMetadata(): string {
    return JSON.stringify({
      metas: Array.from(this.metaObjects.entries()),
      graph: this.dependencyGraph.toJSON(),
    });
  }

  importMetadata(json: string): void {
    const data = JSON.parse(json);

    // 메타 객체 복원
    data.metas.forEach(([name, meta]: [string, LinexMeta<any>]) => {
      this.metaObjects.set(name, meta);
    });

    // 의존성 그래프 복원
    this.dependencyGraph = DependencyGraph.fromJSON(data.graph);
  }
}
