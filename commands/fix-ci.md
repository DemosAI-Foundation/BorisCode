---
description: Automatically pulls the latest failed GitHub Action logs and fixes the bug
agent: build
---
1. Execute `gh run list --status failure --limit 1 --json databaseId` to retrieve the ID of the last failed run.
2. Execute `gh run view <id> --log-failed` to retrieve the error output.
3. Analyze the error and implement the necessary code changes to fix the build.