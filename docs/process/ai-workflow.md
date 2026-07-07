# How this repo was built

This repo demonstrates a spec-driven, AI-first development workflow. A product manager
wrote and curated the product artifacts. AI coding agents turned those artifacts into a
working app.

## Pipeline

1. Discovery. Personas and jobs-to-be-done in docs/product/discovery-brief.md set the
   problem. The tracking plan in docs/product/success-metrics.md defined success before
   code existed.
2. Constitution. Spec Kit initialized the project and .specify/memory/constitution.md
   captured non-negotiable principles: determinism, test discipline, instrumentation,
   scope discipline, and plain prose.
3. Specification. The feature spec in specs/001-options-strategy-builder/spec.md defines
   user stories, scope, requirements, and measurable outcomes.
4. Planning. specs/001-options-strategy-builder/plan.md defines stack, module boundaries,
   testing policy, and source structure.
5. Tasks. specs/001-options-strategy-builder/tasks.md breaks the plan into executable
   work items with task IDs.
6. Execution. Codex implemented the app while Claude was rate-limited. Commits reference
   task IDs after tasks.md exists.
7. Verification. Vitest covers deterministic domain logic. Playwright covers the full
   trader journey. CI runs unit tests, build, and e2e.

## Why the commit history matters

Read the log oldest-first: the design, Spec Kit setup, product docs, spec, plan, and tasks
land before application code. That ordering is the point. The spec is the source of truth;
the code is its output.

## Human and AI split

Human PM: problem framing, personas, event taxonomy, scope decisions, spec curation, and
acceptance of each task.

AI agents: implementation, tests, refactoring, documentation wiring, and verification.

## The mid-build agent handoff

Partway through implementation the primary agent (Claude Code) became unavailable, and a
second agent (Codex) continued from the same spec, plan, and task list, documenting every
deviation in handoff notes. When Claude Code returned, it independently re-verified the
work: re-ran the suites, audited the event taxonomy and UI test contract, and reviewed
each flagged deviation before anything was published.

That unplanned swap is the strongest evidence here for spec-driven development: the
artifacts carried the intent, so the implementing agent was replaceable mid-project
without losing direction. The full review record, including deviations accepted and why,
is in docs/process/agent-handoff-review.md.

## Adding the next feature

The workflow is repeatable. To build on this repo:

1. Promote an item from docs/product/roadmap.md, or write a new discovery insight into
   a spec-ready brief.
2. Start a new feature cycle: create `specs/002-<name>/` using the installed Spec Kit
   skills (`.claude/skills/speckit-specify`, then speckit-plan, then speckit-tasks; the
   scaffolding scripts live in `.specify/scripts/powershell/`).
3. Implement task by task under the constitution's constraints. CLAUDE.md at the repo
   root carries the binding rules for any agent session.
4. Keep CI green and re-verify the live demo before merging to main.
