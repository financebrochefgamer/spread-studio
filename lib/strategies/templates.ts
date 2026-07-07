import type { ChainExpiration, Leg, OptionQuote, OptionType, TemplateId, Underlying } from '@/lib/types';

export const TEMPLATE_ORDER: TemplateId[] = [
  'long_call',
  'long_put',
  'covered_call',
  'cash_secured_put',
  'bull_call_spread',
  'bear_put_spread',
  'iron_condor',
  'long_straddle',
  'long_strangle',
];

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  long_call: 'Long Call',
  long_put: 'Long Put',
  covered_call: 'Covered Call',
  cash_secured_put: 'Cash-Secured Put',
  bull_call_spread: 'Bull Call Spread',
  bear_put_spread: 'Bear Put Spread',
  iron_condor: 'Iron Condor',
  long_straddle: 'Long Straddle',
  long_strangle: 'Long Strangle',
};

function legId(templateId: TemplateId, index: number): string {
  return `${templateId}-${index}`;
}

function quotes(expiration: ChainExpiration, type: OptionType): OptionQuote[] {
  return type === 'call' ? expiration.calls : expiration.puts;
}

function quoteAtOffset(expiration: ChainExpiration, type: OptionType, spot: number, offset: number): OptionQuote {
  const list = quotes(expiration, type);
  const atmIndex = list.reduce((bestIndex, quote, index) => {
    const best = list[bestIndex];
    return Math.abs(quote.strike - spot) < Math.abs(best.strike - spot) ? index : bestIndex;
  }, 0);
  const index = Math.max(0, Math.min(list.length - 1, atmIndex + offset));
  return list[index];
}

function optionLeg(templateId: TemplateId, index: number, side: 'buy' | 'sell', quote: OptionQuote): Leg {
  return {
    id: legId(templateId, index),
    instrument: quote.type,
    side,
    quantity: 1,
    strike: quote.strike,
    expiration: quote.expiration,
    quote,
  };
}

export function buildTemplate(templateId: TemplateId, underlying: Underlying, expiration: ChainExpiration): Leg[] {
  const callAtm = quoteAtOffset(expiration, 'call', underlying.spot, 0);
  const putAtm = quoteAtOffset(expiration, 'put', underlying.spot, 0);

  switch (templateId) {
    case 'long_call':
      return [optionLeg(templateId, 0, 'buy', callAtm)];
    case 'long_put':
      return [optionLeg(templateId, 0, 'buy', putAtm)];
    case 'covered_call':
      return [
        { id: legId(templateId, 0), instrument: 'stock', side: 'buy', quantity: 100, stockPrice: underlying.spot },
        optionLeg(templateId, 1, 'sell', quoteAtOffset(expiration, 'call', underlying.spot, 2)),
      ];
    case 'cash_secured_put':
      return [optionLeg(templateId, 0, 'sell', quoteAtOffset(expiration, 'put', underlying.spot, -2))];
    case 'bull_call_spread':
      return [
        optionLeg(templateId, 0, 'buy', callAtm),
        optionLeg(templateId, 1, 'sell', quoteAtOffset(expiration, 'call', underlying.spot, 2)),
      ];
    case 'bear_put_spread':
      return [
        optionLeg(templateId, 0, 'buy', putAtm),
        optionLeg(templateId, 1, 'sell', quoteAtOffset(expiration, 'put', underlying.spot, -2)),
      ];
    case 'iron_condor':
      return [
        optionLeg(templateId, 0, 'buy', quoteAtOffset(expiration, 'put', underlying.spot, -4)),
        optionLeg(templateId, 1, 'sell', quoteAtOffset(expiration, 'put', underlying.spot, -2)),
        optionLeg(templateId, 2, 'sell', quoteAtOffset(expiration, 'call', underlying.spot, 2)),
        optionLeg(templateId, 3, 'buy', quoteAtOffset(expiration, 'call', underlying.spot, 4)),
      ];
    case 'long_straddle':
      return [
        optionLeg(templateId, 0, 'buy', callAtm),
        optionLeg(templateId, 1, 'buy', putAtm),
      ];
    case 'long_strangle':
      return [
        optionLeg(templateId, 0, 'buy', quoteAtOffset(expiration, 'call', underlying.spot, 2)),
        optionLeg(templateId, 1, 'buy', quoteAtOffset(expiration, 'put', underlying.spot, -2)),
      ];
  }
}
