### Agent Definitions

Agent files are Markdown files in the `agents/` directory with YAML frontmatter:

```markdown
---
description: Brief description of the agent's purpose
mode: primary  # or 'subagent' or 'all' - NEVER 'default'
permission:
  edit: allow|deny
  bash:
    "*": allow|deny
    "specific command": allow|deny
---
Agent system prompt goes here...
```

**Key fields**:
- `description`: What the agent does
- `mode`: `primary` (standalone agent), `subagent` (called by other agents), or `all` (both) - NEVER `default`
- `permission`: Controls what tools the agent can use


## Agent Conventions
- Boris is the planning agent

## Recent Lessons Learned