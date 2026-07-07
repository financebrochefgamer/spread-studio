# Agent handoff and independent review

Date: 2026-07-06
Reviewer: Claude Code (Fable), acting as the controlling agent for the PM

## What happened

Two AI coding agents built this repo from the same written plan. Claude Code executed
the first repo task, then became unavailable mid-build. Codex picked up the plan,
executed the Spec Kit workflow and the implementation, and left handoff notes flagging
every deviation for later review. Claude Code then returned and performed the review
recorded here before anything was published.

This was not planned. It turned out to be the strongest evidence in the repo for the
spec-driven thesis: when the spec, plan, and task list carry the intent, the
implementing agent is swappable mid-project without losing direction.

## How the review was done

Nothing in the handoff notes was taken on trust. Each claim was re-verified:

- Ran the unit suite: 16 tests across 5 files, all passing, output pristine.
- Ran the production build: all 3 routes prerender as static content, which also
  proves the no-server-dependency constraint holds.
- Ran the Playwright journey end to end: both scenarios pass, covering chain to
  iron condor to risk metrics to simulated order to order history to the analytics
  funnel.
- Audited every data-testid against the e2e contract and every analytics event
  against the tracking plan in docs/product/success-metrics.md: all 8 events fire
  with the specified properties.
- Checked the Black-Scholes tests against the published reference values the plan
  mandates (price 10.4506, delta 0.6368, gamma 0.0188, vega 0.3752, theta -0.0176
  for the standard S=100, K=100, T=1, r=5%, sigma=20% case).
- Read the constitution, spec, README, and process docs for accuracy and for the
  project's prose rules.

One environment issue surfaced during review: a stale .next directory from a dev run
broke the production build with a phantom type error. A clean rebuild fixed it. No
code change was needed.

## Deviations reviewed and accepted

1. Implementation APIs differ from the plan's illustrative signatures. Example:
   priceOption takes a named-parameter object instead of positional arguments, and
   payoff analysis returns an explicit 'Unlimited' union instead of Infinity.
   Accepted: behavior and reference values are identical, and both changes improve
   readability and JSON safety. The plan's code was a starting point, not a contract.
2. Implementation landed in two consolidated commits with task ID ranges instead of
   one commit per task. Accepted: the history still shows every spec artifact landing
   before application code, which is the property that matters. Rewriting history to
   simulate finer granularity would be dishonest.
3. The current Spec Kit release installs agent skills rather than slash commands, so
   the artifacts were produced by running Spec Kit's own scaffolding scripts and
   authoring content per its templates. Accepted: this is a faithful use of the
   current tooling, and the exact commands are recorded in the process notes.
4. The constitution was hand-authored from the seven approved principles instead of
   generated. Accepted after content review: all seven principles survive intact.
5. Synthetic underlyings and expirations differ cosmetically from the plan's examples.
   Accepted: the data remains deterministic and internally consistent, and all tests
   pass against it.

## Decisions made in this review

- The public story names both agents. Pretending a single agent built this would be
  easy and false. The README says "built by AI agents using GitHub Spec Kit, Claude
  Code, and Codex," and this document exists so the claim is auditable.
- The handoff is framed as evidence, not apology: the artifact chain (constitution,
  spec, plan, tasks) is what made a mid-build agent swap cheap.
