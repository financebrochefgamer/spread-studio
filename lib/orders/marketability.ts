export function isMarketable(netMid: number, netLimitPrice: number): boolean {
  return netMid <= netLimitPrice;
}
