import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { initMock, trackMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock('@amplitude/analytics-browser', () => ({
  init: initMock,
  track: trackMock,
}));

import { resetAmplitudeStateForTests, sendToAmplitude } from '@/lib/analytics/amplitude';

const ORIGINAL_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

describe('sendToAmplitude', () => {
  beforeEach(() => {
    resetAmplitudeStateForTests();
    initMock.mockReset();
    trackMock.mockReset();
    initMock.mockReturnValue({ promise: Promise.resolve() });
    trackMock.mockReturnValue({ promise: Promise.resolve({ event: {}, code: 200, message: 'ok' }) });
  });

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) {
      delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    } else {
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = ORIGINAL_KEY;
    }
  });

  it('is a no-op that never calls init or track when the key is absent', async () => {
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    await expect(sendToAmplitude('chain_viewed', {})).resolves.toBeUndefined();

    expect(initMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
  });

  it('initializes exactly once across multiple calls when the key is present, with autocapture disabled', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'test-key';

    await sendToAmplitude('chain_viewed', {});
    await sendToAmplitude('template_selected', { template: 'iron_condor' });

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith('test-key', undefined, { autocapture: false });
  });

  it('passes the exact event name and properties through to track, unchanged', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'test-key';
    const properties = { underlying: 'AURA', count: 3 };

    await sendToAmplitude('chain_viewed', properties);

    expect(trackMock).toHaveBeenCalledWith('chain_viewed', properties);
  });

  it('resolves without an unhandled rejection when track returns a rejecting promise', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'test-key';
    trackMock.mockReturnValue({ promise: Promise.reject(new Error('network')) });

    await expect(sendToAmplitude('chain_viewed', {})).resolves.toBeUndefined();
  });

  it('resolves without an unhandled rejection when init returns a rejecting promise', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'test-key';
    initMock.mockReturnValue({ promise: Promise.reject(new Error('network')) });

    await expect(sendToAmplitude('chain_viewed', {})).resolves.toBeUndefined();
    expect(trackMock).toHaveBeenCalledWith('chain_viewed', {});
  });

  it('resolves without throwing when track throws synchronously', async () => {
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = 'test-key';
    trackMock.mockImplementation(() => {
      throw new Error('sync failure');
    });

    await expect(sendToAmplitude('chain_viewed', {})).resolves.toBeUndefined();
  });
});
