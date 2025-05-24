import { EventEmitter } from "events";
import { DependencyGraph } from "./dependency-graph.js";
import { wrapSchema, wrapComponent, wrapObject } from "./wrappers.js";
import { RegisterOptions, LinexMeta } from "./types.js";
import { extractProperties } from "./metadata-extractor.js";
import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve(process.cwd(), ".linex-meta.json");

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
      LinexRegistry.instance.loadFromFile();
    }
    return LinexRegistry.instance;
  }

  register<T>(object: T, options?: RegisterOptions): LinexMeta<T> {
    // type이 없으면 자동 감지
    const type = options?.type || this.detectType(object, options);
    const wrapper = this.getWrapper(object, type);
    const meta = wrapper(object, options);

    if (this.metaObjects.has(meta.name)) {
      throw new Error(`Object '${meta.name}' is already registered`);
    }

    this.metaObjects.set(meta.name, meta);
    this.dependencyGraph.addNode(meta);

    // 이벤트 발생
    this.emit("registered", meta);
    this.saveToFile();
    return meta;
  }

  private getWrapper(
    object: any,
    type?: "schema" | "component" | "function" | "object",
  ) {
    if (type === "schema") return wrapSchema;
    if (type === "component") return wrapComponent;
    if (type === "function") return wrapObject;
    return wrapObject;
  }

  unregister(name: string): boolean {
    if (!this.metaObjects.has(name)) return false;

    const meta = this.metaObjects.get(name)!;
    this.metaObjects.delete(name);
    this.dependencyGraph.removeNode(name);

    this.emit("unregistered", meta);
    this.saveToFile();
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

  saveToFile(filePath = DATA_PATH) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          metas: Array.from(this.metaObjects.entries()),
          graph: this.dependencyGraph.toJSON(),
        },
        null,
        2,
      ),
    );
  }

  loadFromFile(filePath = DATA_PATH) {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    // metaObjects 복원
    this.metaObjects = new Map(data.metas);
    // dependencyGraph 복원
    this.dependencyGraph = DependencyGraph.fromJSON(data.graph);
  }

  private detectType(
    object: any,
    options?: { name?: string },
  ): "schema" | "component" | "function" | "object" {
    // 1. 함수
    if (typeof object === "function") return "function";

    // 2. 이름 기반 우선
    const name = options?.name || object?.name;
    if (typeof name === "string") {
      if (name.endsWith("Schema")) return "schema";
      if (name.endsWith("Component")) return "component";
      if (name.endsWith("Service")) return "object";
      if (name.endsWith("Controller")) return "object";
    }

    // 3. 프로퍼티 기반(보조)
    if (object && typeof object === "object") {
      if ("render" in object && "props" in object) return "component";
      if ("id" in object && "name" in object && "email" in object)
        return "schema";
      if ("id" in object && "name" in object && "price" in object)
        return "schema";
      return "object";
    }
    return "object";
  }
}
