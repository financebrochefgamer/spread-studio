# PM craft to build beyond a portfolio repo

Fundamentals the posting names that require a real product, team, and market to fully
practice. A solo repo can demonstrate the shape of the skill; it cannot demonstrate the
skill under real constraints.

## Customer discovery at scale

docs/product/discovery-brief.md is explicitly synthetic personas, honestly labeled.
The real skill gap:

- Running actual structured interviews with real users, not synthesizing plausible
  personas from public community research.
- Recruiting a genuinely representative sample (the posting specifically says "VIP
  active traders," meaning a narrow, high-value, hard-to-access segment) rather than
  whoever is easiest to reach.
- The synthesis method this repo already documents (raw notes to jobs/pains/
  constraints to requirements to acceptance criteria) is sound and reusable; what is
  missing is real, messy input to run it on.

## Competitive and industry intelligence

Not addressed anywhere in this repo yet. The posting: "Evaluate industry and
competitive developments in FinTech, AI tooling, and the active trader space —
proactively flag shifts that affect the roadmap." Practice:

- Build the habit of a recurring (weekly or biweekly) scan, not a one-time competitive
  matrix that goes stale immediately.
- Practice the harder skill explicitly: not "what features does competitor X have"
  but "what workflow does X optimize for, what user does it serve best, and would that
  actually change our roadmap." A feature checklist is not competitive intelligence.

## KPI definition and business impact, under real numbers

docs/product/experiments/001-template-first-onboarding.md and any KPI tree in this
repo are built on synthetic seeded data with known, controlled probabilities. Real KPI
work is harder in ways synthetic data cannot teach:

- Real funnels have messy, non-stationary baselines (seasonality, marketing campaigns,
  product changes all shift the numbers simultaneously); attributing a change to one
  cause is genuinely hard.
- Real experiment power calculations run into real traffic constraints; the "we'd need
  345 sessions per arm" math in this repo's experiment memo is correct methodology,
  but real prioritization often means choosing a smaller, faster, noisier test over
  the statistically ideal one, and knowing when that tradeoff is acceptable.

## Go-to-market and launch coordination

Not addressed in this repo. The posting: "Manage product launches with tight
coordination between engineering, marketing, and CX." Practice:

- What a release brief actually needs to answer for a marketing and CX audience,
  distinct from what an engineering-facing spec answers.
- How documentation and communications get "generated efficiently using AI tooling"
  in practice: which parts of a launch packet are safe to draft with AI and which
  need a human's judgment on tone, timing, and audience before anything ships.

## Stakeholder communication under real disagreement

This repo's "stakeholder" is a reviewer agent that either approves or requests
changes with reasoning. Real stakeholder work includes people who disagree for
reasons that are not purely technical (risk tolerance, political capital, timing
pressure), and reconciling that with a spec-driven process where the written spec is
supposed to be the source of truth.
