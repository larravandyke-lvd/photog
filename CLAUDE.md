# photog

Project instructions for Claude Code. Keep this file short and current — stale
instructions are worse than none.

## Status

The repository is currently a skeleton: `README.md` and this config only. No
application code, build system, or dependencies have been committed yet. Do not
assume a stack; when adding the first code, ask which stack is wanted (or follow
whatever the user specifies) and then update the sections below.

## Layout

```
.
├── CLAUDE.md            # this file
├── README.md
└── .claude/
    └── settings.json    # shared, checked-in Claude Code settings
```

## Commands

None yet. Once a build system exists, record the real commands here — the exact
invocations a contributor runs locally:

| Purpose   | Command      |
| --------- | ------------ |
| Install   | _TBD_        |
| Build     | _TBD_        |
| Test      | _TBD_        |
| Lint      | _TBD_        |
| Typecheck | _TBD_        |

## Conventions

- Match the surrounding code: naming, comment density, and idiom follow whatever
  is already in the file being edited.
- Run the lint/test commands above before pushing, once they exist.
- Commit messages: imperative mood, one-line subject, body only when the "why"
  is not obvious from the diff.
- Do not commit photo assets, RAW files, or generated derivatives; keep binaries
  out of git history.

## Git

- Default branch: `main`.
- Work on feature branches; do not push directly to `main`.
