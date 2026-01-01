import { type AuthTokenClaims, PrivyClient } from "@privy-io/server-auth";

class PrivyUnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "PrivyUnauthorizedError";
  }
}

type AuthContext = {
  userId: string;
  sessionId: string;
  claims: AuthTokenClaims;
};

let cachedClient: PrivyClient | null = null;

function getPrivyClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error(
      "Missing Privy credentials. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET in your environment."
    );
  }

  cachedClient = new PrivyClient(appId, appSecret);
  return cachedClient;
}

function extractBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new PrivyUnauthorizedError("Missing Authorization header");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw new PrivyUnauthorizedError("Missing access token");
  }
  return token;
}

export async function requirePrivySession(request: Request): Promise<AuthContext> {
  const token = extractBearerToken(request);

  try {
    const claims = await getPrivyClient().verifyAuthToken(token);
    if (!claims?.userId) {
      throw new PrivyUnauthorizedError("Invalid access token");
    }

    return {
      userId: claims.userId,
      sessionId: claims.sessionId,
      claims,
    };
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      throw error;
    }

    console.error("Privy token verification failed", error);
    throw new PrivyUnauthorizedError("Invalid or expired Privy token");
  }
}

export { PrivyUnauthorizedError };
