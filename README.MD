## *Boris in your terminal!*

BorisCode automatically learns from mistakes, plans, critiques, reviews code, reviews security etc.

**Based on Boris Cherny's personal CladeCode setup, but translated for [OpenCode](https://github.com/anomalyco/opencode).**
Boris twitter threads and howborisusesclaudecode.com used as source. 
Tips implemented with lastest best practices for local LLM usage with OpenCode. 
Further automation over Boris's practices has been implemented!

**Includes also the DCP context plugin which is essential for local llm:* [OpenCode-DCP]https://github.com/Opencode-DCP/opencode-dynamic-context-pruning.**


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
When `@boris` finishes, it autonomously executes an appropriate tool call to hand its context window over without requiring you to manually switch between all the different agents.

---
*Built for the [OpenCode](https://opencode.ai) Ecosystem.*