import { useState } from "react";
import { usePrivySession } from "@/hooks/use-privy-session";

export type ValidationResult = {
  valid: boolean;
  errors: { section: string; message: string }[];
  warnings: { section: string; message: string }[];
  checklist: { id: string; label: string; status: "pass" | "fail" | "warning"; details?: string }[];
};

export function useWorkflowValidation() {
  const { accessToken } = usePrivySession();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateWorkflow = async (workflowId: string) => {
    if (!accessToken) return null;
    
    setValidating(true);
    setResult(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const data = await response.json();
      setResult(data);
      setValidating(false);
      return data as ValidationResult;
    } catch (error) {
      console.error("Validation error:", error);
      setValidating(false);
      return null;
    }
  };

  return {
    validateWorkflow,
    validating,
    result,
  };
}
