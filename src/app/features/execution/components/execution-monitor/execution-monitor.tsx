"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import { Icon } from "@/components/icons";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useGetFreshToken } from "@/hooks/use-get-fresh-token";
import useStore from "@/store/store";
import { Loader2, ExternalLink } from "lucide-react";
import { getExplorerTxUrl } from "@/config/chains";

type ExecutionStatus =
  | "running"
  | "running_waiting"
  | "stopped"
  | "finished"
  | "failed"
  | "draft"
  | "pending_signature";

type ExecutionLogEntry = {
  nodeId: string;
  nodeType: string;
  status: "pending" | "processing" | "complete" | "failed";
  timestamp: string;
  transactionHash?: string;
  error?: string;
};

type ExecutionResponse = {
  execution?: {
    _id: string;
    workflowId: string;
    status: ExecutionStatus;
    startedAt?: string;
    finishedAt?: string;
    currentNodeId?: string;
    executionLog: ExecutionLogEntry[];
    transactionHash?: string;
  };
};

const TERMINAL_STATUSES: ExecutionStatus[] = ["finished", "failed", "stopped"];

export function ExecutionMonitor() {
  const nodes = useStore((state) => state.nodes);
  const setExecutionMonitorActive = useStore(
    (state) => state.setExecutionMonitorActive
  );
  const lastExecutionRun = useStore((state) => state.lastExecutionRun);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);
  const { accessToken } = usePrivySession();
  const getFreshToken = useGetFreshToken();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [execution, setExecution] = useState<
    ExecutionResponse["execution"] | null
  >(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasNoExecution, setHasNoExecution] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStatusRef = useRef<() => Promise<void>>(undefined);
  const previousWorkflowIdRef = useRef<string | null>(null);

  // Sync workflowId from localStorage and listen for changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncWorkflowId = () => {
      const storedWorkflowId = localStorage.getItem(
        "tilepmoney_current_workflow_id"
      );
      setWorkflowId(storedWorkflowId);
    };

    syncWorkflowId();

    // Listen for storage events (cross-tab changes)
    window.addEventListener("storage", syncWorkflowId);

    // Poll for same-tab changes (localStorage doesn't fire events in the same tab)
    const pollInterval = setInterval(syncWorkflowId, 1000);

    return () => {
      window.removeEventListener("storage", syncWorkflowId);
      clearInterval(pollInterval);
    };
  }, []);

  // Reset execution state when workflowId changes
  useEffect(() => {
    if (workflowId !== previousWorkflowIdRef.current) {
      // Workflow changed, reset state
      setExecution(null);
      setHasNoExecution(false);
      previousWorkflowIdRef.current = workflowId;

      // Clear any existing polling interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [workflowId]);

  // Reset polling when a new execution starts
  useEffect(() => {
    if (lastExecutionRun) {
      setHasNoExecution(false);
      setExecution(null); // Clear stale execution data
      // Force immediate fetch and let the polling effect handle the interval
      fetchStatusRef.current?.();
    }
  }, [lastExecutionRun]);

  const hasTerminalStatus = execution
    ? TERMINAL_STATUSES.includes(execution.status)
    : false;

  fetchStatusRef.current = async () => {
    if (!workflowId) {
      return;
    }

    try {
      const freshToken = await getFreshToken();
      if (!freshToken) {
        throw new Error("Unable to get authentication token");
      }
      const response = await fetch(`/api/workflows/${workflowId}/status`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (response.status === 404) {
        setExecution(null);
        setHasNoExecution(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch execution status");
      }

      const payload = (await response.json()) as ExecutionResponse;
      setExecution(payload.execution ?? null);
      setHasNoExecution(false);
    } catch (err) {
      console.error("Execution monitor error:", err);
    }
  };

  useEffect(() => {
    if (!execution) {
      setExecutionMonitorActive(false);
      return;
    }
    setExecutionMonitorActive(true);
    return () => setExecutionMonitorActive(false);
  }, [execution, setExecutionMonitorActive]);

  useEffect(() => {
    if (!workflowId || !accessToken) {
      return;
    }
    setHasNoExecution(false);
    fetchStatusRef.current?.();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workflowId, accessToken]);

  useEffect(() => {
    if (!workflowId || !accessToken) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!hasTerminalStatus && !hasNoExecution && execution) {
      intervalRef.current = setInterval(() => {
        fetchStatusRef.current?.();
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workflowId, hasTerminalStatus, accessToken, hasNoExecution, execution]);

  const progress = useMemo(() => {
    if (!execution || nodes.length === 0) {
      return 0;
    }

    if (execution.status === "pending_signature") return 5;

    const completed = execution.executionLog.filter(
      (entry) => entry.status === "complete"
    ).length;

    const total = execution.executionLog.length || nodes.length;
    return Math.min(100, Math.round((completed / total) * 100));
  }, [execution, nodes]);

  const nodeStatuses = useMemo(() => {
    const statusByNodeId = new Map<string, ExecutionLogEntry["status"]>();

    if (execution?.executionLog) {
      for (const entry of execution.executionLog) {
        statusByNodeId.set(entry.nodeId, entry.status);
      }
    }

    // Prioritize nodes present in the execution log
    if (execution?.executionLog && execution.executionLog.length > 0) {
      return execution.executionLog.map((entry) => {
        const node = nodes.find((n) => n.id === entry.nodeId);
        const nodeLabel =
          typeof node?.data?.properties?.label === "string"
            ? node.data.properties.label
            : undefined;

        return {
          id: entry.nodeId,
          label: nodeLabel ?? entry.nodeType ?? "Node",
          type: entry.nodeType ?? "node",
          status: entry.status,
        };
      });
    }

    // Default to workspace nodes if no log entries yet
    return nodes.map((node) => {
      const status = statusByNodeId.get(node.id) ?? "pending";
      const nodeLabel =
        typeof node.data?.properties?.label === "string"
          ? node.data.properties.label
          : undefined;
      return {
        id: node.id,
        label: nodeLabel ?? node.type ?? "Node",
        type: node.type ?? "node",
        status,
      };
    });
  }, [execution?.executionLog, execution?.status, nodes]);

  const mainTxHash = execution?.transactionHash;
  const overallStatus = execution?.status || "draft";
  const statusLabel = getStatusLabel(overallStatus as ExecutionStatus);

  // Only show if we have an execution AND it belongs to the current workflow
  const isExecutionForCurrentWorkflow = execution?.workflowId === workflowId;
  const shouldShow =
    !!execution && !isReadOnlyMode && isExecutionForCurrentWorkflow;

  if (!shouldShow) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed bottom-4 right-4 z-40 flex flex-col bg-white dark:bg-[#1b1b1d] border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-80 max-h-[450px]" : "w-auto max-h-[60px]"
      )}
    >
      <header className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-[#242427]/50 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          className="flex items-center justify-between gap-3 w-full cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#2a2a2d]/50 transition-colors -m-3 p-3 rounded-t-xl"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? "Collapse execution monitor"
              : "Expand execution monitor"
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                overallStatus === "running" ||
                  overallStatus === "pending_signature"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : overallStatus === "finished"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : overallStatus === "failed"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {overallStatus === "running" ||
              overallStatus === "pending_signature" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : overallStatus === "finished" ? (
                <Icon name="Check" size={16} />
              ) : overallStatus === "failed" ? (
                <Icon name="X" size={16} />
              ) : (
                <Icon name="Activity" size={16} />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {statusLabel}
              </span>
              {isExpanded && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {progress}% completed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isExpanded && (
              <div className="flex items-center gap-2 mr-2">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <Icon
              name="ChevronDown"
              size={16}
              className={cn(
                "text-gray-400 transition-transform duration-200",
                !isExpanded && "rotate-180"
              )}
            />
          </div>
        </button>
      </header>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Execution Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  overallStatus === "failed"
                    ? "bg-red-500"
                    : overallStatus === "finished"
                    ? "bg-green-500"
                    : "bg-blue-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {mainTxHash &&
            (overallStatus === "finished" || overallStatus === "failed") && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    Transaction Hash
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                    {mainTxHash}
                  </span>
                </div>
                <a
                  href={getExplorerTxUrl(mainTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nodes Status
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {nodeStatuses.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#242427] border border-gray-100 dark:border-gray-800/50"
                >
                  <div className="flex items-center gap-2.5">
                    {node.status === "processing" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    ) : node.status === "complete" ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                    ) : node.status === "failed" ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                        <Icon name="X" size={10} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}

                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {node.label}
                      </span>
                      <span className="text-[10px] text-gray-400 capitalize">
                        {node.type}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded capitalize",
                      node.status === "processing"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : node.status === "complete"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : node.status === "failed"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function getStatusLabel(status: ExecutionStatus): string {
  switch (status) {
    case "running":
      return "Running...";
    case "pending_signature":
      return "Sign Transaction...";
    case "running_waiting":
      return "Waiting";
    case "failed":
      return "Execution Failed";
    case "finished":
      return "Completed";
    case "stopped":
      return "Stopped";
    default:
      return "Ready";
  }
}
