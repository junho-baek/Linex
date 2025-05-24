// src/core/file-watcher.ts
import chokidar from "chokidar";
import { LinexRegistry } from "./linex-registry.js";
import debounce from "lodash.debounce";
export class FileWatcher {
    constructor(options = {}) {
        this.options = options;
        this.registry = LinexRegistry.getInstance();
        this.debouncedUpdate = debounce(this.updateMetadata.bind(this), 300);
    }
    watch(patterns) {
        this.watcher = chokidar.watch(patterns, {
            ignored: this.options.ignore || /node_modules|dist|build/,
            persistent: true,
            ignoreInitial: false,
        });
        this.watcher
            .on("add", this.handleFileAdd.bind(this))
            .on("change", this.handleFileChange.bind(this))
            .on("unlink", this.handleFileUnlink.bind(this));
        if (this.options.verbose) {
            this.watcher.on("all", (event, path) => console.log(`[watch] ${event}: ${path}`));
        }
        console.log("🔎 Linex is watching for file changes...");
    }
    stop() {
        this.watcher?.close();
        console.log("👋 Stopped watching files.");
    }
    handleFileAdd(path) {
        if (this.options.verbose)
            console.log(`File added: ${path}`);
        this.debouncedUpdate(path);
    }
    handleFileChange(path) {
        if (this.options.verbose)
            console.log(`File changed: ${path}`);
        this.debouncedUpdate(path);
    }
    handleFileUnlink(path) {
        if (this.options.verbose)
            console.log(`File removed: ${path}`);
        // 필요하다면 registry에서 해당 객체 제거
        // this.registry.unregister(이 파일에 해당하는 객체 이름);
    }
    updateMetadata(path) {
        // 파일에서 객체/스키마/컴포넌트 추출 & registry에 반영
        // 예시: this.registry.register(파싱된객체, { name: ..., ... });
        if (this.options.verbose)
            console.log(`Updating metadata for: ${path}`);
        // 실제 구현은 프로젝트 구조에 따라 커스텀
    }
}
