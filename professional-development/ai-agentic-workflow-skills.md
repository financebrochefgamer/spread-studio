# AI and agentic workflow skills to build beyond this repo

Things the target role names that a solo portfolio repo cannot fully prove, because
they require either a tool this project has no access to, or a real team and
production stakes.

## Cowork (desktop automation)

Named explicitly in the posting alongside Claude Code and GitHub Spec Kit. This repo
has never used it, and should not fake having used it. What to actually do:

- Get hands-on with Cowork (or a comparable desktop-automation agent tool) on any real
  task, even outside this repo, to have a genuine, specific story instead of a
  paraphrase of documentation.
- Understand where desktop automation earns its keep versus terminal-based agentic
  coding (Claude Code) and versus browser automation (Playwright, already used
  extensively in this repo): Cowork's edge is operating existing GUI applications a
  CLI or browser driver cannot reach.
- docs/process/desktop-automation-playbook.md (in the product repo, not here) already
  specs the operating pattern generically; the gap is direct tool experience, not
  conceptual understanding.

## Spec review cadence at a real company

This repo's spec review sessions are genuine (three real review rounds on some specs,
with real bugs caught), but they are one PM-agent pair reviewing itself. The posting
asks for "actively participating in spec review sessions" and "sharing workflows and
learnings with the PM team" implying a multi-person cadence:

- How does spec review work when multiple PMs and engineers are in the room (or async
  thread), not just a PM and a reviewer agent?
- What does it look like to disagree with a spec review finding in a real
  organizational context, versus this repo's pattern of always accepting reviewer
  findings as long as they're technically sound?

## Prompt engineering and context construction, named explicitly

The posting calls out "comfort with prompt engineering, context construction, and
iterating on AI outputs" as a distinct, top-priority skill, not just "use Claude
daily." This repo demonstrates it constantly (every subagent dispatch is a context-
construction exercise, every re-review round is iterating on an AI output) but never
names or teaches the skill explicitly. Worth being able to articulate, in an
interview, the actual technique used repeatedly in this repo:

- Task briefs are handed to implementer agents as files, not pasted history, because
  a fresh agent's context should contain exactly what it needs and nothing it doesn't
  (accumulated prior-task summaries pollute judgment).
- Reviewer agents are given the spec and the diff, explicitly told not to trust the
  implementer's report, and instructed to trace claims by hand rather than accept a
  green test as proof. This is a context-construction choice, not an accident: what
  you exclude from an agent's context (the implementer's self-assessment) is often as
  important as what you include.
- Model tiering (implement on a faster/cheaper model, review on the most capable one)
  is itself a prompt-engineering-adjacent decision about where capability actually
  matters in a pipeline.

## Working with a real engineering team

This repo's "engineering" is entirely agent-executed. The posting expects direct
collaboration with human engineers who have their own judgment, deadlines, and
disagreements with a spec. What that adds beyond this repo's proof:

- Negotiating scope and priority with people who have competing constraints the spec
  itself does not capture (on-call load, other roadmap commitments, tech debt).
- Explaining a spec's intent verbally when the written spec alone does not resolve a
  real disagreement, and knowing when the spec itself needs to change versus when the
  conversation just needs to happen.
