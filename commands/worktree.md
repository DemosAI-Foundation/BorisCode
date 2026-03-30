---
description: Spawns a new parallel OpenCode session in an isolated git worktree
agent: general
---
1. Execute `git worktree add ../$1 origin/main` using the bash tool.
2. Start a headless OpenCode server in that directory by running `cd ../$1 && Start-Process opencode -ArgumentList "serve --port 0" -WindowStyle Hidden` in PowerShell.
3. Read the assigned port from the log and provide the `opencode attach http://localhost:<port>` command to join it.