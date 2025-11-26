"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons";
import { usePrivySession } from "@/hooks/use-privy-session";
import useStore from "@/store/store";
import { copy } from "@/utils/copy";

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
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);
  const { accessToken } = usePrivySession();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionResponse["execution"] | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStatusRef = useRef<() => Promise<void>>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedWorkflowId = localStorage.getItem("tilepmoney_current_workflow_id");
    setWorkflowId(storedWorkflowId);
  }, []);

  const hasTerminalStatus = execution ? TERMINAL_STATUSES.includes(execution.status) : false;

  fetchStatusRef.current = async () => {
    if (!workflowId || !accessToken) {
      return;
    }

    try {
      setIsFetching(true);
      const response = await fetch(`/api/workflows/${workflowId}/status`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch execution status");
      }

      const payload = (await response.json()) as ExecutionResponse;
      setExecution(payload.execution ?? null);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Execution monitor error:", err);
      setError("Unable to fetch execution status");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!workflowId || !accessToken) {
      return;
    }

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

    if (!hasTerminalStatus) {
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
  }, [workflowId, hasTerminalStatus, accessToken]);

  const progress = useMemo(() => {
    if (!execution || nodes.length === 0) {
      return 0;
    }
    const completed = execution.executionLog.filter((entry) => entry.status === "complete").length;
    return Math.min(100, Math.round((completed / nodes.length) * 100));
  }, [execution, nodes.length]);

  const nodeStatuses = useMemo(() => {
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
      return {
        id: node.id,
        label: ((node.data as any)?.properties?.label as string) ?? node.type ?? "Node",
        type: node.type ?? "node",
        status,
      };
    });
  }, [execution?.executionLog, execution?.status, nodes]);

  const logEntries = execution?.executionLog ?? [];
  const transactions = logEntries.filter((entry) => entry.transactionHash);

  const statusLabel = execution ? getStatusLabel(execution.status) : "No runs yet";

  useEffect(() => {
    if (!execution || hasTerminalStatus) {
      setExecutionMonitorActive(false);
      return;
    }
    setExecutionMonitorActive(true);
    return () => setExecutionMonitorActive(false);
  }, [execution, hasTerminalStatus, setExecutionMonitorActive]);

  if (!execution || hasTerminalStatus || isReadOnlyMode) {
    return null;
  }

  return (
    <aside className="h-full flex flex-col bg-[var(--surface-panel,#f8fafc)] text-[var(--foreground-primary,#0f172a)] border-l border-[var(--border-subtle,rgba(15,23,42,0.07))] max-md:w-[calc(100%-24px)] max-md:right-3 max-md:left-3 max-md:bottom-3">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <strong>Execution Monitor</strong>
          <span className="text-xs text-slate-400">
            {workflowId
              ? `Workflow #${workflowId.slice(-6)}`
              : "Save workflow to enable monitoring"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {execution && (
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                getStatusClass(execution.status)
              )}
              data-testid="execution-status"
            >
              <Icon
                name={
                  execution.status === "running"
                    ? "Spinner"
                    : execution.status === "failed"
                      ? "XCircle"
                      : "CheckCircle"
                }
                size={14}
              />
              {statusLabel}
            </span>
          )}

          <button
            type="button"
            className="bg-transparent border-none text-inherit cursor-pointer p-1.5 rounded-lg inline-flex items-center justify-center transition-colors duration-100 hover:bg-slate-400/15"
            onClick={() => fetchStatusRef.current?.()}
            aria-label="Refresh execution status"
            disabled={!workflowId || isFetching}
          >
            <Icon name="ArrowsClockwise" size={16} />
          </button>

          <button
            type="button"
            className="bg-transparent border-none text-inherit cursor-pointer p-1.5 rounded-lg inline-flex items-center justify-center transition-colors duration-100 hover:bg-slate-400/15"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label="Toggle execution monitor"
          >
            <Icon
              name="ChevronDown"
              size={16}
              style={{ transform: isExpanded ? undefined : "rotate(180deg)" }}
            />
          </button>
        </div>
      </header>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {workflowId ? (
        <>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-400/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-inherit bg-gradient-to-r from-sky-400 to-indigo-400 transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 max-h-[320px] overflow-y-auto pr-1">
            <section className="border-t border-slate-400/20 pt-3">
              <h3 className="m-0 mb-2 text-xs tracking-wider uppercase text-slate-400">Nodes</h3>
              {nodeStatuses.length === 0 ? (
                <div className="text-[13px] text-[#cbd5f5] bg-[#0f172a]/35 rounded-xl p-3 border border-dashed border-slate-400/40">
                  Add nodes to the canvas to start execution.
                </div>
              ) : (
                <ul className="m-0 p-0 list-none grid gap-2">
                  {nodeStatuses.map((node) => (
                    <li
                      key={node.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f172a]/35 border border-slate-400/12"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name={
                            node.status === "complete"
                              ? "CheckCircle"
                              : node.status === "failed"
                                ? "XCircle"
                                : node.status === "processing"
                                  ? "Spinner"
                                  : "Clock"
                          }
                          size={16}
                        />
                        <div>
                          <div className="text-[13px] font-medium text-slate-50">{node.label}</div>
                          <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                            {node.type}
                          </div>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "text-[11px] px-2 py-0.5 rounded-full capitalize",
                          getStatusChipClass(node.status)
                        )}
                      >
                        {node.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="border-t border-slate-400/20 pt-3">
              <h3 className="m-0 mb-2 text-xs tracking-wider uppercase text-slate-400">
                Transaction log
              </h3>
              {transactions.length === 0 ? (
                <div className="text-[13px] text-[#cbd5f5] bg-[#0f172a]/35 rounded-xl p-3 border border-dashed border-slate-400/40">
                  No blockchain transactions recorded yet.
                </div>
              ) : (
                <ul className="m-0 p-0 list-none grid gap-2">
                  {transactions.map((entry) => (
                    <li
                      key={`${entry.nodeId}-${entry.timestamp}`}
                      className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl bg-[#0f172a]/35 border border-slate-400/12"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex flex-col gap-1 text-xs text-[#cbd5f5]">
                          <strong>{entry.nodeType}</strong>
                          <span className="text-slate-400 text-xs">
                            {new Date(entry.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span
                          className={clsx(
                            "text-[11px] px-2 py-0.5 rounded-full capitalize",
                            getStatusChipClass(entry.status)
                          )}
                        >
                          {entry.status}
                        </span>
                      </div>
                      {entry.transactionHash && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Icon name="Link2" size={14} />
                          <span>{shortenHash(entry.transactionHash)}</span>
                          <button
                            type="button"
                            className="bg-transparent border-none text-inherit cursor-pointer p-1.5 rounded-lg inline-flex items-center justify-center transition-colors duration-100 hover:bg-slate-400/15"
                            onClick={() => entry.transactionHash && copy(entry.transactionHash)}
                          >
                            <Icon name="Copy" size={14} />
                          </button>
                        </div>
                      )}
                      {entry.error && <span className="text-red-400 text-xs">{entry.error}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <footer className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>
              Last updated:{" "}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </span>
            {isFetching && <span>Syncing…</span>}
          </footer>
        </>
      ) : (
        <p className="text-[13px] text-[#cbd5f5] bg-[#0f172a]/35 rounded-xl p-3 border border-dashed border-slate-400/40">
          Save your workflow first to enable execution monitoring.
        </p>
      )}
    </aside>
  );
}

function getStatusLabel(status: ExecutionStatus): string {
  switch (status) {
    case "running":
      return "Running";
    case "running_waiting":
      return "Waiting";
    case "failed":
      return "Failed";
    case "finished":
      return "Finished";
    case "stopped":
      return "Stopped";
    default:
      return status;
  }
}

function getStatusClass(status: ExecutionStatus) {
  switch (status) {
    case "running":
      return "bg-blue-500/15 text-blue-400";
    case "running_waiting":
      return "bg-yellow-400/20 text-yellow-400";
    case "failed":
      return "bg-red-400/20 text-red-400";
    case "finished":
      return "bg-emerald-500/20 text-emerald-400";
    case "stopped":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-blue-500/15 text-blue-400";
  }
}
function getStatusChipClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-slate-400/20 text-[#cbd5f5]";
    case "processing":
      return "bg-blue-500/20 text-blue-400";
    case "complete":
      return "bg-emerald-500/25 text-emerald-400";
    case "failed":
      return "bg-red-400/25 text-red-400";
    default:
      return "bg-slate-400/20 text-[#cbd5f5]";
  }
}

function shortenHash(hash: string) {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
