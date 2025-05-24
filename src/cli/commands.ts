// src/cli/commands.ts
import { Command } from "commander";
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import { getAll, get, register } from "../index.js";
import { LinexRegistry } from "../core/linex-registry.js";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import Table from "cli-table3";
const require = createRequire(import.meta.url);

function printHeaderOnce() {
  if ((global as any).__linexHeaderPrinted) return;
  (global as any).__linexHeaderPrinted = true;
  const termWidth = process.stdout.columns || 80;
  const boxWidth = Math.floor(termWidth * 0.7);
  console.log(
    chalk.cyan(figlet.textSync("Linex", { horizontalLayout: "full" })),
  );
  console.log(
    boxen(chalk.bold("LLM-friendly metadata & dependency management CLI"), {
      padding: 1,
      borderColor: "cyan",
      borderStyle: "round",
      width: boxWidth,
    }),
  );
}

class ListCommand {
  name = "list";
  description = "List all registered objects, schemas, and components";

  configure(program: Command) {
    program
      .command(this.name)
      .description(this.description)
      .option("-t, --type <type>", "Filter by type (schema, component, object)")
      .option("-f, --format <format>", "Output format (table, json)", "table")
      .option("-s, --sort <field>", "Sort by field (name, type)", "name")
      .action(this.execute.bind(this));
  }

  async execute(options: any) {
    printHeaderOnce();
    let all = getAll();

    // 타입 필터링
    if (options.type) {
      all = all.filter((meta) => meta.type === options.type);
    }
    // 정렬
    if (options.sort === "name") {
      all.sort((a, b) => a.name.localeCompare(b.name));
    } else if (options.sort === "type") {
      all.sort((a, b) => a.type.localeCompare(b.type));
    }
    // 출력 포맷
    if (options.format === "json") {
      console.log(JSON.stringify(all, null, 2));
    } else {
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

export function registerCommands(program: Command) {
  new ListCommand().configure(program);

  program
    .command("show <name>")
    .description("Show details of a registered object")
    .action((name) => {
      printHeaderOnce();
      console.log(
        boxen(
          chalk.yellow(`linex show ${name}`) +
            "\n\n" +
            chalk.gray(
              "Show detailed metadata and properties for a registered object.",
            ),
          { borderColor: "yellow", padding: 1 },
        ),
      );
      const meta = get(name);
      if (!meta) {
        console.log(chalk.red(`No object found with name "${name}"`));
        return;
      }
      console.log(
        boxen(
          `${chalk.bold(meta.name)}\n${chalk.gray(meta.description || "")}\n${chalk.green(
            "Type:",
          )} ${meta.type}`,
          { borderColor: "green", padding: 1 },
        ),
      );
      if (meta.properties) {
        console.log(chalk.blue("Properties:"));
        for (const [key, prop] of Object.entries(meta.properties)) {
          console.log(
            boxen(
              `${chalk.bold(key)}: ${chalk.magenta(prop.type)}\n${chalk.gray(
                prop.description,
              )}`,
              { borderColor: "blue", padding: 0.5 },
            ),
          );
        }
      }
    });

  program
    .command("deps")
    .description("Show dependency graph")
    .action(() => {
      printHeaderOnce();
      console.log(
        boxen(
          chalk.yellow("linex deps") +
            "\n\n" +
            chalk.gray(
              "Visualize the dependency graph of all registered objects.",
            ),
          { borderColor: "yellow", padding: 1 },
        ),
      );
      const registry = LinexRegistry.getInstance();
      const graphStr = registry["dependencyGraph"].visualize();
      console.log(
        boxen(chalk.magenta(graphStr), { borderColor: "magenta", padding: 1 }),
      );
    });

  program
    .command("demo-register")
    .description("Register a demo object")
    .action(() => {
      printHeaderOnce();
      console.log(
        boxen(
          chalk.yellow("linex demo-register") +
            "\n\n" +
            chalk.gray("Register a demo object for testing."),
          { borderColor: "yellow", padding: 1 },
        ),
      );
      register({ foo: "bar" }, { name: "Demo", description: "Demo object" });
      console.log(
        boxen(chalk.green("Demo object registered!"), {
          borderColor: "green",
          padding: 1,
        }),
      );
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
      register(
        new demo.Order(
          "order_001",
          "user_001",
          [{ productId: "prod_001", qty: 2 }],
          "pending",
        ),
        { name: "OrderClass", description: "주문 클래스" },
      );
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
      registry["dependencyGraph"].addDependency(
        "NotificationService",
        "UserSchema",
      );
      registry.saveToFile();

      // 3. 디버깅 로그 (필요시)
      console.log(
        "edges",
        Array.from(registry["dependencyGraph"]["edges"].entries()),
      );
      console.log(
        "nodes",
        Array.from(registry["dependencyGraph"]["nodes"].keys()),
      );

      // 4. 안내 메시지
      console.log(
        boxen(
          chalk.green("Complex demo objects registered! Try:") +
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
            chalk.yellow("linex show NotificationService"),
          { borderColor: "green", padding: 1 },
        ),
      );
    });

  program.on("--help", () => {
    printHeaderOnce();
    console.log(
      boxen(
        chalk.cyan("Linex CLI Usage Examples:") +
          "\n\n" +
          chalk.yellow("linex demo-register") +
          "\n  Register a demo object\n" +
          chalk.yellow("linex list") +
          "\n  List all registered objects\n" +
          chalk.yellow("linex show Demo") +
          "\n  Show details for 'Demo'\n" +
          chalk.yellow("linex deps") +
          "\n  Show dependency graph\n",
        { borderColor: "cyan", padding: 1 },
      ),
    );
  });
}
