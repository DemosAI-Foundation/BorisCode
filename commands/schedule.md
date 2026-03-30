---
description: Creates a GitHub Actions cron job for OpenCode
agent: build
---
The user wants to schedule: "$ARGUMENTS".
1. Figure out the appropriate cron syntax for this request.
2. Create a file `.github/workflows/opencode-cron-${Date.now()}.yml`.
3. Use the template from the OpenCode GitHub Action docs, setting the `prompt` to the user's request.
4. Commit and push the file to the current branch.