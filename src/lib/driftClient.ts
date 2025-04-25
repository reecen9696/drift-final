import { toast } from "react-hot-toast";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  DriftClient,
  SpotMarkets,
  PerpMarkets,
  getTokenAmount,
  convertToNumber,
  BASE_PRECISION,
  OrderType,
  PositionDirection,
  BN,
} from "@drift-labs/sdk";

type DriftEnv = "mainnet-beta" | "devnet";

const DRIFT_ENV: DriftEnv =
  (process.env.NEXT_PUBLIC_DRIFT_ENV as DriftEnv) || "mainnet-beta";
const RPC_URL = getRpcUrl(DRIFT_ENV);
const DEFAULT_READONLY_PUBKEY =
  process.env.NEXT_PUBLIC_DEFAULT_WALLET ||
  "G9cfF1jxgu6baweoc39oUBPZe3kbkzyDKMeCCrfXCZq8";

/** Get RPC URL */
function getRpcUrl(env: DriftEnv): string {
  return env === "devnet"
    ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_URL ||
        "https://api.devnet.solana.com"
    : process.env.NEXT_PUBLIC_SOLANA_MAINNET_URL ||
        "https://mainnet.helius-rpc.com/?api-key=870e9a8e-a891-4c6d-80fd-0073d3d45be0";
}

/** Create Read-Only Wallet */
export function getReadOnlyWallet(pubkey?: string) {
  const key = pubkey || DEFAULT_READONLY_PUBKEY;
  return {
    publicKey: new PublicKey(key),
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
}

/** Initialize Drift Client */
export function createDriftClient(wallet: any) {
  const connection = new Connection(RPC_URL, "confirmed");
  return new DriftClient({ connection, wallet, env: DRIFT_ENV });
}

/** Fetch Subaccounts */
export async function fetchSubaccounts(
  driftClient: DriftClient,
  authority: string
) {
  try {
    return await driftClient.getUserAccountsForAuthority(
      new PublicKey(authority)
    );
  } catch (err) {
    toast.error(`Failed to fetch subaccounts for ${authority}`);
    return [];
  }
}

/** Fetch Subaccount Details */
export async function fetchSubaccountDetails(
  driftClient: DriftClient,
  subAccountId: number
) {
  try {
    const user = await driftClient.getUser(subAccountId);
    return {
      spotPositions: Array.from({ length: 8 }, (_, i) =>
        user.getSpotPosition(i)
      ),
      perpPositions: Array.from({ length: 8 }, (_, i) =>
        user.getPerpPosition(i)
      ),
      openOrders:
        typeof user.getOpenOrders === "function" ? user.getOpenOrders() : [],
    };
  } catch (err) {
    toast.error(`Failed to fetch details for subaccount ${subAccountId}`);
    return null;
  }
}

/** Fetch Token Balances */
export async function fetchSubaccountTokenBalances(
  driftClient: DriftClient,
  subAccountId: number
) {
  try {
    const user = await driftClient.getUser(subAccountId);
    await user.fetchAccounts();

    return SpotMarkets[DRIFT_ENV].reduce((balances, spotConfig) => {
      const spotMarket = driftClient.getSpotMarketAccount(
        spotConfig.marketIndex
      );
      const spotPosition = user.getSpotPosition(spotConfig.marketIndex);

      if (spotMarket && spotPosition && !spotPosition.scaledBalance.isZero()) {
        const amount = getTokenAmount(
          spotPosition.scaledBalance,
          spotMarket,
          spotPosition.balanceType
        );
        balances.push({
          token: spotConfig.symbol,
          amount: convertToNumber(amount, spotConfig.precision),
        });
      }

      return balances;
    }, [] as { token: string; amount: number }[]);
  } catch (err) {
    toast.error(`Failed to fetch balances for subaccount ${subAccountId}`);
    return [];
  }
}

/** Format Perp Positions */
export function formatPerpPositions(
  driftClient: DriftClient,
  perpPositions: any[]
) {
  const marketCache = new Map<
    number,
    { symbol: string; oracle: string | null }
  >();

  return perpPositions
    .filter(
      (pos) =>
        pos &&
        pos.baseAssetAmount &&
        typeof pos.baseAssetAmount.isZero === "function" &&
        !pos.baseAssetAmount.isZero()
    )
    .map((pos) => {
      if (!marketCache.has(pos.marketIndex)) {
        const config = PerpMarkets[DRIFT_ENV].find(
          (m) => m.marketIndex === pos.marketIndex
        );
        marketCache.set(pos.marketIndex, {
          symbol: config?.symbol || `Market-${pos.marketIndex}`,
          oracle: config?.oracle?.toString() || "",
        });
      }

      const { symbol, oracle } = marketCache.get(pos.marketIndex)!;

      return {
        marketIndex: pos.marketIndex,
        marketSymbol: symbol,
        oracle: oracle ?? "",
        baseAssetAmount: pos.baseAssetAmount
          ? convertToNumber(pos.baseAssetAmount, BASE_PRECISION)
          : 0,
        quoteEntryAmount: pos.quoteEntryAmount
          ? convertToNumber(pos.quoteEntryAmount, BASE_PRECISION)
          : 0,
        quoteBreakEvenAmount: pos.quoteBreakEvenAmount
          ? convertToNumber(pos.quoteBreakEvenAmount, BASE_PRECISION)
          : 0,
        settledPnl: pos.settledPnl
          ? convertToNumber(pos.settledPnl, BASE_PRECISION)
          : 0,
        openOrders: pos.openOrders?.toString?.() ?? "0",
        lpShares: pos.lpShares?.toString?.() ?? "0",
      };
    });
}

/** Deposit to Spot Market */
export async function depositToSpot(
  driftClient: DriftClient,
  marketIndex: number,
  amountUi: number,
  subAccountId?: number,
  reduceOnly = false
) {
  try {
    console.log(
      "[depositToSpot] marketIndex:",
      marketIndex,
      "amountUi:",
      amountUi,
      "subAccountId:",
      subAccountId
    );
    const user = await driftClient.getUser(subAccountId ?? 0);
    const spotMarket = driftClient.getSpotMarketAccount(marketIndex);
    if (!spotMarket) throw new Error("Spot market not found");
    const decimals = spotMarket.decimals ?? 9;
    const amountLamports = Math.floor(amountUi * 10 ** decimals);
    console.log("[depositToSpot] amount (lamports):", amountLamports);
    const userPubkey = user.getUserAccountPublicKey();
    console.log("[depositToSpot] userPubkey:", userPubkey.toBase58());

    // Get the associated token account for this market
    const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(
      marketIndex
    );
    console.log(
      "[depositToSpot] associatedTokenAccount:",
      associatedTokenAccount.toBase58()
    );

    const amountBN = new BN(amountLamports.toString());
    console.log("[depositToSpot] amountBN:", amountBN.toString());
    await driftClient.deposit(amountBN, marketIndex, associatedTokenAccount);
    toast.success(`Deposited ${amountUi} to market ${marketIndex}`);
  } catch (err) {
    console.error("[depositToSpot] Error:", err);
    toast.error(`Deposit failed for market ${marketIndex}`);
  }
}

export async function withdrawFromSpot(
  driftClient: DriftClient,
  marketIndex: number,
  amountUi: number,
  subAccountId?: number,
  reduceOnly = false
) {
  try {
    console.log(
      "[withdrawFromSpot] marketIndex:",
      marketIndex,
      "amountUi:",
      amountUi,
      "subAccountId:",
      subAccountId
    );
    const user = await driftClient.getUser(subAccountId ?? 0);
    const spotMarket = driftClient.getSpotMarketAccount(marketIndex);
    if (!spotMarket) throw new Error("Spot market not found");
    const decimals = spotMarket.decimals ?? 9;
    const amountLamports = Math.floor(amountUi * 10 ** decimals);
    console.log("[withdrawFromSpot] amount (lamports):", amountLamports);

    // Get the associated token account for this market
    const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(
      marketIndex
    );
    console.log(
      "[withdrawFromSpot] associatedTokenAccount:",
      associatedTokenAccount.toBase58()
    );

    await driftClient.withdraw(
      new BN(amountLamports),
      marketIndex,
      associatedTokenAccount
    );
    toast.success(`Withdrew ${amountUi} from market ${marketIndex}`);
  } catch (err) {
    console.error("[withdrawFromSpot] Error:", err);
    toast.error(`Withdraw failed for market ${marketIndex}`);
  }
}

/** Open Perp Market Order */
export async function openPerpMarketOrder(
  driftClient: DriftClient,
  marketIndex: number,
  baseAssetAmountUi: number,
  direction: "long" | "short",
  subAccountId?: number
) {
  try {
    const orderParams = {
      orderType: OrderType.MARKET,
      marketIndex,
      direction:
        direction === "long" ? PositionDirection.LONG : PositionDirection.SHORT,
      baseAssetAmount: driftClient.convertToPerpPrecision(baseAssetAmountUi),
      subAccountId,
    };

    await driftClient.placePerpOrder(orderParams);
    toast.success(`Market ${direction} order placed on market ${marketIndex}`);
  } catch (err) {
    toast.error(`Failed to place market order on market ${marketIndex}`);
  }
}

/** Open Perp Limit Order */
export async function openPerpLimitOrder(
  driftClient: DriftClient,
  marketIndex: number,
  baseAssetAmountUi: number,
  priceUi: number,
  direction: "long" | "short",
  subAccountId?: number
) {
  try {
    const orderParams = {
      orderType: OrderType.LIMIT,
      marketIndex,
      direction:
        direction === "long" ? PositionDirection.LONG : PositionDirection.SHORT,
      baseAssetAmount: driftClient.convertToPerpPrecision(baseAssetAmountUi),
      price: driftClient.convertToPricePrecision(priceUi),
      subAccountId,
    };

    await driftClient.placePerpOrder(orderParams);
    toast.success(
      `Limit ${direction} order at $${priceUi} placed on market ${marketIndex}`
    );
  } catch (err) {
    toast.error(`Failed to place limit order on market ${marketIndex}`);
  }
}
/** Helper to decode subaccount name */
function decodeName(nameArray: number[] | Uint8Array): string {
  return String.fromCharCode(...nameArray).trim();
}

/** Get Subaccount Summary */
export async function getSubaccountSummary(
  driftClient: DriftClient,
  authority: string
) {
  const subaccounts = await driftClient.getUserAccountsForAuthority(
    new PublicKey(authority)
  );
  return subaccounts.map((account: any) => ({
    subAccountId: account.subAccountId,
    name: decodeName(account.name),
    perpPositionsCount: account.perpPositions.filter(
      (pos: any) => pos && !pos.baseAssetAmount.isZero()
    ).length,
  }));
}
