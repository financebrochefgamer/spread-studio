// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendToAmplitudeMock } = vi.hoisted(() => ({
  sendToAmplitudeMock: vi.fn(),
}));

vi.mock('@/lib/analytics/amplitude', () => ({
  sendToAmplitude: sendToAmplitudeMock,
}));

import { readLiveEvents, track } from '@/lib/analytics/store';

describe('track() Amplitude integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    sendToAmplitudeMock.mockReset();
    sendToAmplitudeMock.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('writes to localStorage first, then calls the mocked sendToAmplitude with the same name and properties', () => {
    const properties = { underlying: 'AURA' };

    const event = track('chain_viewed', properties);

    const stored = readLiveEvents();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(event);

    expect(sendToAmplitudeMock).toHaveBeenCalledWith('chain_viewed', properties);
  });

  it('does not change track()\'s return value or remove the localStorage entry when sendToAmplitude rejects', () => {
    sendToAmplitudeMock.mockReturnValue(Promise.reject(new Error('amplitude down')));

    const event = track('chain_viewed', { underlying: 'AURA' });

    expect(event).not.toBeNull();
    expect(event?.name).toBe('chain_viewed');

    const stored = readLiveEvents();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(event);
  });
});
