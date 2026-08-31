# Cost-saving changes for `jon-lawton-website`

These changes belong in **`avantgardetricycle/jon-lawton-website`**, not Tend. They cut the cost of each chat-driven site edit.

## What is wrong today

`.github/workflows/claude.yml` is effectively:

```yaml
claude_args: "--max-turns 30"
```

There is no model pin, no write tools, and no job timeout. That produced:

- Default model **`claude-opus-5` with a 1M context window** (wrong model for copy and layout)
- **5 permission denials** (the agent could read and comment, but not edit files)
- **39 turns and ~$0.86**, then a **failed job after a successful result** because 39 > 30

`--max-turns 30` did not stop the run at 30. The Action kept going, then exited 1. Tend treated that as a failure and invited a retry — a second bill for work that already succeeded.

## What to change

All of this is in `.github/workflows/claude.yml`.

### 1. Pin Sonnet (largest saving)

Claude Code’s default is Opus. For this musician site, pin Sonnet:

```yaml
--model claude-sonnet-4-6
```

### 2. Allow Edit and Write

The Action’s default tool list is read + git + GitHub comments. File edits get denied, the agent retries, and turns (and dollars) burn. Add:

```yaml
--allowedTools Edit,Write,Read,Glob,Grep,LS,Bash
```

### 3. Stop failing after a successful over-cap run

Use a higher turn fuse plus a real timeout. `timeout-minutes` is the hard stop. `--max-turns` should be high enough that a finished job is not discarded.

```yaml
timeout-minutes: 15
# ...
claude_args: "--max-turns 50"
```

### 4. Do not write GitHub essays (optional, still worth it)

Tag mode still injects a “update the issue comment / todo list” protocol. Jon never reads those comments. Tend does not need the checklist. The only GitHub text that matters is `@claude` in the issue or PR that **starts** the job.

You cannot fully remove the comment protocol without leaving tag mode, but you can spend fewer turns on it:

```yaml
--append-system-prompt "Implement the site change only. Edit files, commit, and push a PR. Do not maintain a GitHub comment todo list. One short final comment is enough."
```

## Suggested workflow file

Replace `.github/workflows/claude.yml` with:

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request_review:
    types: [submitted]

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: |
            --model claude-sonnet-4-6
            --max-turns 50
            --allowedTools Edit,Write,Read,Glob,Grep,LS,Bash
            --append-system-prompt "Implement the site change only. Edit files, commit, and push a PR. Do not maintain a GitHub comment todo list. One short final comment is enough."
```

## Leave alone

- Triggers and the `@claude` `if:` — Tend still starts work that way
- `CLAUDE.md` — keep it short (content, copy, and styling only). A long file is reread every turn
- Secrets, checkout, and permissions

## Expected effect

The same dropdown-style request should land as a real PR on Sonnet, with write tools, without a false failure, at a small fraction of $0.86.

If a run still blows past 30+ turns after this, the leftover cost is the Action’s comment protocol, not the model. That is when it is worth leaving tag mode for a custom `prompt`.
