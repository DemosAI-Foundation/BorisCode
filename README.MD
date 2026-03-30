# BorisCode for OpenCode

*Boris in your pocket!*

**Workflow and setup based on Boris Cherny's CladeCode setup but made for [OpenCode](https://opencode.ai).**

BorisCode automates and extends OpenCodes functionality. 

Automatically learns from mistakes, plans, critiques, reviews code, reviews security etc. 

Based on Boris twitter threads and howborisusesclaudecode.com wherefrom ideas and practices has been HAND PICKED and implemented with lastest best practices for local LLM usage with OpenCode. Further automation over Borises practices has been implemented since it is possible in OpenCode.

### Includes also the DCP plugin which is essential for local llm: https://github.com/Opencode-DCP/opencode-dynamic-context-pruning


---

## ToDo:

-Delegate planning to free powerful model
-Automatic git commits

---

## Custom Commands

BorisCode includes custom slash commands:

*   **`/simplify`**: Looks at your uncommitted `git diff`, summons the code-reviewer, and refactors your code to reduce duplicate logic.
*   **`/challenge`**: Summons the stadd-engineer to look at your current branch vs `main` and aggressively grill you on your changes. 
*   **`/loop`**: schedule recurring jobs (babysit PRs, summarize Slack) locally.
*   **`ctrl+b`**: Mid-task side-chain questions without breaking flow.
*   **`/teach`**: command that utilizes the webfetch tool and ascii diagramming.

---

## How it Works (Under the Hood)

BorisCode leverages OpenCode's **Auto-Discovery** and the **`task` tool**. 
By setting `"task": "allow"` in the `opencode.jsonc` permissions, agents are granted the ability to seamlessly swap contexts. When `@boris` finishes planning, it autonomously executes a tool call to hand its context window over to `@build` or `@staff-engineer` without requiring you to manually switch agents.

---
*Built for the [OpenCode](https://opencode.ai) Ecosystem.*