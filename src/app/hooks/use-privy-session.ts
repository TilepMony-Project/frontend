"use client";

import { type User, usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

type PrivySessionState = {
  accessToken: string | null;
  userId: string | null;
  user: User | null;
  ready: boolean;
  authenticated: boolean;
  isLoadingToken: boolean;
};

export function usePrivySession(): PrivySessionState {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateToken() {
      if (!ready || !authenticated) {
        setAccessToken(null);
        setIsLoadingToken(false);
        return;
      }

      try {
        setIsLoadingToken(true);
        const token = await getAccessToken();
        if (!cancelled) {
          setAccessToken(token ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch Privy access token", error);
        if (!cancelled) {
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingToken(false);
        }
      }
    }

    void hydrateToken();

    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, getAccessToken]);

  return {
    accessToken,
    userId: user?.id ?? null,
    user: user ?? null,
    ready,
    authenticated,
    isLoadingToken,
  };
}
