import { LinexRegistry } from "./core/linex-registry.js";
import { RegisterOptions } from "./core/types";

const registry = LinexRegistry.getInstance();

export function register<T>(object: T, options?: RegisterOptions) {
  return registry.register(object, options);
}

export function get<T>(name: string) {
  return registry.get<T>(name);
}

export function getAll() {
  return registry.getAll();
}
