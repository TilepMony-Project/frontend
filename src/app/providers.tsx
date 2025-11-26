"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { setAutoFreeze } from "immer";
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { PrivyUserSync } from "@/components/privy-user-sync";

// Disable immer's automatic object freezing because ReactFlow mutates objects under the hood
// and requires this to be turned off to function properly, especially when node size is updated
setAutoFreeze(false);

const queryClient = new QueryClient();
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const privyConfig: PrivyClientConfig = {
  loginMethods: ["wallet", "email"],
  appearance: {
    theme: "light",
    showWalletLoginFirst: true,
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: "all-users",
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize GTM if GTM_ID is available
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (gtmId) {
      TagManager.initialize({
        gtmId,
      });
    }
  }, []);

  if (!privyAppId) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID. Set it in your environment to enable Privy auth.");
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <ReactFlowProvider>
            <PrivyUserSync />
            {children}
          </ReactFlowProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
