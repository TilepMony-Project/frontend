import { useState } from "react";

export interface SimulationResult {
  success: boolean;
  gas?: number;
  actions?: number;
  error?: string;
  loading: boolean;
}

export function useSimulateWorkflow() {
  const [result, setResult] = useState<SimulationResult>({
    success: false,
    loading: false,
  });

  const simulateWorkflow = async (workflowId: string) => {
    try {
      setResult({ success: false, loading: true });

      const response = await fetch(`/api/workflows/${workflowId}/simulate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Simulation failed");
      }

      setResult({
        success: data.success,
        gas: data.gas,
        actions: data.actions,
        loading: false,
      });

      return data;
    } catch (error: any) {
      setResult({
        success: false,
        loading: false,
        error: error.message,
      });
    }
  };

  return {
    simulateWorkflow,
    ...result,
  };
}
