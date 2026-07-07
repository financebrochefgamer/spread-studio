export type OptionType = 'call' | 'put';
export type Side = 'buy' | 'sell';
export type Instrument = OptionType | 'stock';

export type TemplateId =
  | 'long_call'
  | 'long_put'
  | 'covered_call'
  | 'cash_secured_put'
  | 'bull_call_spread'
  | 'bear_put_spread'
  | 'iron_condor'
  | 'long_straddle'
  | 'long_strangle';

export type EventName =
  | 'page_view'
  | 'chain_viewed'
  | 'template_selected'
  | 'leg_edited'
  | 'strategy_analyzed'
  | 'order_ticket_opened'
  | 'order_placed'
  | 'strategy_saved'
  | 'scenario_adjusted'
  | 'position_closed'
  | 'working_order_placed'
  | 'working_order_canceled';

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface Underlying {
  symbol: string;
  name: string;
  spot: number;
  baseVolatility: number;
  skew: number;
  spreadBps: number;
  profile: string;
}

export interface Expiration {
  date: string;
  label: string;
  daysToExpiration: number;
}

export interface OptionQuote {
  underlyingSymbol: string;
  expiration: string;
  strike: number;
  type: OptionType;
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  greeks: Greeks;
}

export interface ChainExpiration {
  expiration: Expiration;
  calls: OptionQuote[];
  puts: OptionQuote[];
}

export interface OptionChain {
  underlying: Underlying;
  expirations: ChainExpiration[];
}

export interface Leg {
  id: string;
  instrument: Instrument;
  side: Side;
  quantity: number;
  strike?: number;
  expiration?: string;
  quote?: OptionQuote;
  stockPrice?: number;
}

export interface Strategy {
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  templateId?: TemplateId;
}

export interface PayoffPoint {
  underlyingPrice: number;
  profitLoss: number;
}

export interface AnalysisResult {
  payoff: PayoffPoint[];
  breakevens: number[];
  maxProfit: number | 'Unlimited';
  maxLoss: number | 'Unlimited';
  netPremium: number;
  greeks: Greeks;
  legGreeks: Array<{ legId: string; greeks: Greeks }>;
}

export interface Order {
  id: string;
  createdAt: string;
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  netPremium: number;
  timeInForce?: 'day' | 'gtc';
  orderType?: 'market' | 'limit';
}

export interface WorkingOrder {
  id: string;
  createdAt: string;
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  netLimitPrice: number;
  timeInForce: 'day' | 'gtc';
  status: 'working' | 'canceled';
}

export interface ClosedPosition {
  orderId: string;
  exitValue: number;
  realizedPl: number;
  closedAt: string;
}

export interface SavedStrategy {
  id: string;
  createdAt: string;
  name: string;
  strategy: Strategy;
}

export interface AnalyticsEvent {
  id: string;
  name: EventName;
  timestamp: string;
  sessionId: string;
  source: 'seed' | 'live';
  properties: Record<string, string | number | boolean | undefined>;
}
