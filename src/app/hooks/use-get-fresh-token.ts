import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";

/**
 * Hook to get a fresh Privy access token
 * Automatically handles token refresh if the current token is expired
 */
export function useGetFreshToken() {
   const { getAccessToken } = usePrivy();

   const getFreshToken = useCallback(async (): Promise<string | null> => {
      try {
         const token = await getAccessToken();
         return token;
      } catch (error) {
         console.error("Failed to get fresh access token:", error);
         return null;
      }
   }, [getAccessToken]);

   return getFreshToken;
}
