---
description: Automates commit, push, and PR creation
agent: build
---
Analyze the current git status and diff:
!git status
!git diff HEAD

Execute the following steps:
1. Generate a conventional commit message based on the diff and execute the commit.
2. Push the branch to the remote repository.
3. Create a GitHub PR using `gh pr create --fill` via the bash tool.