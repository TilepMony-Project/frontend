'use client';

import { config } from '@/lib/web3/config';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { setAutoFreeze } from 'immer';
import { StrictMode, useEffect, useState } from 'react';
import TagManager from 'react-gtm-module';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Disable immer's automatic object freezing because ReactFlow mutates objects under the hood
// and requires this to be turned off to function properly, especially when node size is updated
setAutoFreeze(false);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize GTM if GTM_ID is available
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (gtmId) {
      TagManager.initialize({
        gtmId,
      });
    }
  }, []);

  // Prevent hydration mismatch by only rendering Web3 providers on client
  if (!mounted) {
    return (
      <StrictMode>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </StrictMode>
    );
  }

  return (
    <StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ReactFlowProvider>{children}</ReactFlowProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}
