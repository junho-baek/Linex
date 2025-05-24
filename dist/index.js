import { LinexRegistry } from "./core/linex-registry.js";
const registry = LinexRegistry.getInstance();
export function register(object, options) {
    return registry.register(object, options);
}
export function get(name) {
    return registry.get(name);
}
export function getAll() {
    return registry.getAll();
}
