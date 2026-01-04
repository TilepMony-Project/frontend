/**
 * Next.js Instrumentation
 * This file runs when the Next.js server starts up (once per server boot).
 * Used to auto-start the Bridge Executor Worker for polling workflow events.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side (not edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('\n🚀 [Instrumentation] Next.js server starting...');

    // Check if bridge executor worker should be enabled
    if (process.env.ENABLE_BRIDGE_EXECUTOR_WORKER === 'true') {
      console.log('🔧 [Instrumentation] Starting Bridge Executor Worker...');

      // Dynamic import to avoid issues with Edge runtime
      const { startWorker } = await import('./app/api/bridge-executor/worker');
      startWorker();

      console.log('✅ [Instrumentation] Bridge Executor Worker started!');
    } else {
      console.log('⏸️ [Instrumentation] Bridge Executor Worker disabled (ENABLE_BRIDGE_EXECUTOR_WORKER != true)');
    }
  }
}
