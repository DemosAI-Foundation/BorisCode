---
title: "OpenCode: The God-Tier Boris Workflow"
description: "Implementing all 45 of Boris Cherny's Claude Code tips natively in OpenCode using Agents, Plugins, Commands, and the SDK."
author: "OpenCode Orchestration Guide"
---

# OpenCode: The "God-Tier" Boris Workflow

To truly implement all 45 of Boris Cherny’s tips in OpenCode, we have to stop treating the AI as a chatbot and start treating it as a **programmable, event-driven orchestration engine**. 

Using OpenCode’s native primitives—**Plugins (Event Hooks), the JS SDK, Headless CLI (`run`), Subagents, and Commands**—we can automate almost every single manual workflow Boris described.

---

## Part 1: The Autonomous Brain (Memory, Planning, & Agents)
*Covers Tips: 3, 4, 6, 15, 19, 32, 45*

Boris relies heavily on `CLAUDE.md` and manual memory management. Let's make memory, planning, and code review 100% autonomous.

### 1. Auto-Dream & Auto-Memory Plugin (`.opencode/plugins/auto-dream.ts`)
*(Tips 4, 15, 45)*
Instead of manually updating `AGENTS.md`, this plugin listens for when a session ends or compacts, and uses the SDK to spawn a background agent that silently extracts learnings into your project's memory.

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const AutoDreamPlugin: Plugin = async ({ client, $ }) => {
  return {
    "session.deleted": async (event) => { // Triggered when you close/delete a session
      // Headless auto-memory extraction
      await client.app.log({ 
        body: { service: "auto-dream", level: "info", message: "Extracting session memory..." } 
      });
      
      // Spawns a background OpenCode process to update AGENTS.md automatically
      await $`opencode run --agent explore "Review session ${event.sessionID}. Extract 1 new engineering rule we learned. Append it to AGENTS.md silently." &`
    }
  }
}
```

### 2. The Architect Auto-Handoff Agent (`.opencode/agents/architect.md`)
*(Tips 3, 6, 19)*
Don't just plan manually. Force the agent to plan, and upon your approval, autonomously hand the work off to the `build` agent.

```yaml
---
description: Plans complex tasks, then automatically triggers the build agent
mode: primary
permission:
  edit: deny # Cannot write code
  task:
    build: allow # Can spawn the build agent
---
1. Write a detailed implementation plan.
2. Ask me if it looks good.
3. Once I say "yes", you MUST immediately use your `task` tool to invoke the `build` agent, passing it the exact plan so it can implement it autonomously.
```

### 3. The CI/CD Code Reviewer
*(Tip 32)*
Use the OpenCode GitHub Action. You don't even need to ask it to review. It just does it when a PR opens.

```yaml
# .github/workflows/opencode-review.yml
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anomalyco/opencode/github@latest
        with:
          model: anthropic/claude-3-5-sonnet-20241022
          agent: explore # Read-only, safe
          prompt: "Hunt for logic errors, security issues, and performance regressions. Comment inline."
```

---

## Part 2: The Parallel Task Engine (Commands & CLI)
*Covers Tips: 1, 5, 13, 28, 29, 30, 31, 33, 43*

Boris uses multiple terminal tabs. We can use OpenCode's **Commands** with inline `bash (!)` evaluation to automate worktrees, batch jobs, and background loops.

### 1. The `/batch` Worktree Spawner (`.opencode/commands/batch.md`)
*(Tips 1, 28, 30)*

```markdown
---
description: Fans out a migration task to parallel git worktrees
---
I want to execute a batch migration: "$ARGUMENTS"

Do the following using your `bash` tool:
1. Identify the files to migrate.
2. Create 3 new `git worktree` directories (e.g., `../worktree-1`).
3. In each worktree, spawn a headless agent in the background:
   `cd ../worktree-1 && opencode run --agent build "Migrate these files, test, and commit" &`
```

### 2. The `/loop` / `/schedule` Daemon (`.opencode/commands/loop.md`)
*(Tips 13, 31, 43)*
If you close your laptop, local loops die. We can fix this by writing a command that utilizes `nohup` (or by using the ecosystem plugin `opencode-scheduler`).

```markdown
---
description: Spawns a background worker to run a task on an interval
---
Write and execute a bash script using `nohup` that runs the following OpenCode task every $1 seconds in the background:
`opencode run --agent build "$2"`
Ensure it survives when I close this terminal.
```

### 3. The `/btw` & `/simplify` Commands (`.opencode/commands/btw.md`)
*(Tips 5, 29, 33)*

```markdown
---
description: Ask a question without breaking context (uses subtask)
agent: explore
subtask: true
---
Answer this without modifying any files: $ARGUMENTS
```

---

## Part 3: The Self-Healing Terminal (Plugins & Verification)
*Covers Tips: 7, 10, 12, 14, 24, 37, 41*

Boris’s #1 tip is "Verification". Instead of asking the agent to verify, we can use the SDK to **force** verification upon file edits.

### 1. The Self-Healing / Auto-Format Plugin (`.opencode/plugins/self-healing.ts`)
*(Tips 7, 10, 14, 24, 37, 41)*

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const SelfHealingPlugin: Plugin = async ({ client, $, directory }) => {
  return {
    // Tip 7 & 41: PostToolUse Hook for Auto-formatting
    "tool.execute.after": async (input, output) => {
      if (input.tool === "edit" || input.tool === "write") {
        try {
          // Tip 14: Verification. Auto-run tests on edit!
          await $`bun run format && bun test`
        } catch (e) {
          // Tip 24 & 10: If tests fail, automatically inject the error back into the LLM context!
          await client.session.prompt({
            path: { id: input.sessionID },
            body: {
              parts: [{ type: "text", text: `Your last edit broke the tests. Fix it. Error: ${e.message}` }]
            }
          })
        }
      }
    },
    // Tip 37: Setup Scripts for Environments
    "session.created": async () => {
      await $`npm install` // Ensure env is always ready
    }
  }
}
```

### 2. The Bug Fixer / MCP Integrator (`.opencode/commands/fix-bug.md`)
*(Tips 9, 12)*

```markdown
---
description: Fixes a bug from a Slack thread using Sentry logs
---
1. Use the `slack` MCP tool to read the thread: $1
2. Use the `sentry` MCP tool to fetch the related error logs.
3. Fix the bug, write a test, and verify it passes.
```

---

## Part 4: Security & "Auto Mode"
*Covers Tips: 8, 20, 21, 42*

Anthropic uses proprietary classifiers for "Auto Mode". We replicate this safety autonomously using OpenCode's glob permissions and ecosystem sandboxing.

### 1. Glob-based Pre-approvals (`opencode.json`)
*(Tips 8, 20, 42)*

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": {
      "*": "ask",
      "git status*": "allow",
      "bun test*": "allow",
      "npm run build*": "allow"
    },
    "external_directory": {
      "~/projects/**": "allow" 
    }
  }
}
```

### 2. Sandboxing via Ecosystem Plugin
*(Tip 21)*
Instead of Anthropic's local sandbox, install the `opencode-daytona` plugin (from the OpenCode ecosystem). It automatically spins up an isolated Docker/Cloud sandbox for the session to run in, ensuring 100% safety.

---

## Part 5: Omni-Channel Accessibility (Web, Mobile, Integrations)
*Covers Tips: 9, 18, 35, 36, 44*

Boris talks about remote control, iMessage, and Voice. Here is how OpenCode does it natively:

### 1. Remote Control & Mobile App 
*(Tips 18, 35, 44)*
Instead of an iMessage plugin, use OpenCode's native Web UI and attach it to your network.

```bash
# Run this on your desktop
opencode web --hostname 0.0.0.0 --port 4096

# Now, open your iPhone browser, go to http://[YOUR-IP]:4096. 
# You now have full remote control over your desktop agent from your phone.
```
*(Alternative: Install the `kimaki` plugin from the ecosystem to control OpenCode via a Discord bot from your phone).*

### 2. Voice Mode & MCPs
*(Tips 9, 36)*
While OpenCode TUI lacks a native mic button, the **OpenCode IDE Extension** (VS Code/Cursor) integrates with the OS seamlessly. Alternatively, use standard OS dictation (`Fn` x2 on Mac) right into the OpenCode TUI composer.

---

## Part 6: UI, Effort, & UX Customization
*Covers Tips: 2, 11, 16, 17, 22, 23, 25, 26, 27, 34, 38, 39, 40*

We configure all of this in two files: `opencode.json` (Logic) and `tui.json` (Visuals).

### 1. TUI & Keybinds (`tui.json`)
*(Tips 11, 16, 23, 25, 27, 40)*

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "system", 
  "scroll_acceleration": { "enabled": true },
  "keybinds": {
    "leader": "ctrl+x",
    "variant_cycle": "ctrl+t"
  }
}
```
*(Tip 40 & 11: The "system" theme perfectly adapts to your terminal colors to provide a native aesthetic).*

### 2. Model Selection & Effort Max (`opencode.json`)
*(Tips 2, 17, 26, 34)*
We define model "Variants" to represent Effort levels dynamically.

```json
{
  "model": "anthropic/claude-3-5-sonnet-20241022",
  "provider": {
    "anthropic": {
      "models": {
        "claude-3-5-sonnet-20241022": {
          "variants": {
            "high": { "thinking": { "type": "enabled", "budgetTokens": 16000 } },
            "max": { "thinking": { "type": "enabled", "budgetTokens": 32000 } }
          }
        }
      }
    }
  }
}
```
*(Tip 34: Press `Ctrl+T` to cycle your effort to "max" using the variant keybind).*

### 3. Session Naming & Status Lines
*(Tips 22, 38, 39)*
OpenCode automatically uses its built-in background `title` agent to name sessions (Tip 39). If you want to name it manually at launch (Tip 38):

```bash
opencode --title "Database Migration"
```