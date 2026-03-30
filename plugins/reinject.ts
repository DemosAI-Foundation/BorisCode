import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync } from "fs"

export const ReinjectPlugin: Plugin = async ({ directory }) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const rules = readFileSync(`${directory}/AGENTS.md`, 'utf8');
      output.context.push(`
      ## CRITICAL RETAINED CONTEXT
      You MUST retain the following rules in your compressed memory:
      ${rules}
      `);
    }
  }
}