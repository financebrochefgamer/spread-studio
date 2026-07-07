# Spread Studio playbook

Status: living document, append-only lessons section
Audience: any agent or human picking up this repo

This is the operating playbook this repo actually follows, distilled from what shipping
v1 and v2 taught. New process learning gets appended to Lessons, never edited into the
narrative above it, so the history of what we learned and when stays intact.

## The cycle

1. Promote a roadmap or gap-analysis item, or capture a new discovery insight.
2. Open a spec PR: `specs/NNN-name/spec.md` only, plus any tracking-plan or roadmap
   updates the spec requires. This is a spec review session, not a code review. No
   implementation code in this PR.
3. Dispatch an independent reviewer against the spec alone (ambiguity, testability,
   constitution compliance, domain correctness). Post findings as a PR comment.
   Resolve every finding in a spec revision, post the resolution, re-review until
   APPROVE.
4. Merge the spec PR.
5. `/speckit.plan` then `/speckit.tasks` (or the installed skill equivalents) on a new
   implementation branch. Commit plan and tasks before any code.
6. Implement task by task, TDD for domain math, matching the plan's exact interfaces
   and testid contract.
7. Open an implementation PR. Dispatch an independent reviewer against the diff, with
   the spec and plan as the binding requirements, not the implementer's own report.
8. Fix Critical and Important findings; record Minor findings and fix the cheap ones
   before merge if the code is public-facing.
9. Merge, deploy, verify the live demo end to end with Playwright against the
   production URL.
10. Update README, roadmap, and local interview talking points before calling it done.

## Model tiering

Implement on a fast/cheap-tier model when the plan already specifies exact interfaces,
formulas, and test cases (mechanical execution). Review on the most capable available
model, on a different model family or tier than the implementer where possible.

This is not a cost optimization by itself. It is a quality control: in this repo, the
review layer caught a Greeks contract-multiplier bug in v1 and a units-conversion plus
P&L-sign-inversion bug in the v2 spec, none of which a passing test suite alone had
caught. Review independence works because the reviewer is given the spec and the diff,
never the implementer's narrative, and is instructed to trace the actual math rather
than trust a green test name.

## What makes a spec reviewable

A spec a reviewer can actually hold accountable states, not implies:
- Every formula with explicit units (a shift expressed in "points" and a shift
  expressed in "percent" are different numbers; say which one a variable holds).
- Every sign convention (which direction is positive money, which side of a trade is
  positive quantity).
- Every persistence key and record shape, not just "it gets saved somewhere."
- Every acceptance criterion as something a test or a demo gesture can check, not a
  vibe.
- What is deliberately out of scope, and why, so a reviewer doesn't file it as a gap.

Two rounds of review on spec 002 caught exactly these categories of ambiguity before a
single line of implementation existed. That is cheaper than catching them in code.

## Working-tree discipline

One implementation agent owns the working tree at a time. Do not switch branches,
run destructive git operations, or start a second implementer while one is active;
their changes are file-based and a concurrent operation can corrupt or lose them.
Docs-only work queues behind an active implementer for the same reason, even though
it touches different files, because branch state is shared.

## Handling unsolicited parallel contributions

More than one agent has worked this repo in overlapping sessions. When you find
uncommitted or unfamiliar work in the tree: read it in full before touching it, verify
any factual claims it makes against the actual repo state (it may describe a moment
that has since moved on), and if it's good, accept it with a visible acceptance note
rather than silently absorbing or discarding it. See
docs/product/role-gap-analysis.md's acceptance note for the pattern.

## Honesty in public docs

Name every agent that touched the repo. Do not claim tooling that was not used
(Cowork, Amplitude, live data) even if the target role's posting names it; document it
as backlog with a reason instead. Do not claim real user research when it is
synthesized. The credibility of the "specs as living artifacts" claim depends on every
adjacent claim also being true.

## Lessons (append-only, newest last)

- 2026-07-06: A stale `.next` build cache can produce a phantom TypeScript error on
  `npm run build`. Delete `.next` and rebuild before treating it as a real compile
  error.
- 2026-07-06: Mid-build agent handoffs are survivable, and are themselves evidence for
  the spec-driven thesis, if the handoff is documented and the returning agent
  independently re-verifies rather than trusting the handoff notes.
- 2026-07-07: A spec's acceptance criteria can be mathematically false even when they
  sound reasonable ("theta is always negative for long options" is false for deep
  ITM puts). Reviewers should check acceptance criteria as claims to verify, not just
  as descriptions to compare against code.
- 2026-07-07: The same bug class (unit conversion, sign convention) recurred across
  the spec review and the implementation review for the same feature. This is not a
  review failure. It means the spec review and the code review are checking different
  things: the spec review checks whether the stated formula is unambiguous and
  correct; the code review checks whether the code actually implements the stated
  formula. Both gates are necessary.
