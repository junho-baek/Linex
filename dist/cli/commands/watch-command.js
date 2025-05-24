import { FileWatcher } from "../../core/file-watcher.js";
import chalk from "chalk";
export class WatchCommand {
    constructor() {
        this.name = "watch";
        this.description = "Watch files for changes and update metadata";
    }
    configure(program) {
        program
            .command("watch")
            .description(this.description)
            .option("-p, --patterns <patterns>", "File patterns to watch", "**/*.{ts,tsx,js,jsx}")
            .option("-i, --ignore <ignore>", "Patterns to ignore", "node_modules,dist,build")
            .option("-v, --verbose", "Verbose output")
            .action(this.execute.bind(this));
    }
    async execute(options) {
        const patterns = options.patterns.split(",");
        const ignore = options.ignore.split(",");
        const verbose = !!options.verbose;
        const watcher = new FileWatcher({ patterns, ignore, verbose });
        watcher.watch(patterns);
        // graceful shutdown (Ctrl+C)
        process.on("SIGINT", () => {
            console.log(chalk.yellow("\nShutting down Linex watcher..."));
            watcher.stop();
            process.exit(0);
        });
        // keep process alive
        await new Promise(() => { });
    }
}
