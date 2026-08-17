# Graph Report - .  (2026-08-17)

## Corpus Check
- Corpus is ~3,397 words - fits in a single context window. You may not need a graph.

## Summary
- 43 nodes · 46 edges · 7 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 31 · MODIFIES: 10 · imports_from: 4 · ON_BRANCH: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 24 · Candidates: 48
- Excluded: 113 untracked · 58035 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `0beb77f`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `__dirname` - 1 edges
2. `PORT` - 1 edges
3. `allowedOrigins` - 1 edges
4. `app` - 1 edges
5. `httpServer` - 1 edges
6. `io` - 1 edges
7. `eslintConfig` - 1 edges
8. `nextConfig` - 1 edges
9. `config` - 1 edges
10. `geistSans` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (6): __dirname, PORT, allowedOrigins, app, httpServer, io

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (5): eslintConfig, nextConfig, config, 0beb77f Bootstrap ThreadSphere monorepo with docs, rules, and Graphify., main

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (3): geistSans, geistMono, metadata

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (5): TAG_LIMITS, CONTENT_LIMITS, API_ROUTES, SOCKET_EVENTS, PHASES

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (4): registerSchema, loginSchema, RegisterInput, LoginInput

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (3): createCommunitySchema, CreateCommunityInput, communityPrivacy

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (4): createThreadSchema, updateThreadSchema, CreateThreadInput, UpdateThreadInput

## Knowledge Gaps
- **28 isolated node(s):** `__dirname`, `PORT`, `allowedOrigins`, `app`, `httpServer` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `__dirname`, `PORT`, `allowedOrigins` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._