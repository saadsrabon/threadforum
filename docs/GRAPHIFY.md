# Graphify — ThreadSphere

This project uses [Graphify](https://graphify.net/) to maintain a queryable knowledge graph.

## Setup (done)

- Cursor rule: `.cursor/rules/graphify.mdc`
- Detect manifest: `.graphify-detect.json`
- AST extraction cache: `.graphify/`

## Commands

```bash
# Re-detect files after adding modules
graphify detect . --out .graphify-detect.json

# AST + semantic extraction (run in Cursor with /graphify . for full graph)
graphify extract . --out .graphify

# Query once graph.json exists
graphify query "how does thread validation work?"
graphify path "createThreadSchema" "registerSchema"
graphify explain "SOCKET_EVENTS"

# Interactive HTML visualization (after full /graphify . run)
open .graphify/graph.html
```

## When to rebuild

Run `graphify detect` or `/graphify .` after:
- Adding new apps/packages
- New domain schemas (auth, thread, community)
- Major route or socket event changes

## Current status

- **AST extraction:** complete (12 code files detected)
- **Full graph.json:** pending — run `/graphify .` in Cursor for semantic pass + graph build
