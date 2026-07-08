'use client';

import { useEffect, useMemo } from 'react';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { ChainTable } from '@/components/ChainTable';
import { ExpirationTabs } from '@/components/ExpirationTabs';
import { LegEditor } from '@/components/LegEditor';
import { Nav } from '@/components/Nav';
import { TemplatePicker } from '@/components/TemplatePicker';
import { UnderlyingPicker } from '@/components/UnderlyingPicker';
import { generateChain } from '@/lib/chains/generate';
import { EXPIRATIONS, UNDERLYINGS, getUnderlying } from '@/lib/market/constants';
import { useBuilder } from '@/lib/state/builder';
import { buildTemplate } from '@/lib/strategies/templates';
import { track } from '@/lib/analytics/store';
import { formatCurrency } from '@/lib/format';

export default function BuilderPage() {
  const underlyingSymbol = useBuilder((state) => state.underlyingSymbol);
  const expiration = useBuilder((state) => state.expiration);
  const legs = useBuilder((state) => state.legs);
  const templateId = useBuilder((state) => state.templateId);
  const setUnderlying = useBuilder((state) => state.setUnderlying);
  const setExpiration = useBuilder((state) => state.setExpiration);
  const setTemplate = useBuilder((state) => state.setTemplate);
  const addLeg = useBuilder((state) => state.addLeg);
  const updateLeg = useBuilder((state) => state.updateLeg);
  const removeLeg = useBuilder((state) => state.removeLeg);

  const chain = useMemo(() => generateChain(underlyingSymbol), [underlyingSymbol]);
  const chainExpiration = chain.expirations.find((item) => item.expiration.date === expiration) ?? chain.expirations[0];
  const underlying = getUnderlying(underlyingSymbol);

  useEffect(() => {
    track('page_view', { path: '/' });
    track('chain_viewed', { underlying: useBuilder.getState().underlyingSymbol });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold">Trade</h1>
                <div className="text-xs text-zinc-500">
                  {underlying.name} · {formatCurrency(underlying.spot)}
                </div>
              </div>
              <div className="num text-xs text-zinc-500">{chainExpiration.expiration.label}</div>
            </div>
            <UnderlyingPicker underlyings={UNDERLYINGS} selected={underlyingSymbol} onSelect={setUnderlying} />
            <ExpirationTabs expirations={EXPIRATIONS} selected={expiration} onSelect={setExpiration} />
            <ChainTable chainExpiration={chainExpiration} onAddLeg={addLeg} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">Templates</h2>
            <TemplatePicker
              selected={templateId}
              onSelect={(id) => setTemplate(id, buildTemplate(id, underlying, chainExpiration))}
            />
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">Legs</h2>
            <LegEditor legs={legs} onUpdate={updateLeg} onRemove={removeLeg} />
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">Analysis</h2>
            <AnalysisPanel underlyingSymbol={underlyingSymbol} expiration={expiration} legs={legs} templateId={templateId} />
          </section>
        </aside>
      </div>
    </main>
  );
}
