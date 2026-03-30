# OpenCode AI Configuration Repository

This repository contains the configuration for the OpenCode AI coding assistant.

## Quick Summary

- **Type**: Configuration-only repository (no compilation needed)
- **Main config**: `opencode.jsonc`
- **Agents**: Defined in `agents/` directory
- **Plugins**: `@tarquinen/opencode-dcp@latest`, `superpowers` (GitHub)
- **Build/Lint/Test**: Not applicable (configuration only)

## Directory Structure

```
opencode/
├── opencode.jsonc      # Main OpenCode configuration
├── dcp.jsonc           # Dynamic Context Pruning config
├── .gitignore          # Git ignore rules
├── package.json        # Plugin dependencies
├── bun.lock            # Dependency lockfile
└── agents/             # Agent definitions (Markdown files)
```

## Configuration Files

### opencode.jsonc

The main configuration file for OpenCode. Uses JSONC (JSON with comments) format.

**Schema**: `https://opencode.ai/config.json`

**Key sections**:
- `disabled_providers`: Array of provider names to disable
- `plugin`: Array of plugin specifications (npm packages or git URLs)
- `agent`: Object mapping agent names to their configuration
- `provider`: Object mapping provider names to their configuration

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

### Provider Configuration

Providers are AI model backends. Configure in `opencode.jsonc` under `provider`:

```jsonc
"provider": {
  "provider-name": {
    "name": "Display Name",
    "npm": "@ai-sdk/provider-package",
    "models": {
      "1": {
        "name": "model-name"
      }
    },
    "options": {
      "baseURL": "http://localhost:port/v1"
    }
  }
}
```

### Plugin Configuration

Plugins extend OpenCode's functionality. Configure in `opencode.jsonc` under `plugin`:

Plugins can be:
- NPM packages: `@scope/package@version`
- Git URLs: `package@git+https://github.com/user/repo.git`

## Code Style Guidelines

### JSON/JSONC Files

- Use 2-space indentation
- Include `$schema` property for schema validation
- Use double quotes for all strings
- Keep trailing commas in multi-line objects/arrays
- Add comments to explain configuration choices (JSONC feature)

### Markdown Files

- Use proper Markdown syntax
- Include YAML frontmatter at the top for agent definitions
- Use consistent heading hierarchy (`#`, `##`, `###`)
- Wrap code in triple backticks with language identifiers

### Agent Prompt Guidelines

- Be specific about the agent's role and responsibilities
- Include guidance on when to delegate to other agents
- List specific tasks the agent should focus on
- Define output format expectations

## Agent Conventions

### code-reviewer

- When you finish building a complex feature, ALWAYS invoke the code-reviewer subagent via your Task tool to clean up your work.
- Reviews code for best practices and potential issues
- Delegates security tasks to `security-engineer`
- Cannot write or edit files (tools disabled)

### security-engineer

- When you finish building a complex feature: perform security audits and identify vulnerabilities
- Checks for: input validation, authentication flaws, data exposure, dependency vulnerabilities, config security, cryptographic weaknesses
- Cannot write or edit files (tools disabled)
- Runs as a subagent (called by other agents)

## Provider Conventions

### llamacpp

- Local Llama model via OpenAI-compatible API
- Base URL: `http://127.0.0.1:8083/v1`
- Default provider for this configuration

## Build/Run/Lint Commands


## Git Conventions

The `.gitignore` excludes:
- `node_modules/` - Dependencies
- `package.json` - Not tracked (dependencies managed elsewhere)
- `bun.lock` - Lockfile
- `.gitignore` - This file itself

## Special Notes

- The `opencode` theme should be used for consistent formatting
- Agent names in `opencode.jsonc` must match the filenames in `agents/`
- When adding new agents, ensure they're registered in the `agent` section of `opencode.jsonc`
- Provider names must match between `disabled_providers` and `provider` sections
- Local providers (myprovider, llamacpp) require running services at their specified URLs

## Recent Lessons Learned