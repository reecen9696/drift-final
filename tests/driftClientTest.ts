import {
  getReadOnlyWallet,
  createDriftClient,
  fetchSubaccounts,
  fetchSubaccountDetails,
  fetchSubaccountTokenBalances,
  formatPerpPositions,
  getSubaccountSummary,
} from "../src/lib/driftClient";
import fs from "fs";
import path from "path";

// 📂 Utility: Save JSON Output
function saveToJsonFile(filename: string, data: any) {
  const filePath = path.resolve(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved output to ${filename}`);
}

async function main() {
  const pubkey =
    process.env.NEXT_PUBLIC_DEFAULT_WALLET ||
    "G9cfF1jxgu6baweoc39oUBPZe3kbkzyDKMeCCrfXCZq8";

  const wallet = getReadOnlyWallet(pubkey);
  const driftClient = createDriftClient(wallet);

  try {
    // 🚀 Initialize Drift Client
    await driftClient.subscribe();
    console.log("📡 DriftClient subscribed successfully.");

    // 1️⃣ Fetch Subaccounts List
    const subaccounts = await fetchSubaccounts(driftClient, pubkey);
    saveToJsonFile("subaccounts.json", subaccounts);

    if (!subaccounts.length) {
      console.warn("⚠️ No subaccounts found for this wallet.");
      return;
    }

    // 5️⃣ Fetch Subaccount Summary
    try {
      const summary = await getSubaccountSummary(driftClient, pubkey);
      saveToJsonFile("subaccount_summary.json", summary);
    } catch (err: any) {
      console.error("❌ Failed to fetch subaccount summary:", err.message);
      saveToJsonFile("subaccount_summary_error.json", {
        error: err.message,
        stack: err.stack,
      });
    }

    // 🔄 Loop through each subaccount
    for (const account of subaccounts) {
      const subAccountId = account.subAccountId ?? 0;

      // 2️⃣ Fetch Subaccount Details
      let details = null;
      try {
        details = await fetchSubaccountDetails(driftClient, subAccountId);
        if (!details) {
          console.warn(`⚠️ No details found for subaccount ${subAccountId}`);
          continue;
        }
        saveToJsonFile(`subaccount_${subAccountId}_details.json`, details);
      } catch (err: any) {
        console.error(
          `❌ Failed to fetch details for subaccount ${subAccountId}:`,
          err.message
        );
        saveToJsonFile(`subaccount_${subAccountId}_error.json`, {
          error: err.message,
          stack: err.stack,
        });
        continue;
      }

      // 3️⃣ Save Formatted Perp Positions
      try {
        const formattedPerps = formatPerpPositions(
          driftClient,
          details.perpPositions
        );
        saveToJsonFile(
          `subaccount_${subAccountId}_perp_positions.json`,
          formattedPerps
        );
      } catch (err: any) {
        console.error(
          `❌ Failed to format perp positions for subaccount ${subAccountId}:`,
          err.message
        );
      }

      // 4️⃣ Fetch Token Balances
      try {
        const balances = await fetchSubaccountTokenBalances(
          driftClient,
          subAccountId
        );
        saveToJsonFile(`subaccount_${subAccountId}_balances.json`, balances);
      } catch (err: any) {
        console.error(
          `❌ Failed to fetch balances for subaccount ${subAccountId}:`,
          err.message
        );
        saveToJsonFile(`subaccount_${subAccountId}_balances_error.json`, {
          error: err.message,
          stack: err.stack,
        });
      }
    }
  } catch (err: any) {
    console.error(
      "🔥 Critical error during DriftClient operations:",
      err.message
    );
    saveToJsonFile("error_log.json", { error: err.message, stack: err.stack });
  } finally {
    try {
      await driftClient.unsubscribe();
      console.log("📴 DriftClient unsubscribed.");
    } catch (err) {
      console.warn("⚠️ Error while unsubscribing DriftClient.", err);
    }
  }
}

main();
