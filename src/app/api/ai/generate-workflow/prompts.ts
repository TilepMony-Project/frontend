// Helper to format property information for prompt
function formatPropertyInfo(properties: Record<string, any>): string {
  return Object.entries(properties)
    .map(([key, info]) => {
      let propDesc = `    - ${key} (${info.type})`;

      if (info.options) {
        propDesc += `\n      Options: ${info.optionLabels?.join(", ") || info.options.join(", ")}`;
      }

      if (info.minimum !== undefined || info.maximum !== undefined) {
        const range = [];
        if (info.minimum !== undefined) range.push(`min: ${info.minimum}`);
        if (info.maximum !== undefined) range.push(`max: ${info.maximum}`);
        propDesc += `\n      Range: ${range.join(", ")}`;
      }

      if (info.pattern) {
        propDesc += `\n      Pattern: ${info.pattern}`;
      }

      if (info.readOnly) {
        propDesc += "\n      (read-only - can be omitted or set to null)";
      }

      if (info.placeholder) {
        propDesc += `\n      Placeholder: ${info.placeholder}`;
      }

      return propDesc;
    })
    .join("\n");
}

// Rules section
const RULES = `Rules:
1. All workflows must start with a Deposit node (fiat entry point)
2. Fiat-to-fiat flows must go: Deposit → Mint → [Processing] → Redeem
3. Token compatibility: USD→mUSDT, IDR→IDRX
4. Always include ALL required fields for each node type (see Required Fields above)
5. Use property names exactly as specified in Available Properties
6. For Select fields, use the exact option values (not labels)
7. For wallet addresses, use valid Ethereum addresses (0x followed by 40 hex characters)
8. Read-only fields can be omitted or set to null
9. Generate logical node positions (x increases left-to-right by 320px, y for parallel branches)
10. Always include proper edge connections
11. Include label and description properties for all nodes`;

// Example section
const EXAMPLE = `Example:
Prompt: "Deposit 10,000 USD, mint to stablecoin, deposit to Aave yield, wait 7 days, then withdraw"
Response: {
  workflowName: "USD Yield Farming with Wait",
  workflowDescription: "Deposit USD, mint mUSDT, earn yield on Aave for 7 days, then withdraw",
  nodes: [
    { 
      id: "deposit-1", 
      type: "deposit", 
      label: "Deposit USD",
      properties: { 
        label: "Deposit USD",
        amount: 10000, 
        currency: "USD",
        paymentGateway: "DummyGatewayA",
        description: "Receive 10,000 USD funding"
      },
      position: { x: 0, y: 0 }
    },
    { 
      id: "mint-1", 
      type: "mint", 
      label: "Mint mUSDT",
      properties: { 
        label: "Mint mUSDT",
        amount: 10000, 
        issuer: "DummyIssuerA",
        receivingWallet: "0x1111111111111111111111111111111111111111",
        exchangeRate: null,
        description: "Convert USD to mUSDT stablecoin"
      },
      position: { x: 320, y: 0 }
    },
    { 
      id: "yield-deposit-1", 
      type: "yield-deposit", 
      label: "Deposit to Aave",
      properties: { 
        label: "Deposit to Aave",
        amount: 10000, 
        token: "mUSDT",
        yieldAdapter: "AaveAdapter",
        description: "Deposit mUSDT to Aave Protocol"
      },
      position: { x: 640, y: 0 }
    },
    { 
      id: "wait-1", 
      type: "wait", 
      label: "Wait 7 Days",
      properties: { 
        label: "Wait 7 Days",
        delayDuration: 7, 
        timeUnit: "days",
        reason: "Yield farming period",
        description: "Wait for 7 days"
      },
      position: { x: 960, y: 0 }
    },
    { 
      id: "yield-withdraw-1", 
      type: "yield-withdraw", 
      label: "Withdraw from Aave",
      properties: { 
        label: "Withdraw from Aave",
        amount: 10000, 
        yieldAdapter: "AaveAdapter",
        description: "Withdraw principal + yield from Aave"
      },
      position: { x: 1280, y: 0 }
    }
  ],
  edges: [
    { id: "edge-1", source: "deposit-1", target: "mint-1" },
    { id: "edge-2", source: "mint-1", target: "yield-deposit-1" },
    { id: "edge-3", source: "yield-deposit-1", target: "wait-1" },
    { id: "edge-4", source: "wait-1", target: "yield-withdraw-1" }
  ]
}`;

/**
 * Generates the system prompt for workflow generation
 * @param nodeRegistry - The node registry with property information
 * @returns The formatted system prompt string
 */
export function generateSystemPrompt(
  nodeRegistry: Record<
    string,
    {
      description: string;
      inputs: string[];
      outputs: string[];
      requiredFields: string[];
      properties: Record<string, any>;
    }
  >
): string {
  const nodeTypesSection = Object.entries(nodeRegistry)
    .map(
      ([type, info]) =>
        `- ${type.toUpperCase()}: ${info.description}\n  Inputs: ${info.inputs?.join(", ") || "None"}\n  Outputs: ${info.outputs?.join(", ") || "None"}\n  Required Fields: ${info.requiredFields.join(", ")}\n  Available Properties:\n${formatPropertyInfo(info.properties)}`
    )
    .join("\n\n");

  return `You are a TilepMoney workflow generator. You convert natural language descriptions into stablecoin workflow configurations.

Available Node Types:
${nodeTypesSection}

${RULES}

${EXAMPLE}`;
}
