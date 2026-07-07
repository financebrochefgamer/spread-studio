'use client';

import { create } from 'zustand';
import type { Leg, Strategy, TemplateId } from '@/lib/types';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';
import { track } from '@/lib/analytics/store';

interface BuilderState {
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  templateId?: TemplateId;
  setUnderlying: (symbol: string) => void;
  setExpiration: (expiration: string) => void;
  setTemplate: (templateId: TemplateId | undefined, legs: Leg[]) => void;
  addLeg: (leg: Leg) => void;
  updateLeg: (id: string, patch: Partial<Leg>) => void;
  removeLeg: (id: string) => void;
  clearLegs: () => void;
  loadStrategy: (strategy: Strategy) => void;
}

export const useBuilder = create<BuilderState>((set, get) => ({
  underlyingSymbol: UNDERLYINGS[0].symbol,
  expiration: EXPIRATIONS[0].date,
  legs: [],
  templateId: undefined,
  setUnderlying: (symbol) => {
    set({ underlyingSymbol: symbol, legs: [], templateId: undefined });
    track('chain_viewed', { underlying: symbol });
  },
  setExpiration: (expiration) => {
    set({ expiration, legs: [], templateId: undefined });
  },
  setTemplate: (templateId, legs) => {
    set({ templateId, legs });
    if (templateId) {
      track('template_selected', { template: templateId, underlying: get().underlyingSymbol });
    }
  },
  addLeg: (leg) => {
    const legs = [...get().legs, leg];
    set({ legs, templateId: undefined });
    track('leg_edited', { action: 'add', legs: legs.length });
  },
  updateLeg: (id, patch) => {
    const legs = get().legs.map((leg) => (leg.id === id ? { ...leg, ...patch } : leg));
    set({ legs, templateId: undefined });
    track('leg_edited', { action: 'update', legs: legs.length });
  },
  removeLeg: (id) => {
    const legs = get().legs.filter((leg) => leg.id !== id);
    set({ legs, templateId: undefined });
    track('leg_edited', { action: 'remove', legs: legs.length });
  },
  clearLegs: () => {
    set({ legs: [], templateId: undefined });
  },
  loadStrategy: (strategy) => {
    set({
      underlyingSymbol: strategy.underlyingSymbol,
      expiration: strategy.expiration,
      legs: strategy.legs,
      templateId: strategy.templateId,
    });
  },
}));
