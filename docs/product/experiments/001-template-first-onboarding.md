# Experiment memo: template-first onboarding

Status: decision memo on seeded data (no live experiment platform in this repo)
Date: 2026-07-07
Owner: PM

## Why this memo exists

The role this repo targets expects business-impact thinking backed by metrics, not
just shipped features. This memo shows the format: hypothesis, design, guardrails,
decision, in the shape a real experiment readout would take. The data behind it is the
seeded demo dataset (lib/analytics/seed.ts, 120 sessions), not live production traffic,
so the "decision" here is a worked example, not a real ship/kill call. That distinction
is stated once here and should be assumed throughout, not re-argued per section.

## The signal

Computing the funnel from the current seed dataset (mulberry32 seed 20260706, 120
sessions):

| Stage | Sessions | % of prior stage | % of chain_viewed |
| --- | --- | --- | --- |
| chain_viewed | 120 | - | 100% |
| strategy built (template_selected or leg_edited) | 75 | 62.5% | 62.5% |
| strategy_analyzed | 49 | 65.3% | 40.8% |
| order_placed | 27 | 55.1% | 22.5% |

The largest single drop, in percentage points, is between viewing a chain and building
a strategy (37.5 points). That is also the step with the least product support today:
a trader who opens a chain is shown 21 strikes and 9 template buttons with no
recommendation, so the jump from "I see data" to "I did something with it" depends
entirely on the trader already knowing what they want to build.

## Hypothesis

If the builder page shows one recommended template pre-selected for the chosen
underlying's implied volatility regime (income template for low-IV names, defined-risk
spread for high-IV names) instead of an unselected template grid, then more sessions
will reach `strategy built`, because the highest-friction step is choosing where to
start, not the templates themselves.

## Design (as it would run on a real platform)

- **Unit of randomization:** session (sessionId already exists in the event schema).
- **Control:** current builder page, no template pre-selected.
- **Variant:** builder page opens with a recommended template applied and a visible
  "Recommended for AURA's volatility" label the trader can dismiss or swap.
- **Primary metric:** session reaches `strategy built` (proportion of `chain_viewed`
  sessions with a `template_selected` or `leg_edited` event). Current baseline 62.5%.
- **Guardrail metrics:**
  - `strategy_analyzed` rate should not drop (a pre-filled template that traders
    ignore or immediately abandon would inflate the primary metric without adding
    real value).
  - `order_placed` rate should not drop; a bad recommendation that steers traders into
    a mismatched strategy is worse than no recommendation.
  - Template diversity in `template_selected` should not collapse to just the
    recommended template; if it does, the variant is anchoring choice rather than
    reducing friction.
- **Minimum detectable effect:** targeting a 10-point lift (62.5% to 72.5%) at 80%
  power and a 5% significance level needs roughly 300 sessions per arm using a
  two-proportion test. At the seed dataset's current volume this is a multi-week
  collection window on a real platform, which is itself a useful planning number.

## Decision (worked example)

**Ship, with the guardrails as hard stop conditions, not soft ones.** The reasoning:
the recommendation is reversible per session (dismiss and swap), the risk is bounded
(worst case is the same friction as today plus one ignorable label), and the guardrail
on template diversity gives a cheap kill signal if the recommendation logic is bad
without waiting for the primary metric to fully resolve.

## What would make this a real memo instead of a worked example

Real production traffic through an experiment platform (Amplitude experiments or
equivalent, see docs/product/roadmap.md's analytics-destination item), a pre-registered
analysis plan filed before data collection instead of after, and a second reviewer
who did not write the hypothesis checking the guardrail logic for gaming, the same
review discipline this repo already applies to specs and code.
