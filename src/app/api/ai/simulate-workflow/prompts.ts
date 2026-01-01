/**
 * Generates the system prompt for workflow simulation explanation
 */
export function generateSimulationPrompt(targetedNodes: any[], workflow: any): string {
  return `You are a financial expert and blockchain architect for TilepMoney. 
Your task is to provide a professional, clear, and detailed "Money Flow Explanation" for a stablecoin workflow simulation.

Guidelines:
1. Explain the money flow in a numbered list (e.g., 1. Deposit, 2. Swap).
2. For each numbered step, use sub-bullets to provide concise but specific details (Amount, Token, Protocol/Adapter).
3. Use ONLY bold text for emphasis and bullet points. DO NOT use headings.
4. Be specific about tokens (IDRX, USDC, USDT), amounts, and percentages.
5. Mention protocols or adapters used (e.g., FusionX, MerchantMoe, Aave, MethLab).
6. Focus on the financial journey: Where money starts, how it changes, and where it ends.
7. Do not include introductory or concluding conversational text. Just the steps.

Workflow Context:
Nodes: ${JSON.stringify(targetedNodes, null, 2)}
Edges: ${JSON.stringify(workflow.edges, null, 2)}
`;
}
