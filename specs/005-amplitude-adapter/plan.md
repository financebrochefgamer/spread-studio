# Implementation Plan: Amplitude Adapter Behind an Env Flag

**Branch**: `005-amplitude-implementation` | **Spec**: specs/005-amplitude-adapter/spec.md | **Date**: 2026-07-07

## Summary

`lib/analytics/store.ts`'s `track()` calls a new module that, only when
`NEXT_PUBLIC_AMPLITUDE_API_KEY` is set, dynamically imports `@amplitude/analytics-browser`
and forwards the same event, fire-and-forget with no unhandled rejections possible.
Default (key unset, the only state the public demo and CI run in) is byte-for-byte
unchanged behavior.

## Verified SDK API (checked against official docs, not assumed)

`init()` and `track()` do NOT return plain Promises. They return an `AmplitudeReturn<T>`
wrapper object with a `.promise` property that is the actual awaitable/catchable
Promise:

```ts
import * as amplitude from '@amplitude/analytics-browser';

// init(apiKey, userId?, options?): AmplitudeReturn<void>
const initResult = amplitude.init(apiKey, undefined, { autocapture: false });
// initResult.promise is the Promise; initResult itself is not thenable

// track(eventName, properties?): AmplitudeReturn<Result>
const trackResult = amplitude.track(eventName, properties);
// trackResult.promise resolves to { event, code, message }
```

This matters directly for the spec's fire-and-forget requirement: `.catch(() => {})`
must be attached to `.promise`, not to the `AmplitudeReturn` object itself.
`AmplitudeReturn` is a plain object, not a thenable; calling `.catch()` directly on it
throws a TypeError synchronously (a bug, not a rejection-suppression). The correct
call is always `result.promise.catch(() => {})`.

## Module layout

- `lib/analytics/amplitude.ts` (new, pure per spec FR-003: no `window`/`hasWindow()`
  dependency, takes all values as arguments):
  ```ts
  let initialized = false;

  function getApiKey(): string | undefined {
    const key = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    return key && key.length > 0 ? key : undefined;
  }

  export function resetAmplitudeStateForTests(): void {
    initialized = false;
  }

  export async function sendToAmplitude(
    eventName: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    const apiKey = getApiKey();
    if (!apiKey) return;
    try {
      const amplitude = await import('@amplitude/analytics-browser');
      if (!initialized) {
        initialized = true;
        amplitude.init(apiKey, undefined, { autocapture: false }).promise.catch(() => {});
      }
      amplitude.track(eventName, properties).promise.catch(() => {});
    } catch {
      // Best-effort: SDK import, init, or track threw synchronously. Never propagate.
    }
  }
  ```
  Note: `sendToAmplitude` is itself `async` and its own returned promise must be
  caught at the call site (see `store.ts` below) for the same reason `.promise` needs
  `.catch()` — an `async` function that throws produces a rejected promise. The
  internal `try/catch` here already prevents most synchronous failures inside the
  function body from becoming a rejection, but the call site still guards defensively
  per the spec's "every promise it produces or receives" requirement.
- `lib/analytics/store.ts`: `track()` gains one line after its existing
  `writeLiveEvents(...)` call: `void sendToAmplitude(name, properties).catch(() => {});`
  using `void` to make the fire-and-forget intent explicit to readers and linters,
  plus the `.catch()` as the actual safety mechanism. No other change to `track()`;
  signature and return value untouched (spec FR-002).
- `package.json`: add `@amplitude/analytics-browser` (dependency), `jsdom` (devDependency).
- `vitest.config.ts`: no change needed for the Node-environment default; the one jsdom
  file uses a per-file `// @vitest-environment jsdom` directive, which Vitest honors
  without a global config change (confirmed: Vitest's per-file environment directive
  works independent of the `environment` key in config, since Vitest 0.x through 4.x).

## Constitution check

Default path (key unset) is byte-for-byte unchanged: same `track()` signature, same
localStorage behavior, same return value, zero new network calls, zero new imported
code (the dynamic `import()` line is never reached). Spec approved in PR #6 after
three review rounds before this plan.

## Tests

`tests/unit/amplitude.test.ts` (Node environment, default), mocking
`@amplitude/analytics-browser` with `vi.mock`:
1. Key absent (`process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY` deleted/undefined):
   `sendToAmplitude('chain_viewed', {})` resolves, and the mocked `init`/`track` are
   never called.
2. Key present: first call to `sendToAmplitude` calls mocked `init` exactly once with
   `(apiKey, undefined, { autocapture: false })`; a second call in the same test does
   NOT call `init` again (idempotent). Use `resetAmplitudeStateForTests()` in
   `beforeEach` so this test's idempotency assertion doesn't leak into other tests.
3. Key present: mocked `track` receives the exact event name and properties passed to
   `sendToAmplitude`.
4. Mocked `track` returns `{ promise: Promise.reject(new Error('network')) }`:
   `sendToAmplitude` still resolves (does not reject), and Vitest reports no
   unhandled rejection for the test run.
5. Mocked `track` throws synchronously: `sendToAmplitude` still resolves.

`tests/unit/store-amplitude.test.ts` (exact path required by vitest.config.ts's
`include` glob), `// @vitest-environment jsdom` at the top of the file, mocking
`lib/analytics/amplitude.ts` itself (not the Amplitude SDK) with `vi.mock`:
6. Calling `track('chain_viewed', { underlying: 'AURA' })` from `store.ts` calls the
   mocked `sendToAmplitude` with the same name and properties, AFTER localStorage
   already has the event (assert `readLiveEvents()` first, then assert the mock call).
7. Mocked `sendToAmplitude` rejecting does not change `track()`'s return value (still
   the `AnalyticsEvent`) and does not remove the already-written localStorage entry.

Manual/report evidence (not a unit test): run `npm run build` with
`NEXT_PUBLIC_AMPLITUDE_API_KEY` unset (the default) and grep the build output's
client bundle for `amplitude` (case-insensitive) to confirm it is absent, recorded in
the implementation report as the bundle-size claim's evidence (spec's split of the
two claims).

## Notes from spec review (must implement)

1. The fire-and-forget guarantee has two layers: `sendToAmplitude`'s internal
   try/catch plus `.promise.catch(() => {})` on both `init` and `track` results, AND
   the call site in `store.ts` catching `sendToAmplitude`'s own returned promise.
   Both layers are required; do not simplify to just one.
2. `EventName` (lib/types.ts / lib/analytics/events.ts) is a specific string union;
   `sendToAmplitude`'s `eventName: string` parameter is intentionally the wider type
   here since this module has no reason to import the app's event-name type (keeps it
   decoupled), but the call site in `store.ts` always passes a real `EventName`.
