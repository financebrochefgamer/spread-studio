# Platform Vision Embedding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the platform vision as docs/product/vision.md and wire it into every governing layer so all future spec cycles inherit it automatically.

**Architecture:** Docs-only cycle. One new public doc (vision.md) plus amendments to six existing governing files: constitution, CLAUDE.md, spec-queue, roadmap, playbook, and the private CLAUDE.local.md. No app code changes. Delivered as one PR on a branch, except CLAUDE.local.md which is gitignored and edited in place.

**Tech Stack:** Markdown, git, grep for verification. No build or test suite involvement beyond CI staying green (docs changes do not affect it).

**Spec:** docs/superpowers/specs/2026-07-08-platform-vision-design.md (approved 2026-07-08).

## Global Constraints

- Prose rules for all committed docs: no em-dashes, short sentences, no marketing gloss (constitution Principle VII).
- The public repo never names target companies, postings, or the application in README, app code, or new docs. Verbatim posting captures go only in CLAUDE.local.md (gitignored).
- Verification for every public doc in this plan: `grep -n "—" <file>` returns nothing, and `grep -inE "$(paste -sd'|' /d/spread-studio-notes/private-terms.txt)" <file>` returns nothing (the terms file lives outside the repo and holds the names and job IDs public files must never contain; CLAUDE.local.md is exempt because it is private). Do not use `grep -f`; it aborts on this host's git-bash.
- Market data stays synthetic and deterministic by default, indefinitely. Real-data language must always be phrased as opt-in adapter seams.
- Do not renumber existing spec-queue tentative IDs (007-010). New candidates start at 011.
- All work except Task 7 happens on branch `platform-vision`. Task 7 edits a gitignored file and is never committed.

---

### Task 1: Create branch and write docs/product/vision.md

**Files:**
- Create: `docs/product/vision.md`

**Interfaces:**
- Produces: the public north-star doc every later task links to by the exact path `docs/product/vision.md`, with section headings "North star", "Twin pillars", "Competitive theses", "AI-native product principles", "Ambition arcs", "How the vision is enforced".

- [ ] **Step 1: Create the branch**

```bash
cd /d/spread-studio
git checkout -b platform-vision
```

- [ ] **Step 2: Write docs/product/vision.md with exactly this content**

```markdown
# Product vision

Status: north star, living document. Every feature spec must name the pillar
and arc it advances (constitution Principle VIII). Last updated 2026-07-08.

## North star

Spread Studio is the AI-native derivatives strategy platform: the place active
traders build, stress-test, and master multi-leg strategies. It exists to prove
that one experienced trader-PM directing AI agents ships a competitive
active-trader platform at the level of a senior engineering team, with no clash
of ideas between vision and execution.

The competitive frame is honest and ambitious. The incumbents are TradingView,
brokerage analyze tools, and options-strategy visualizers. We do not chase
their breadth. We beat them where depth wins.

## Twin pillars

### Pillar 1: Strategy Intelligence

Beat incumbent options analytics at strategy construction, scenario analysis,
and Greeks-level decision support. Incumbents treat options analytics as a
bolted-on tab. For us it is the core product. This pillar grows from what is
already shipped: the builder, templates, payoff engine, scenario engine, and
broker-grade order ticket.

### Pillar 2: Trader Development

The deterministic practice arena: paper trading, trade journaling, AI trade
review, replayable market scenarios, measurable skill progression. Synthetic
data is the feature, not the limitation. It is reproducible, fair, free, and
needs zero API keys. No incumbent can offer a perfectly replayable market.

## Competitive theses

1. Depth where incumbents are shallow. Options analytics is our core product,
   their side tab.
2. Zero friction. Free, instant, no signup, no data vendor, no paywall ladder.
3. AI-native in a way incumbents structurally cannot match. The platform
   exposes its engine to the user's own AI over MCP, and embedded AI features
   ship as opt-in adapters. The industry named this category "agentic
   brokerage" in 2026. Our architecture was already shaped for it.
4. Build velocity. Spec-driven AI agents deliver hours-level cycle times,
   documented publicly in this repo's history.

## AI-native product principles

Deterministic core, intelligent edges.

- All domain math (pricing, payoff, chains, analytics) stays deterministic and
  offline. This keeps the product testable, replayable, and free.
- AI enters through two proven patterns only:
  1. The MCP surface: the user's own agent operates the platform. Today that
     is read-only analytics. The arc is full build, analyze, stress, and order
     control.
  2. Env-flag adapters (the Amplitude pattern): off by default, deterministic
     fallback always, public demo byte-identical.
- Synthetic by default, real-ready by design. Every data and execution
  touchpoint goes through an adapter seam, so real market data or brokerage
  rails are a future integration, never a rewrite.

## Ambition arcs

Four arcs, each a sequence of normal spec cycles under specs/NNN-name/. Arcs
are priorities, not gates, and can interleave. The spec queue, not this doc,
decides what is next. Each arc has an exit test.

### Arc 1: Strategy Intelligence depth

Close the gap with incumbent analyze tools, then pass them. Multi-expiration
payoff modeling (calendars and diagonals). Vol-surface and IV-context
visualization. Margin and buying-power estimates. Richer scenario engine.
Strategy comparison. Order-routing and margining simulation depth.

Exit test: a serious options trader prefers our analyze surface to their
current broker's.

### Arc 2: Trader Development arena

Synthetic data becomes the star. Replayable deterministic market days. Trade
journaling attached to order and position history. Performance analytics over
simulated history. AI trade review. Measurable skill progression.

Exit test: a developing trader measurably improves here and can show it.

### Arc 3: Agentic platform

The MCP surface grows from read-only analytics to full platform control:
build, analyze, stress, order, and review from the user's own AI. A
natural-language strategy copilot ships as an env-flag adapter. Agentic
features get guardrails, logging, and audit trails. AI outputs get an
evaluation and experimentation discipline. Responsible-AI documentation fits
the regulated domain. The repo's own playbook and skills are packaged as the
agent-framework story.

Exit test: a complete strategy lifecycle driven entirely through the user's
own AI agent.

### Arc 4: Breadth and reach

Futures (promote spec 003 from spec-only). Alerts. Mobile layout. Charting
where it serves strategy intelligence. A multi-surface platform story.

Exit test: platform-scope roadmap credibility across surfaces and asset
classes.

## How the vision is enforced

- Constitution Principle VIII requires every feature spec to name its pillar
  and arc. Feature specs that advance no pillar are rejected at spec review.
- CLAUDE.md requires reading this doc before proposing, spec'ing, or planning
  any feature.
- docs/product/spec-queue.md tags every candidate with a pillar and arc.
- docs/product/roadmap.md organizes future work by these arcs.
```

- [ ] **Step 3: Verify prose and privacy rules**

```bash
grep -n "—" docs/product/vision.md
grep -inE "$(paste -sd'|' /d/spread-studio-notes/private-terms.txt)" docs/product/vision.md
grep -in "posting" docs/product/vision.md
```

Expected: all three commands return nothing. Note: `grep -f` aborts on this
host's git-bash; always use the `paste` form above for the private-terms scan.

- [ ] **Step 4: Commit**

```bash
git add docs/product/vision.md
git commit -m "docs: add product vision north star (twin pillars, four arcs)"
```

---

### Task 2: Amend the constitution to version 2.0.0

**Files:**
- Modify: `.specify/memory/constitution.md`

**Interfaces:**
- Consumes: `docs/product/vision.md` (Task 1) by exact path.
- Produces: Principle VIII "Vision Alignment" and the reframed Principle II, which Tasks 3, 4, and 6 reference.

- [ ] **Step 1: Add a Mission section immediately after the title**

Replace:

```markdown
# Spread Studio Constitution

## Core Principles
```

With:

```markdown
# Spread Studio Constitution

## Mission

Spread Studio is an AI-native derivatives strategy platform. The north star,
twin pillars (Strategy Intelligence and Trader Development), competitive
theses, and ambition arcs live in docs/product/vision.md. This constitution
governs how work happens. The vision governs what work is worth doing.

## Core Principles
```

- [ ] **Step 2: Replace Principle II**

Replace:

```markdown
### II. Deterministic Demo

The demo must work offline and must not depend on fragile external services. The app
uses no external APIs, no database, no auth, and no clock-dependent domain logic.
Domain logic uses the fixed market date 2026-07-06 and deterministic inputs.
```

With:

```markdown
### II. Deterministic Core, Real-Ready Seams

The product works offline and does not depend on fragile external services.
Domain logic uses the fixed market date 2026-07-06 and deterministic inputs,
with no clock-dependent behavior. This is a product identity, not a demo
shortcut: it keeps the platform testable, replayable, and free. By default the
app uses no external APIs, no database, and no auth. Optional integrations are
allowed only behind adapter seams that are off by default and leave the
default experience byte-identical (the Amplitude adapter is the reference
pattern). Any spec that touches market data or order execution must state its
adapter seam, so real data or brokerage rails stay a future integration, not a
rewrite.
```

- [ ] **Step 3: Replace Principle VI**

Replace:

```markdown
### VI. Scope Discipline

Build the smallest durable v1 that proves the product and the workflow. Deferred
work goes to docs/product/roadmap.md with a written reason. Do not add live market
data, auth, databases, margin modeling, futures, or multi-expiration strategies in
v1 unless a new spec explicitly replaces this constitution.
```

With:

```markdown
### VI. Scope Discipline

Build the smallest durable increment that proves the product and the workflow.
Deferred work goes to docs/product/spec-queue.md or docs/product/roadmap.md
with a written reason. Live market data, auth, and databases stay out of the
default product per Principle II and enter only as opt-in adapters demanded by
a spec. Margin modeling, futures, and multi-expiration strategies enter
through their own spec cycles under the vision arcs in docs/product/vision.md.
```

- [ ] **Step 4: Add Principle VIII after Principle VII**

Insert after the Principle VII block:

```markdown
### VIII. Vision Alignment

docs/product/vision.md is the product north star. Every new feature spec
names, in its header, the vision pillar and arc it advances. A feature spec
that advances no pillar is rejected at spec review. Process and docs artifacts
cite the operating model instead of a pillar.
```

- [ ] **Step 5: Update the version line**

Replace:

```markdown
**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
```

With:

```markdown
**Version**: 2.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-08
```

- [ ] **Step 6: Verify**

```bash
grep -n "—" .specify/memory/constitution.md
grep -c "### " .specify/memory/constitution.md
grep -n "vision.md" .specify/memory/constitution.md
```

Expected: no em-dashes; principle heading count is 8; vision.md referenced in
Mission, Principle VI, and Principle VIII.

- [ ] **Step 7: Commit**

```bash
git add .specify/memory/constitution.md
git commit -m "docs: constitution v2.0.0, mission and vision alignment principles"
```

---

### Task 3: Amend CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (repo root)

**Interfaces:**
- Consumes: `docs/product/vision.md` (Task 1), constitution Principle II wording (Task 2).

- [ ] **Step 1: Replace the intro paragraph**

Replace:

```markdown
# Spread Studio

Deterministic, client-only multi-leg options strategy builder. Portfolio repo
demonstrating spec-driven development with AI agents. Live: https://spread-studio.vercel.app
```

With:

```markdown
# Spread Studio

AI-native derivatives strategy platform on a deterministic core, built by AI
agents directed by one PM. North star: docs/product/vision.md.
Live: https://spread-studio.vercel.app
```

- [ ] **Step 2: Update the determinism bullet in the constraints list**

Replace:

```markdown
- Deterministic demo: no external APIs, no database, no auth, no Date.now() or
  Math.random() in domain logic. Fixed market date lives in lib/market/constants.ts.
```

With:

```markdown
- Deterministic core: no external APIs, database, or auth by default; no
  Date.now() or Math.random() in domain logic. Fixed market date lives in
  lib/market/constants.ts. Optional integrations only as off-by-default
  adapters with a stated seam (constitution Principle II).
```

- [ ] **Step 3: Add the vision rule to the Process section**

Replace:

```markdown
## Process

Read docs/process/playbook.md before starting any new feature; it is the living
```

With:

```markdown
## Process

Read docs/product/vision.md before proposing, spec'ing, or planning any
feature; every feature spec must name the vision pillar and arc it advances
(constitution Principle VIII).

Read docs/process/playbook.md before starting any new feature; it is the living
```

- [ ] **Step 4: Verify**

```bash
grep -n "—" CLAUDE.md
grep -n "vision.md" CLAUDE.md
```

Expected: no em-dashes; vision.md appears in the intro and the Process section.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md points agents at the vision before any feature work"
```

---

### Task 4: Amend the spec queue with pillar and arc tags

**Files:**
- Modify: `docs/product/spec-queue.md`

**Interfaces:**
- Consumes: pillar and arc names from `docs/product/vision.md` (Task 1). Pillar values: P1 (Strategy Intelligence), P2 (Trader Development). Arc values: Arc 1 through Arc 4.

- [ ] **Step 1: Replace the candidate backlog table**

Replace the existing "## Candidate backlog" intro sentence and table with:

```markdown
## Candidate backlog

Ranked by signal-to-effort. Confidence reflects how well-scoped the idea is today, not
whether it will be built. Pillar/arc values come from docs/product/vision.md: P1 is
Strategy Intelligence, P2 is Trader Development, arcs 1-4 are the ambition arcs.
Process artifacts carry "ops" instead of a pillar.

| ID (tentative) | Title | Pillar/arc | Role signal | Confidence | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 007 | Databricks event model | ops | Analytics stack fluency | High | None | Sample table schema (events_raw, events_clean, sessions) and real SQL against this repo's actual event shape, same pattern as the experiment memo |
| 008 | KPI tree | ops | Measurable business outcomes | High | None | Activity to activation to outcome to business-result model tied to this app's actual events |
| 009 | Margin and buying-power estimate | P1 / Arc 1 | Broker-dealer platform conventions | Medium | None (006 shipped; margin display belongs on the order-ticket surface it provides) | Simplified, explicitly labeled estimate per strategy type |
| 010 | Market data adapter | P1 / Arc 1 | Domain realism | Low | Constitution Principle II adapter-seam rules | Provider abstraction with a synthetic default; the reference real-ready seam |
| 011 | Multi-expiration payoff modeling | P1 / Arc 1 | Calendars and diagonals; the known hard problem | Medium | Pricing model valuation of the far leg at near expiration | Unlocks calendar and diagonal templates |
| 012 | Vol-surface and IV-context visualization | P1 / Arc 1 | Options analytics depth | Medium | None | Skew and term structure the chain generator already encodes, made visible |
| 013 | Strategy comparison | P1 / Arc 1 | Decision support | Medium | None | Side-by-side candidate structures on one payoff and Greeks view |
| 014 | Replayable market days | P2 / Arc 2 | Practice arena core | Medium | Scenario engine (002, shipped) | Deterministic scripted market paths a trader can rerun |
| 015 | Trade journal and performance analytics | P2 / Arc 2 | Retention and engagement | Medium | Positions history (002, shipped) | Journal entries attached to orders and positions, stats over simulated history |
| 016 | Agentic MCP control surface | P1+P2 / Arc 3 | Agentic brokerage wave | Medium | MCP server (004, shipped) | Build, analyze, stress, and order via the user's own agent; guardrails and audit log required |
| 017 | Strategy copilot adapter | P1 / Arc 3 | Customer-facing AI | Low | 016 preferred first | Natural-language strategy help behind an env flag, Amplitude adapter pattern |
| - | Platform surface map | ops | Cross-surface roadmap | Medium | None | Generic desktop/web/mobile framing |
| - | Competitive and AI-tooling watchlist | ops | Industry awareness | Medium | None | Recurring-scan habit, not a one-time matrix |
| - | Release brief (retroactive, for a past ship) | ops | Launch documentation | Medium | None | Demonstrates the artifact shape more than new capability |
| - | VIP-UX design philosophy note | ops | Professional-grade UX | Low | None | Articulate existing dense/dark UI choices as deliberate, not default |
```

- [ ] **Step 2: Verify**

```bash
grep -n "—" docs/product/spec-queue.md
grep -inE "$(paste -sd'|' /d/spread-studio-notes/private-terms.txt)" docs/product/spec-queue.md
grep -in "posting language" docs/product/spec-queue.md
grep -c "Arc" docs/product/spec-queue.md
```

Expected: no em-dashes. The second grep returns no matches in the candidate
table you wrote (pre-existing "posting language" phrases in the Shipped table
are out of scope; leave them). Arc appears at least 9 times.

Note: if the second grep matches only lines in the Shipped table, that is
acceptable. Do not rewrite shipped history in this task.

- [ ] **Step 3: Commit**

```bash
git add docs/product/spec-queue.md
git commit -m "docs: tag spec queue with vision pillars and arcs, seed arc candidates"
```

---

### Task 5: Point the roadmap at the vision arcs

**Files:**
- Modify: `docs/product/roadmap.md`

**Interfaces:**
- Consumes: arc names and the exact path `docs/product/vision.md` (Task 1).

- [ ] **Step 1: Add a vision section after the Date line**

Replace:

```markdown
# Roadmap

Date: 2026-07-06
```

With:

```markdown
# Roadmap

Date: 2026-07-06. Vision anchor added 2026-07-08.

## North star and arcs (2026-07-08 onward)

docs/product/vision.md is the product north star. Future work organizes under
its four ambition arcs: Arc 1 Strategy Intelligence depth, Arc 2 Trader
Development arena, Arc 3 Agentic platform, Arc 4 Breadth and reach. The
version-numbered sections below are the historical record of how v1 through v5
shipped. New items land in docs/product/spec-queue.md tagged with a pillar and
arc, not in new version sections here.
```

- [ ] **Step 2: Verify**

```bash
grep -n "—" docs/product/roadmap.md
grep -n "vision.md" docs/product/roadmap.md
```

Expected: no em-dashes; vision.md referenced in the new section.

- [ ] **Step 3: Commit**

```bash
git add docs/product/roadmap.md
git commit -m "docs: roadmap anchors to vision arcs going forward"
```

---

### Task 6: Append the playbook lesson

**Files:**
- Modify: `docs/process/playbook.md` (Lessons section, append-only, newest last)

**Interfaces:**
- Consumes: the embedding decision from the design doc.

- [ ] **Step 1: Append this bullet at the end of the Lessons section**

```markdown
- 2026-07-08: Product strategy now lives in one north-star doc
  (docs/product/vision.md) wired into every governing layer: constitution
  Principle VIII, CLAUDE.md's process section, the spec queue's pillar/arc
  tags, and the roadmap. Feature specs must name the pillar and arc they
  advance or be rejected at spec review. The lesson is the mechanism, not the
  mission: a one-time strategic decision only survives across sessions when it
  is written into the files an agent must read before planning, the same
  pattern as this lessons log itself.
```

- [ ] **Step 2: Verify**

```bash
grep -n "—" docs/process/playbook.md
tail -12 docs/process/playbook.md
```

Expected: no em-dashes; the new bullet is the last entry.

- [ ] **Step 3: Commit**

```bash
git add docs/process/playbook.md
git commit -m "docs: playbook lesson on vision anchoring across governing layers"
```

---

### Task 7: Amend CLAUDE.local.md (private, never committed)

**Files:**
- Modify: `CLAUDE.local.md` (repo root, gitignored)

**Interfaces:**
- Consumes: mission decision from the design doc; the private capture file
  `D:\spread-studio-notes\leadership-postings-2026-07-08.md` (already written).

Privacy note: this plan file is public. It quotes no names, product names, or
job IDs from the private layer. Do not paste private content into this plan or
into any commit.

- [ ] **Step 1: Replace the first paragraph**

Replace the entire first paragraph of CLAUDE.local.md (the paragraph beginning
"This repo is a passion project") with:

```markdown
Mission update 2026-07-08 (docs/superpowers/specs/2026-07-08-platform-vision-design.md):
the platform vision in docs/product/vision.md is now the repo's primary mission.
Career evidence is the byproduct of building a genuinely competitive product, not
the goal. This repo remains a reusable application asset for PM roles from senior
to director/VP level across trading-platform companies. When applying to postings,
map their requirements into the evidence map below rather than reshaping the repo
per application; the repo stays one coherent product story.
```

- [ ] **Step 2: Replace the first standing-rule bullet**

Replace:

```markdown
- Every addition to this repo must map to at least one posting requirement below. If it
  does not, it belongs in another project.
```

With:

```markdown
- Every addition to this repo must advance a vision pillar or arc
  (docs/product/vision.md), or be an ops/process artifact citing the operating
  model. Posting alignment is tracked in the evidence map, not used as a gate.
```

- [ ] **Step 3: Append the leadership-postings section from the private capture file**

Append the full contents of
`D:\spread-studio-notes\leadership-postings-2026-07-08.md` (skip its intro
paragraph, keep the three posting sections) to the end of CLAUDE.local.md
under the heading:

```markdown
## Leadership-level posting captures (added 2026-07-08)
```

From git-bash this is:

```bash
{ echo; echo "## Leadership-level posting captures (added 2026-07-08)"; echo; tail -n +8 /d/spread-studio-notes/leadership-postings-2026-07-08.md; } >> CLAUDE.local.md
```

Then open CLAUDE.local.md and confirm the three posting sections read
correctly and the file has no duplicated headings.

- [ ] **Step 4: Verify it stays private**

```bash
git status --short CLAUDE.local.md
git check-ignore CLAUDE.local.md && echo IGNORED
```

Expected: git status shows nothing for this file; second command prints
CLAUDE.local.md then IGNORED. Do not commit anything in this task.

---

### Task 8: Consistency pass, push, and PR

**Files:**
- Read-only pass over: `docs/product/vision.md`, `.specify/memory/constitution.md`, `CLAUDE.md`, `docs/product/spec-queue.md`, `docs/product/roadmap.md`, `docs/process/playbook.md`

**Interfaces:**
- Consumes: all prior tasks.

- [ ] **Step 1: Cross-file consistency scan**

```bash
grep -rn "Deterministic demo" CLAUDE.md .specify/memory/constitution.md docs/product/vision.md docs/product/roadmap.md docs/product/spec-queue.md
grep -rn "vision.md" CLAUDE.md .specify/memory/constitution.md docs/product/roadmap.md docs/product/spec-queue.md docs/process/playbook.md
grep -rn "—" docs/product/vision.md .specify/memory/constitution.md CLAUDE.md docs/product/spec-queue.md docs/product/roadmap.md docs/process/playbook.md
grep -inE "$(paste -sd'|' /d/spread-studio-notes/private-terms.txt)" docs/product/vision.md .specify/memory/constitution.md CLAUDE.md docs/product/spec-queue.md docs/product/roadmap.md docs/superpowers/plans/2026-07-08-platform-vision.md
```

(`private-terms.txt` lives outside the repo and holds the private names and
job IDs the public files must never contain. `grep -f` aborts on this host's
git-bash; the `paste` form is the reliable equivalent.)

Expected: "Deterministic demo" appears nowhere (the phrase was replaced
everywhere it governed; historical mentions inside playbook lessons or old
specs are out of scope and not in this file list). vision.md is referenced
from all five governing files. No em-dashes. No company names, product names,
or job IDs in the public files. If any check fails, fix the offending file,
amend nothing, add a new commit named "docs: consistency fixes from final pass".

- [ ] **Step 2: Confirm pillar/arc citation rule is stated in all three enforcement points**

```bash
grep -n "pillar" .specify/memory/constitution.md CLAUDE.md docs/product/vision.md
```

Expected: at least one match in each file.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin platform-vision
gh pr create --title "docs: platform vision and constitution v2.0.0" --body "$(cat <<'EOF'
## Summary

- Adds docs/product/vision.md: north star, twin pillars (Strategy Intelligence,
  Trader Development), competitive theses, AI-native principles, four ambition
  arcs with exit tests.
- Constitution v2.0.0: Mission section, Principle II reframed as Deterministic
  Core with Real-Ready Seams, Principle VI updated, new Principle VIII Vision
  Alignment (feature specs must name their pillar and arc).
- CLAUDE.md, spec queue, and roadmap wired to the vision so future spec cycles
  inherit it automatically. Spec queue seeded with arc candidates 011-017.
- Playbook lesson appended on vision anchoring.

Design: docs/superpowers/specs/2026-07-08-platform-vision-design.md

## Verification

Docs-only change. Consistency pass across all governing files: no em-dashes,
no private names in public docs, vision referenced from every governing layer,
pillar-citation rule present in constitution, CLAUDE.md, and vision.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed. Request review per docs/process/playbook.md (review
on the stronger model tier, then merge).

- [ ] **Step 4: After merge, verify main and update the interview notes**

```bash
git checkout main && git pull
```

Then append exactly this entry to
`D:\spread-studio-notes\interview-talking-points.md`:

```markdown
## Platform vision shipped (2026-07-08)

- The repo's mission changed: it is now an AI-native derivatives strategy
  platform first, career evidence second. North star: docs/product/vision.md
  (twin pillars: Strategy Intelligence, Trader Development; four ambition
  arcs with exit tests).
- Constitution v2.0.0: vision alignment is a constitutional principle. Every
  feature spec must name the pillar and arc it advances or it is rejected at
  spec review. Determinism reframed as "synthetic by default, real-ready by
  design" with mandatory adapter seams.
- Talking point: I run the repo the way a director runs a product org. One
  north-star doc, enforced through the operating system (constitution, agent
  instructions, spec queue), so strategy survives across sessions and agents
  without me repeating it.
- Three leadership-level postings captured and mapped to arcs; see
  leadership-postings-2026-07-08.md in this folder. Arc 3 (agentic platform,
  guardrails, AI evals, PM enablement) is the direct answer to the AI
  products director archetype.
```
