"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import { Icon } from "@/components/icons";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useGetFreshToken } from "@/hooks/use-get-fresh-token";
import useStore from "@/store/store";
import { copy } from "@/utils/copy";
import { Loader2 } from "lucide-react";

type ExecutionStatus = "running" | "running_waiting" | "stopped" | "finished" | "failed" | "draft";

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
  };
};

const TERMINAL_STATUSES: ExecutionStatus[] = ["finished", "failed", "stopped"];

export function ExecutionMonitor() {
  const nodes = useStore((state) => state.nodes);
  const setExecutionMonitorActive = useStore((state) => state.setExecutionMonitorActive);
  const isPropertiesBarExpanded = useStore((state) => state.isPropertiesBarExpanded);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);
  const { accessToken } = usePrivySession();
  const getFreshToken = useGetFreshToken();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionResponse["execution"] | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasNoExecution, setHasNoExecution] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStatusRef = useRef<() => Promise<void>>(undefined);

  // Check if any node has local execution status
  const hasLocalExecution = useMemo(() => {
    return nodes.some((n) => n.data?.executionStatus && n.data.executionStatus !== "idle");
  }, [nodes]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedWorkflowId = localStorage.getItem("tilepmoney_current_workflow_id");
    setWorkflowId(storedWorkflowId);
  }, []);

  const hasTerminalStatus = execution ? TERMINAL_STATUSES.includes(execution.status) : false;

  fetchStatusRef.current = async () => {
    if (!workflowId) {
      return;
    }

    try {
      setIsFetching(true);
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

      // Handle 404 - no execution exists, stop polling
      if (response.status === 404) {
        setExecution(null);
        setHasNoExecution(true);
        setError(null);
        // Clear interval to stop polling
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
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Execution monitor error:", err);
      // Don't show error if we are just simulating locally
      if (!hasLocalExecution) {
        setError("Unable to fetch execution status");
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if ((!execution && !hasLocalExecution) || hasTerminalStatus) {
      setExecutionMonitorActive(false);
      return;
    }
    setExecutionMonitorActive(true);
    return () => setExecutionMonitorActive(false);
  }, [execution, hasLocalExecution, hasTerminalStatus, setExecutionMonitorActive]);

  useEffect(() => {
    if (!workflowId || !accessToken) {
      return;
    }

    // Reset hasNoExecution when workflowId changes
    setHasNoExecution(false);
    
    // Initial fetch
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

    // Only poll if:
    // 1. Execution doesn't have a terminal status
    // 2. We haven't confirmed there's no execution (hasNoExecution is false)
    // 3. We have local execution OR we have an execution OR we're waiting for one
    if (!hasTerminalStatus && !hasNoExecution && (hasLocalExecution || execution)) {
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
  }, [workflowId, hasTerminalStatus, accessToken, hasNoExecution, hasLocalExecution, execution]);

  const progress = useMemo(() => {
    // Priority to local simulation
    if (hasLocalExecution) {
      const completed = nodes.filter((n) => n.data?.executionStatus === "success").length;
      return Math.min(100, Math.round((completed / nodes.length) * 100));
    }

    if (!execution || nodes.length === 0) {
      return 0;
    }
    const completed = execution.executionLog.filter((entry) => entry.status === "complete").length;
    return Math.min(100, Math.round((completed / nodes.length) * 100));
  }, [execution, nodes, hasLocalExecution]);

  const nodeStatuses = useMemo(() => {
    // If local execution is active, use that
    if (hasLocalExecution) {
      return nodes.map((node) => {
        const status = (node.data?.executionStatus as string) || "pending";
        // Map local status to monitor status
        let monitorStatus = "pending";
        if (status === "running") monitorStatus = "processing";
        if (status === "success") monitorStatus = "complete";
        if (status === "error") monitorStatus = "failed";
        if (status === "idle") monitorStatus = "pending";

        const nodeLabel =
          typeof node.data?.properties?.label === "string"
            ? node.data.properties.label
            : undefined;

        return {
          id: node.id,
          label: nodeLabel ?? node.type ?? "Node",
          type: node.type ?? "node",
          status: monitorStatus,
        };
      });
    }

    const statusByNodeId = new Map<string, ExecutionLogEntry["status"]>();

    if (execution?.executionLog) {
      for (const entry of execution.executionLog) {
        statusByNodeId.set(entry.nodeId, entry.status);
      }
    }

    return nodes.map((node) => {
      const status =
        statusByNodeId.get(node.id) ??
        (execution?.status === "running" || execution?.status === "running_waiting"
          ? "pending"
          : "pending");
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
  }, [execution?.executionLog, execution?.status, nodes, hasLocalExecution]);

  const logEntries = execution?.executionLog ?? [];
  const transactions = logEntries.filter((entry) => entry.transactionHash);

  // Determine overall status
  const overallStatus = useMemo(() => {
    if (hasLocalExecution) {
      const isRunning = nodes.some((n) => n.data?.executionStatus === "running");
      const isFailed = nodes.some((n) => n.data?.executionStatus === "error");
      const isComplete = nodes.every((n) => n.data?.executionStatus === "success");
      
      if (isRunning) return "running";
      if (isFailed) return "failed";
      if (isComplete) return "finished";
      return "running"; // Default to running if started
    }
    return execution?.status || "draft";
  }, [hasLocalExecution, nodes, execution]);

  const statusLabel = getStatusLabel(overallStatus as ExecutionStatus);

  // Show if we have execution data OR local simulation is active
  const shouldShow = (!!execution || hasLocalExecution) && !isReadOnlyMode;

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
      <header 
        className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-[#242427]/50 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#2a2a2d]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            overallStatus === "running" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
            overallStatus === "finished" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
            overallStatus === "failed" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {overallStatus === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> :
             overallStatus === "finished" ? <Icon name="Check" size={16} /> :
             overallStatus === "failed" ? <Icon name="X" size={16} /> :
             <Icon name="Activity" size={16} />}
          </div>
          
          <div className="flex flex-col">
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
            className={cn("text-gray-400 transition-transform duration-200", !isExpanded && "rotate-180")}
          />
        </div>
      </header>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Execution Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  overallStatus === "failed" ? "bg-red-500" : 
                  overallStatus === "finished" ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Nodes List */}
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
                  
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded capitalize",
                    node.status === "processing" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                    node.status === "complete" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                    node.status === "failed" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions (Only show if real execution) */}
          {!hasLocalExecution && transactions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
               {/* ... existing transaction log code ... */}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function getStatusLabel(status: ExecutionStatus): string {
  switch (status) {
    case "running":
      return "Running...";
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

function getStatusClass(status: ExecutionStatus) {
  // ... existing helper if needed, but we used inline classes
  return "";
}
function getStatusChipClass(status: string) {
  // ... existing helper if needed
  return "";
}
function shortenHash(hash: string) {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
