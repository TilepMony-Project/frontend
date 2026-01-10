// Auto-start background polling when this module is imported
// This runs automatically when Next.js server starts

import { pollForWorkflowEvents, processAllPendingWorkflows, getPendingWorkflows } from "./service";
import { BRIDGE_EXECUTOR_CONFIG } from "./config";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

const POLL_INTERVAL_MS = 10000; // Poll every 10 seconds

async function pollAndExecute() {
  if (isRunning) return; // Prevent concurrent runs
  isRunning = true;

  const timestamp = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[BridgeExecutor Worker] 🔄 Polling cycle started at ${timestamp}`);
  console.log(`${"=".repeat(60)}`);

  try {
    const chainIds = Object.keys(BRIDGE_EXECUTOR_CONFIG.chains).map(Number);
    console.log(`[BridgeExecutor Worker] Chains to poll: ${chainIds.join(", ")}`);

    // Poll all chains
    for (const chainId of chainIds) {
      try {
        console.log(`[BridgeExecutor Worker] 📡 Polling chain ${chainId}...`);
        const events = await pollForWorkflowEvents(chainId);
        console.log(
          `[BridgeExecutor Worker] ✅ Chain ${chainId}: Found ${events.length} new events`
        );
      } catch (error) {
        console.error(`[BridgeExecutor Worker] ❌ Poll error on chain ${chainId}:`, error);
      }
    }

    // Auto-execute if enabled
    const pending = getPendingWorkflows();
    console.log(`[BridgeExecutor Worker] 📋 Pending workflows: ${pending.length}`);

    if (pending.length > 0) {
      if (process.env.AUTO_EXECUTE_WORKFLOWS === "true") {
        console.log(
          `[BridgeExecutor Worker] ⚡ Auto-executing ${pending.length} pending workflows...`
        );
        const result = await processAllPendingWorkflows();
        console.log(
          `[BridgeExecutor Worker] ✅ Executed: ${result.succeeded} succeeded, ${result.failed} failed`
        );
      } else {
        console.log(`[BridgeExecutor Worker] ⏸️ AUTO_EXECUTE_WORKFLOWS=false, skipping execution`);
      }
    }
  } catch (error) {
    console.error("[BridgeExecutor Worker] ❌ Error:", error);
  } finally {
    isRunning = false;
    console.log(
      `[BridgeExecutor Worker] 🏁 Polling cycle completed. Next poll in ${POLL_INTERVAL_MS / 1000}s`
    );
  }
}

export function startWorker() {
  if (intervalId) {
    console.log("[BridgeExecutor Worker] Already running");
    return;
  }

  // Check if private key is configured
  if (!process.env.BRIDGE_EXECUTOR_PRIVATE_KEY) {
    console.warn("[BridgeExecutor Worker] BRIDGE_EXECUTOR_PRIVATE_KEY not set, worker disabled");
    return;
  }

  console.log("[BridgeExecutor Worker] Starting background polling...");

  // Initial poll
  pollAndExecute();

  // Start interval
  intervalId = setInterval(pollAndExecute, POLL_INTERVAL_MS);
}

export function stopWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[BridgeExecutor Worker] Stopped");
  }
}

// Auto-start when module is loaded (only in production or when explicitly enabled)
if (process.env.ENABLE_BRIDGE_EXECUTOR_WORKER === "true") {
  startWorker();
}
