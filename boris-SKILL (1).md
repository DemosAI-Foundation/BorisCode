

# Boris Cherny's Claude Code Workflow Tips



**Parts:** The tips were shared across 8 threads:
- **Part 1** (Jan 2, 2026, 13 tips): Sections 1–14 — parallel execution, web/mobile, Opus, CLAUDE.md, @.claude, plan mode, slash commands, subagents, hooks, permissions, MCP, long-running tasks, verification
- **Part 2** (Jan 31, 2026, 10 tips): Sections 1, 3, 4, 5, 12, 10, 11, 6, 9, 15 — deeper dives on parallel work, plan mode, CLAUDE.md, skills, bug fixing, prompting, terminal setup, subagents, data/analytics, learning
- **Part 3** (Feb 11, 2026, 12 tips): Sections 16–27 — terminal config, effort level, plugins, custom agents, permissions management, sandboxing, status line, keybindings, hooks (advanced), spinner verbs, output styles, customize everything
- **Part 4** (Feb 20, 2026, 5 tips): Section 28 — built-in worktree support (CLI, Desktop, subagents, custom agents, non-git VCS)
- **Part 5** (Feb 27, 2026, 2 tips): Sections 29–30 — /simplify and /batch
- **Part 6** (Mar 7–10, 2026, 3 tips): Sections 31–33 — /loop for scheduled recurring tasks, code review agents, /btw for mid-task questions
- **Part 7** (Mar 13, 2026, 8 tips): Sections 34–41 — /effort max, remote control sessions, voice mode, setup scripts, session naming, /color, PostCompact hook
- **Part 8** (Mar 23–26, 2026, 4 tips): Sections 42–45 — auto mode, /schedule cloud jobs, iMessage plugin, auto-memory & auto-dream

---

## 1. Parallel Execution

### Run Multiple Claude Sessions in Parallel
The single biggest productivity unlock. Spin up 3-5 git worktrees at once, each running its own Claude session.

```bash
# Create a worktree
git worktree add .claude/worktrees/my-worktree origin/main

# Start Claude in it
cd .claude/worktrees/my-worktree && claude
```

**Why worktrees over checkouts:** The Claude Code team prefers worktrees - it's why native support was built into the Claude Desktop app.

**Pro tips:**
- Name your worktrees and set up shell aliases (za, zb, zc) to hop between them in one keystroke
- Have a dedicated "analysis" worktree just for reading logs and running BigQuery
- Use iTerm2/terminal notifications to know when any Claude needs attention
- Color-code and name your terminal tabs, one per task/worktree

### Web and Mobile Sessions
Beyond the terminal, run additional sessions on claude.ai/code. Use:
- `&` command to background a session
- `--teleport` flag to switch contexts between local and web
- Claude iOS app to start sessions on the go, pick them up on desktop later

---



## 3. Plan Mode

### Start Every Complex Task in Plan Mode
Press `shift+tab` to cycle to plan mode. Pour your energy into the plan so Claude can 1-shot the implementation.

**Workflow:** Plan mode -> Refine plan -> Auto-accept edits -> Claude 1-shots it

**Team patterns:**
- One person has one Claude write the plan, then spins up a second Claude to review it as a staff engineer
- The moment something goes sideways, switch back to plan mode and re-plan
- Explicitly tell Claude to enter plan mode for verification steps, not just for the build

"A good plan is really important to avoid issues down the line."

---

## 4. CLAUDE.md Best Practices

### Invest in Your CLAUDE.md
Share a single CLAUDE.md file for your repo, checked into git. The whole team should contribute.

**Key practice:** "Anytime we see Claude do something incorrectly we add it to the CLAUDE.md, so Claude knows not to do it next time."

**After every correction:** End with "Update your CLAUDE.md so you don't make that mistake again." Claude is eerily good at writing rules for itself.

**Advanced:** One engineer tells Claude to maintain a notes directory for every task/project, updated after every PR. They then point CLAUDE.md at it.

### @.claude in Code Reviews
Tag @.claude on PRs to add learnings to the CLAUDE.md as part of the PR itself. Use the Claude Code GitHub Action (`/install-github-action`) for this.

Example PR comment:
```
nit: use a string literal, not ts enum

@claude add to CLAUDE.md to never use enums,
always prefer literal unions
```

This is "Compounding Engineering" - Claude automatically updates the CLAUDE.md with the learning.

---

## 5. Skills & Slash Commands

### Create Your Own Skills
Create skills and commit them to git. Reuse across every project.

**Team tips:**
- If you do something more than once a day, turn it into a skill or command
- Build a `/techdebt` slash command and run it at the end of every session to find and kill duplicated code
- Set up a slash command that syncs 7 days of Slack, GDrive, Asana, and GitHub into one context dump
- Build analytics-engineer-style agents that write dbt models, review code, and test changes in dev

### Slash Commands for Inner Loops
Use slash commands for workflows you do many times a day. Commands are checked into git under `.claude/commands/` and shared with the team.

```
> /commit-push-pr
```

**Power feature:** Slash commands can include inline Bash to pre-compute info (like git status) for quick execution without extra model calls.

---

## 6. Subagents

### Use Subagents for Common Workflows
Think of subagents as automations for the most common PR workflows:

```
.claude/
  agents/
    build-validator.md
    code-architect.md
    code-simplifier.md
    oncall-guide.md
    verify-app.md
```

**Examples:**
- `code-simplifier` - Cleans up code after Claude finishes
- `verify-app` - Detailed instructions for end-to-end testing

### Leveraging Subagents
- Have ClaudeCode or OpenCode fogute out what to Append to "use subagents" to any request where you want to throw more compute at the problem
- Offload individual tasks to subagents to keep your main agent's context window clean and focused
- Route permission requests to Opus 4.5 via a hook - let it scan for attacks and auto-approve the safe ones

---

## 7. Hooks

### PostToolUse Hooks for Formatting
Use a PostToolUse hook to auto-format Claude's code. While Claude generates well-formatted code 90% of the time, the hook catches edge cases to prevent CI failures. In opencode you can hand it over to subagent! 

```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      {
        "type": "command",
        "command": "bun run format || true"
      }
    ]
  }
]
```

### Stop Hooks for Long-Running Tasks
For very long-running tasks, use an agent Stop hook for deterministic checks, ensuring Claude can work uninterrupted. This is doom_loop on opencode!



---

## 9. MCP Integrations

### Tool Integrations
Claude Code uses your tools autonomously:
- Searches and posts to **Slack** (via MCP server)
- Runs **BigQuery** queries with bq CLI
- Grabs error logs from **Sentry**

```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://slack.mcp.anthropic.com/mcp"
    }
  }
}
```

### Data & Analytics
Ask Claude Code to use the "bq" CLI to pull and analyze metrics on the fly. Have a BigQuery skill checked into the codebase.

Boris's take: "Personally, I haven't written a line of SQL in 6+ months."

This works for any database that has a CLI, MCP, or API.

---

## 10. Prompting Tips

##Have opencode automate these with agent handover:

### Challenge Claude
- Say "Grill me on these changes and don't make a PR until I pass your test."
- Say "Prove to me this works" and have Claude diff behavior between main and your feature branch

### After a Mediocre Fix
Say: "Knowing everything you know now, scrap this and implement the elegant solution."

### Write Detailed Specs
Reduce ambiguity before handing work off. The more specific you are, the better the output.

**Key insight:** Don't accept the first solution. Push Claude to do better - it usually can. Have OpenCode generate OPTIONS EVERYTIME

---

## 11. Voice dictation


### Voice Dictation
Use voice dictation! You speak 3x faster than you type, and your prompts get way more detailed as a result. Hit `fn x2` on macOS.

---

## 12. Bug Fixing

### Let Claude Fix Bugs
Enable the Slack MCP, then paste a Slack bug thread into Claude and just say "fix." Zero context switching required.

Or just say "Go fix the failing CI tests." Don't micromanage how.

**Pro tip:** Point Claude at docker logs to troubleshoot distributed systems - it's surprisingly capable at this.

---

## 13. Long-Running Tasks

### Handle Long-Running Tasks
For very long-running tasks, ensure Claude can work uninterrupted:

**Options:**
- **(a)** Prompt Claude to verify with a background agent when done
- **(b)** Use an agent Stop hook for deterministic checks


---

## 14. Verification of RESULTS (The #1 Tip and most important)

### Give Claude a Way to Verify Its Work
"Probably the most important thing to get great results out of Claude Code - give Claude a way to verify its work. If Claude has that feedback loop, it will 2-3x the quality of the final result."

**Verification varies by domain:**
- Bash commands
- Test suites
- Simulators
- Browser testing (Claude Chrome extension)

The key is giving Claude a way to close the feedback loop. Invest in domain-specific verification for optimal performance.

---

## 15. Learning with Claude

### Use Claude for Learning
- Enable "Explanatory" or "Learning" output style in /config to have Claude explain the *why* behind changes
- Have Claude generate visual HTML presentations explaining unfamiliar code
- Ask Claude to draw ASCII diagrams of new protocols and codebases
- Build a spaced-repetition learning skill: explain your understanding, Claude asks follow-ups to fill gaps

**Key takeaway:** Claude Code isn't just for writing code - it's a powerful learning tool when you configure it to explain and teach.








---

## 20. Permissions Management

### Pre-Approve Common Permissions
Claude Code uses a sophisticated permission system with prompt injection detection, static analysis, sandboxing, and human oversight.

Out of the box, we pre-approve a small set of safe commands. To pre-approve more, run `/permissions` and add to the allow and block lists. Check these into your team's `settings.json`.

**Wildcard syntax:** We support full wildcard syntax. Try `"Bash(bun run *)"` or `"Edit(/docs/**)"`.



---

## 24. Hooks (Advanced)

These need probably to be hardcoded or can they be automated with clever agent use?

### Set Up Hooks
Hooks are a way to deterministically hook into Claude's lifecycle. Use them to:

- Automatically route permission requests to Slack or Opus
- Nudge Claude to keep going when it reaches the end of a turn (you can even kick off an agent or use a prompt to decide whether Claude should keep going)
- Pre-process or post-process tool calls, e.g. to add your own logging

Ask Claude to add a hook to get started.


---

## 28. Built-in Git Worktree Support

### Use `claude --worktree` for Isolation
Claude Code now has built-in git worktree support. Each agent gets its own worktree and can work independently, without interfering with other sessions.

```bash
# Start Claude in its own worktree
claude --worktree my_worktree

# Optionally launch in its own Tmux session too
claude --worktree my_worktree --tmux
```

**Desktop app:** Head to the Code tab in the Claude Desktop app and check the **worktree** checkbox.

### Subagents Support Worktrees
Subagents can also use worktree isolation to do more work in parallel. This is especially powerful for large batched changes and code migrations. Available in CLI, Desktop app, IDE extensions, web, and Claude Code mobile app.

**Example prompt:** "Migrate all sync io to async. Batch up the changes, and launch 10 parallel agents with worktree isolation. Make sure each agent tests its changes end to end, then have it put up a PR."

### Custom Agents with Worktree Isolation
Make subagents always run in their own worktree by adding `isolation: worktree` to your agent frontmatter:

```yaml
# .claude/agents/worktree-worker.md
---
name: worktree-worker
model: haiku
isolation: worktree
---
```

### Non-Git Source Control
Mercurial, Perforce, or SVN users can define `WorktreeCreate` and `WorktreeRemove` hooks in `settings.json` to benefit from isolation without Git.

---

## 29. /simplify — Improve Code Quality

Simplify code agent in OpenCode!

Use parallel agents to improve code quality, tune code efficiency, and ensure CLAUDE.md compliance. Append `/simplify` to any prompt after making changes.

```
> hey claude make this code change then run /simplify
```

Boris uses this daily to shepherd PRs to production. The skill runs parallel agents that review changed code for reuse, quality, and efficiency — all in one pass.



---

## 31. /loop — Schedule Recurring Tasks

Use `/loop` to schedule recurring tasks for up to 3 days at a time. Claude runs your prompt on an interval, handling long-running workflows autonomously.

```
> /loop babysit all my PRs. Auto-fix build issues and when comments come in, use a worktree agent to fix them
```

```
> /loop every morning use the Slack MCP to give me a summary of top posts I was tagged in
```

Use it for PR babysitting, Slack summaries, deploy monitoring, or any repeating workflow.

Learn more: https://code.claude.com/docs/en/scheduled-tasks

## 32. Code Review — Agents Hunt for Bugs

When a PR opens, Claude dispatches a team of agents to hunt for bugs. Anthropic built it for themselves first — code output per engineer is up 200% this year, and reviews were the bottleneck.

Each agent focuses on a different concern — logic errors, security issues, performance regressions — then posts inline comments directly on the PR. Boris personally used it for weeks before launch; it catches real bugs he wouldn't have noticed otherwise.

Source: https://x.com/bcherny/status/2031089411820228645

## 33. /btw — Ask Questions While Claude Works

A slash command for side-chain conversations while Claude is actively working. Single-turn, no tool calls, but has full context of the conversation.

```
> /btw what does the retry logic do?
```

Claude responds inline without stopping its work. Built by @ErikSchluntz as a side project — 1.5M views on the launch tweet.

Source: https://x.com/trq212/status/2031506296697131352


## 37. auto install dependencies to test projects

 

## 41. Reinject context with agent after Compact conversation

A new hook event that fires after Claude compresses its conversation context. Use it to re-inject critical instructions that might get lost during compaction, log when compaction happens, or trigger automation.

```json
"hooks": {
  "PostCompact": [{
    "matcher": "",
    "hooks": [{ "type": "command", "command": "echo 'Context was compacted'" }]
  }]
}
```

Source: https://x.com/trq212/status/2032632602629386348



## 43. /schedule — Cloud Jobs from Your Terminal

Use `/schedule` to create recurring cloud-based jobs for Claude, directly from the terminal. Unlike `/loop` (which runs locally for up to 3 days), scheduled jobs run in the cloud — they work even when your laptop is closed.

```
> /schedule a daily job that looks at all PRs shipped since yesterday
  and update our docs based on the changes. Use the Slack MCP to
  message #docs-update with the changes
```

The Anthropic team uses these internally to automatically resolve CI failures, push doc updates, and power automations that need to exist beyond a closed laptop.

Source: https://x.com/noahzweben/status/2036129220959805859

## 44. iMessage Plugin — Text Claude from Your Phone

iMessage is now available as a Claude Code channel. Install the plugin and text Claude like you'd text a friend — from any Apple device.

```bash
/plugin install imessage@claude-plugins-official
```

Claude Code becomes a contact in your Messages app. Send it tasks, get responses as iMessages. Works from your iPhone, iPad, or Mac — no terminal needed. Pairs well with remote control sessions for kicking off work from anywhere.

Source: https://x.com/trq212/status/2036959638646866021

## 45. Auto-Memory & Auto-Dream — Persistent, Self-Cleaning Memory

Claude Code has a built-in memory system. Run `/memory` to configure it.

**Auto-memory:** When enabled, Claude automatically saves preferences, corrections, and patterns between sessions. User memory goes to `~/.claude/CLAUDE.md`, project memory to `./CLAUDE.md`.

**Auto-dream:** As memory accumulates, it can get messy — outdated assumptions, overlapping notes, low-signal entries. Auto-dream runs a subagent that periodically reviews past sessions, keeps what matters, removes what doesn't, and merges insights into cleaner structured memory. Run `/dream` to trigger manually, or enable auto-dream in `/memory` settings.

The naming maps to how REM sleep consolidates short-term memory into long-term storage.

---

## Quick Reference

| Tip | Key Action |
|-----|------------|
| Parallel work | Use git worktrees, 3-5 sessions |
| Model | Opus with thinking |
| Planning | Start in plan mode for complex tasks |
| CLAUDE.md | Update after every correction |
| Skills | Create for repeated workflows |
| Subagents | Offload to keep context clean |
| Hooks | Auto-format, lifecycle hooks, logging |
| Permissions | Pre-allow safe commands, wildcards |
| MCP | Integrate Slack, BigQuery, Sentry |
| Long-running | Use Stop hooks, background agents |
| Verification | Always give Claude a way to verify |
| Learning | Use Claude to explain and teach |
| Terminal | /config, /terminal-setup, /vim |
| Effort | /model to set Low/Medium/High |
| Plugins | /plugin for LSPs, MCPs, skills |
| Agents | .claude/agents, custom defaults |
| Sandboxing | /sandbox for file & network isolation |
| Status line | /statusline for custom info display |
| Keybindings | /keybindings to re-map any key |
| Spinners | Customize spinner verbs in settings |
| Output styles | Explanatory, learning, or custom |
| Customize | 37 settings, 84 env vars |
| Worktrees | `claude --worktree`, subagent isolation |
| /simplify | Parallel agents for code quality review |
| /batch | Parallel code migrations with worktree isolation |
| /loop | Schedule recurring tasks for up to 3 days |
| Code Review | Agent-powered PR reviews that catch real bugs |
| /btw | Ask questions mid-task without breaking flow |
| /effort | Max reasoning mode for deeper thinking |
| Remote Control | Spawn new sessions from mobile |
| Voice Mode | Talk to Claude Code on Desktop |
| Setup Scripts | Automate cloud environment setup |
| --name | Name sessions at launch |
| Auto Naming | Plan mode auto-names sessions |
| /color | Color-code prompt input per session |
| PostCompact | Hook for context compression events |
| Auto Mode | Safer permission skipping with classifiers |
| /schedule | Cloud-based recurring jobs beyond your laptop |
| iMessage | Text Claude from any Apple device |
| Auto-Memory & Dream | Persistent, self-cleaning memory system |

---

*Source: [howborisusesclaudecode.com](https://howborisusesclaudecode.com) - Tips from Boris Cherny's January 2026, February 2026, and March 2026 threads*
