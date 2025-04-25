export interface Balance {
  token: string;
  amount: number;
}

export interface PerpPosition {
  marketIndex: number;
  marketSymbol: string;
  oracle: string;
  baseAssetAmount: number;
  quoteEntryAmount: number;
  quoteBreakEvenAmount: number;
  settledPnl: number;
  openOrders: string;
  lpShares: string;
}

export interface AccountSummary {
  subAccountId: number;
  name: string;
  perpPositionsCount: number;
}
