#!/usr/bin/env node
import { program } from "commander";
import { registerCommands } from "../cli/commands.js";

program
  .version("0.1.0")
  .description("Linex - LLM-friendly metadata and dependency management");

registerCommands(program);

program.parse(process.argv);
