import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import { getAll, get, register } from "../index.js";
import { LinexRegistry } from "../core/linex-registry.js";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import Table from "cli-table3";
import { WatchCommand } from "./commands/watch-command.js";
const require = createRequire(import.meta.url);
function printHeaderOnce() {
    if (global.__linexHeaderPrinted)
        return;
    global.__linexHeaderPrinted = true;
    const termWidth = process.stdout.columns || 80;
    const boxWidth = Math.floor(termWidth * 0.7);
    console.log(chalk.cyan(figlet.textSync("Linex", { horizontalLayout: "full" })));
    console.log(boxen(chalk.bold("LLM-friendly metadata & dependency management CLI"), {
        padding: 1,
        borderColor: "cyan",
        borderStyle: "round",
        width: boxWidth,
    }));
}
class ListCommand {
    constructor() {
        this.name = "list";
        this.description = "List all registered objects, schemas, and components";
    }
    configure(program) {
        program
            .command(this.name)
            .description(this.description)
            .option("-t, --type <type>", "Filter by type (schema, component, object)")
            .option("-f, --format <format>", "Output format (table, json)", "table")
            .option("-s, --sort <field>", "Sort by field (name, type)", "name")
            .action(this.execute.bind(this));
    }
    async execute(options) {
        printHeaderOnce();
        let all = getAll();
        // 타입 필터링
        if (options.type) {
            all = all.filter((meta) => meta.type === options.type);
        }
        // 정렬
        if (options.sort === "name") {
            all.sort((a, b) => a.name.localeCompare(b.name));
        }
        else if (options.sort === "type") {
            all.sort((a, b) => a.type.localeCompare(b.type));
        }
        // 출력 포맷
        if (options.format === "json") {
            console.log(JSON.stringify(all, null, 2));
        }
        else {
            if (all.length === 0) {
                console.log(chalk.redBright("No objects registered."));
                return;
            }
            const table = new Table({
                head: [
                    chalk.cyan("Name"),
                    chalk.green("Type"),
                    chalk.yellow("Description"),
                ],
                colWidths: [20, 15, 40],
                wordWrap: true,
            });
            for (const meta of all) {
                table.push([
                    chalk.bold(meta.name),
                    chalk.green(meta.type),
                    chalk.gray(meta.description || ""),
                ]);
            }
            console.log(table.toString());
        }
    }
}
class ShowCommand {
    constructor() {
        this.name = "show";
        this.description = "Show detailed information about a specific object";
    }
    configure(program) {
        program
            .command("show <name>")
            .description(this.description)
            .option("-f, --format <format>", "Output format (text, json)", "text")
            .option("-d, --dependencies", "Show dependencies")
            .option("-r, --dependents", "Show dependents")
            .action(this.execute.bind(this));
    }
    async execute(name, options) {
        printHeaderOnce();
        const meta = get(name);
        if (!meta) {
            console.log(chalk.red(`No object found with name "${name}"`));
            return;
        }
        // JSON 포맷 지원
        if (options.format === "json") {
            console.log(JSON.stringify(meta, null, 2));
            return;
        }
        // 기본 텍스트 포맷
        console.log(boxen(`${chalk.bold(meta.name)}\n${chalk.gray(meta.description || "")}\n${chalk.green("Type:")} ${meta.type}`, { borderColor: "green", padding: 1 }));
        // documentation
        if (meta.documentation) {
            console.log(chalk.yellow("Documentation:"));
            console.log(boxen(meta.documentation, { borderColor: "yellow", padding: 1 }));
        }
        // properties
        if (meta.properties) {
            console.log(chalk.blue("Properties:"));
            for (const [key, prop] of Object.entries(meta.properties)) {
                console.log(boxen(`${chalk.bold(key)}: ${chalk.magenta(prop.type)}\n${chalk.gray(prop.description)}`, { borderColor: "blue", padding: 0.5 }));
            }
        }
        // methods
        if (meta.methods) {
            console.log(chalk.magenta("Methods:"));
            for (const [key, method] of Object.entries(meta.methods)) {
                console.log(boxen(`${chalk.bold(key)}(${Object.keys(method.parameters).join(", ")}): ${chalk.cyan(method.returnType)}\n${chalk.gray(method.description)}`, { borderColor: "magenta", padding: 0.5 }));
            }
        }
        // examples
        if (meta.examples && meta.examples.length > 0) {
            console.log(chalk.cyan("Examples:"));
            for (const ex of meta.examples) {
                console.log(boxen(chalk.gray(typeof ex === "string" ? ex : JSON.stringify(ex, null, 2)), { borderColor: "cyan", padding: 0.5 }));
            }
        }
        // tags
        if (meta.tags && meta.tags.length > 0) {
            console.log(chalk.gray("Tags:"), meta.tags.map((t) => chalk.bgBlue(t)).join(" "));
        }
        // dependencies
        if (options.dependencies) {
            const registry = LinexRegistry.getInstance();
            const deps = registry.getDependencies(name);
            console.log(chalk.yellow("Dependencies:"), deps.map((d) => d.name).join(", ") || "None");
        }
        // dependents
        if (options.dependents) {
            const registry = LinexRegistry.getInstance();
            const deps = registry.getDependents(name);
            console.log(chalk.yellow("Dependents:"), deps.map((d) => d.name).join(", ") || "None");
        }
    }
}
class DepsCommand {
    constructor() {
        this.name = "deps";
        this.description = "Visualize dependency tree";
    }
    configure(program) {
        program
            .command("deps")
            .description(this.description)
            .option("-n, --name <name>", "Focus on specific object")
            .option("-d, --depth <depth>", "Maximum depth to display", "3")
            .option("-f, --format <format>", "Output format (tree, dot, json)", "tree")
            .action(this.execute.bind(this));
    }
    async execute(options) {
        printHeaderOnce();
        const registry = LinexRegistry.getInstance();
        // 1. 포커스 대상 결정
        let roots;
        if (options.name) {
            roots = [options.name];
        }
        else {
            // 의존성 없는 노드(루트) 찾기
            const all = registry.getAll();
            const dependents = new Set();
            for (const meta of all) {
                const deps = registry.getDependencies(meta.name);
                for (const dep of deps)
                    dependents.add(dep.name);
            }
            roots = all.map((m) => m.name).filter((n) => !dependents.has(n));
        }
        // 2. 깊이 제한 파싱
        const maxDepth = parseInt(options.depth, 10) || 3;
        // 3. 그래프 포맷별 출력
        if (options.format === "json") {
            const graph = registry["dependencyGraph"].toJSON();
            console.log(JSON.stringify(graph, null, 2));
        }
        else if (options.format === "dot") {
            console.log(this.visualizeDot(registry, roots, maxDepth));
        }
        else {
            // 기본: 트리(ASCII)
            for (const root of roots) {
                this.printTree(registry, root, maxDepth);
            }
        }
    }
    printTree(registry, node, maxDepth, depth = 0, prefix = "") {
        if (depth > maxDepth)
            return;
        console.log(prefix + (depth === 0 ? chalk.bold(node) : "├─ " + node));
        const deps = registry.getDependencies(node);
        for (const dep of deps) {
            this.printTree(registry, dep.name, maxDepth, depth + 1, prefix + "   ");
        }
    }
    visualizeDot(registry, roots, maxDepth) {
        let dot = "digraph G {\n";
        const visited = new Set();
        const walk = (node, depth) => {
            if (depth > maxDepth || visited.has(node))
                return;
            visited.add(node);
            const deps = registry.getDependencies(node);
            for (const dep of deps) {
                dot += `  "${node}" -> "${dep.name}";\n`;
                walk(dep.name, depth + 1);
            }
        };
        for (const root of roots)
            walk(root, 0);
        dot += "}";
        return dot;
    }
}
export function registerCommands(program) {
    new ListCommand().configure(program);
    new ShowCommand().configure(program);
    new DepsCommand().configure(program);
    new WatchCommand().configure(program);
    program
        .command("demo-register")
        .description("Register a demo object")
        .action(() => {
        printHeaderOnce();
        console.log(boxen(chalk.yellow("linex demo-register") +
            "\n\n" +
            chalk.gray("Register a demo object for testing."), { borderColor: "yellow", padding: 1 }));
        register({ foo: "bar" }, { name: "Demo", description: "Demo object" });
        console.log(boxen(chalk.green("Demo object registered!"), {
            borderColor: "green",
            padding: 1,
        }));
    });
    program
        .command("demo-complex")
        .description("Register a beautiful, complex demo set")
        .action(async () => {
        printHeaderOnce();
        const demoPath = path.resolve("dist/demo/complex-demo.js");
        const demo = await import(pathToFileURL(demoPath).href);
        // 1. 객체 등록 (register → addNode)
        register(demo.userSchema, {
            name: "UserSchema",
            description: "유저 데이터 스키마",
        });
        register(demo.productSchema, {
            name: "ProductSchema",
            description: "상품 데이터 스키마",
        });
        register(new demo.Order("order_001", "user_001", [{ productId: "prod_001", qty: 2 }], "pending"), { name: "OrderClass", description: "주문 클래스" });
        register(demo.processPayment, {
            name: "ProcessPayment",
            description: "결제 처리 함수",
        });
        register(demo.component, {
            name: "OrderSummaryComponent",
            description: "주문 요약 컴포넌트",
        });
        register(new demo.NotificationService("Notify"), {
            name: "NotificationService",
            description: "알림 서비스",
        });
        // 2. 의존성 추가 (addDependency)
        const registry = LinexRegistry.getInstance();
        registry["dependencyGraph"].addDependency("OrderClass", "UserSchema");
        registry["dependencyGraph"].addDependency("OrderClass", "ProductSchema");
        registry["dependencyGraph"].addDependency("ProcessPayment", "OrderClass");
        registry["dependencyGraph"].addDependency("NotificationService", "UserSchema");
        registry.saveToFile();
        // 4. 안내 메시지
        console.log(boxen(chalk.green("Complex demo objects registered! Try:") +
            "\n" +
            chalk.yellow("linex list") +
            "\n" +
            chalk.yellow("linex show UserSchema") +
            "\n" +
            chalk.yellow("linex show ProductSchema") +
            "\n" +
            chalk.yellow("linex show OrderClass") +
            "\n" +
            chalk.yellow("linex show ProcessPayment") +
            "\n" +
            chalk.yellow("linex show OrderSummaryComponent") +
            "\n" +
            chalk.yellow("linex show NotificationService"), { borderColor: "green", padding: 1 }));
    });
    program.on("--help", () => {
        printHeaderOnce();
        console.log(boxen(chalk.cyan("Linex CLI Usage Examples:") +
            "\n\n" +
            chalk.yellow("linex demo-register") +
            "\n  Register a demo object\n" +
            chalk.yellow("linex list") +
            "\n  List all registered objects\n" +
            chalk.yellow("linex show Demo") +
            "\n  Show details for 'Demo'\n" +
            chalk.yellow("linex deps") +
            "\n  Show dependency graph\n", { borderColor: "cyan", padding: 1 }));
    });
}
