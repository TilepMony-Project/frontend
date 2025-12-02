"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { setAutoFreeze } from "immer";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { PrivyUserSync } from "@/components/privy-user-sync";
import { ThemeProvider } from "@/hooks/use-theme";

// Disable immer's automatic object freezing because ReactFlow mutates objects under the hood
// and requires this to be turned off to function properly, especially when node size is updated
setAutoFreeze(false);

const queryClient = new QueryClient();
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const privyConfig: PrivyClientConfig = {
  loginMethods: ["wallet", "email"],
  appearance: {
    theme: "dark",
    showWalletLoginFirst: true,
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: "all-users",
    },
  },
};

const PrivyProviderNoSSR = dynamic(
  () => import("@privy-io/react-auth").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

const SmartWalletsProviderNoSSR = dynamic(
  () => import("@privy-io/react-auth/smart-wallets").then((mod) => mod.SmartWalletsProvider),
  { ssr: false }
);

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
    throw new Error(
      "Missing NEXT_PUBLIC_PRIVY_APP_ID. Set it in your environment to enable Privy auth."
    );
  }

  return (
    <PrivyProviderNoSSR appId={privyAppId} config={privyConfig}>
      <SmartWalletsProviderNoSSR>
        <QueryClientProvider client={queryClient}>
          <ReactFlowProvider>
            <ThemeProvider>
              <PrivyUserSync />
              {children}
            </ThemeProvider>
          </ReactFlowProvider>
        </QueryClientProvider>
      </SmartWalletsProviderNoSSR>
    </PrivyProviderNoSSR>
  );
}
