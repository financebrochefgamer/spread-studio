// Optional Amplitude destination. Every exported function is a no-op unless
// NEXT_PUBLIC_AMPLITUDE_API_KEY is set. This module has no window/DOM dependency
// (spec 005 FR-003): it takes everything it needs as arguments so it stays
// testable under a plain Node environment. The existing hasWindow() guard in
// lib/analytics/store.ts's track() already prevents this module from ever running
// during server-side rendering, so it has no reason to depend on window itself.

let initialized = false;

function getApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  return key && key.length > 0 ? key : undefined;
}

export function resetAmplitudeStateForTests(): void {
  initialized = false;
}

// Fire-and-forget by construction, not by omission: every step that can fail
// (the dynamic import, init, and track) is wrapped in try/catch for synchronous
// throws, and a no-op .catch() is attached to every promise this function
// produces or receives, so nothing is ever left unhandled.
export async function sendToAmplitude(eventName: string, properties: Record<string, unknown>): Promise<void> {
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
    // Best-effort: the SDK import, init, or track threw synchronously. Never propagate.
  }
}
