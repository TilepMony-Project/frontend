"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import clsx from "clsx";
import { useRouter } from "next/navigation";

import type { WorkflowSummary } from "@/actions/workflows";
import { Icon } from "@/components/icons";
import { IconSwitch } from "@/components/ui/icon-switch";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ToastType, showToast } from "@/utils/toast-utils";

type ViewMode = "grid" | "list";

type PendingAction = {
  type: "create" | "duplicate" | "delete" | null;
  workflowId?: string;
};

type Props = {
  initialWorkflows?: WorkflowSummary[];
};

type WorkflowApiPayload = {
  _id?: string | { toString(): string };
  id?: string;
  name?: string;
  description?: string;
  status?: WorkflowSummary["status"];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastExecutedAt?: string | Date | null;
  nodes?: unknown[];
  edges?: unknown[];
  nodesCount?: number;
  edgesCount?: number;
};

const STATUS_OPTIONS: Array<{ label: string; value: WorkflowSummary["status"] | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Running", value: "running" },
  { label: "Running (Waiting)", value: "running_waiting" },
  { label: "Stopped", value: "stopped" },
  { label: "Finished", value: "finished" },
  { label: "Failed", value: "failed" },
];

const STATUS_LABELS: Record<WorkflowSummary["status"], string> = {
  draft: "Draft",
  running: "Running",
  running_waiting: "Running (Waiting)",
  stopped: "Stopped",
  finished: "Finished",
  failed: "Failed",
};

const STATUS_STYLES: Record<WorkflowSummary["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  running: "bg-green-100 text-green-800",
  running_waiting: "bg-green-100 text-green-800",
  stopped: "bg-yellow-100 text-yellow-900",
  finished: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

function normalizeWorkflow(workflow: WorkflowApiPayload): WorkflowSummary {
  return {
    id: workflow._id?.toString?.() ?? workflow.id ?? "",
    name: workflow.name ?? "Untitled workflow",
    description: workflow.description ?? "",
    status: workflow.status ?? "draft",
    createdAt: workflow.createdAt
      ? new Date(workflow.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: workflow.updatedAt
      ? new Date(workflow.updatedAt).toISOString()
      : new Date().toISOString(),
    lastExecutedAt: workflow.lastExecutedAt
      ? new Date(workflow.lastExecutedAt).toISOString()
      : null,
    nodesCount: Array.isArray(workflow.nodes) ? workflow.nodes.length : (workflow.nodesCount ?? 0),
    edgesCount: Array.isArray(workflow.edges) ? workflow.edges.length : (workflow.edgesCount ?? 0),
  };
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not executed yet";
  }
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

export function WorkflowDashboard({ initialWorkflows }: Props) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>(initialWorkflows ?? []);
  const [isLoading, setIsLoading] = useState(!initialWorkflows);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowSummary["status"]>("all");
  const [pendingAction, setPendingAction] = useState<PendingAction>({ type: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const { theme, toggleTheme } = useTheme();

  // Function to fetch workflows from API
  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/workflows");

      if (!response.ok) {
        throw new Error("Failed to fetch workflows");
      }

      const { workflows: fetchedWorkflows } = await response.json();
      const normalized = fetchedWorkflows.map((workflow: WorkflowApiPayload) =>
        normalizeWorkflow(workflow)
      );
      setWorkflows(normalized);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      showToast({
        title: "Failed to load workflows",
        subtitle: error instanceof Error ? error.message : "Please try refreshing the page",
        variant: ToastType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch workflows client-side on mount if not provided
  useEffect(() => {
    if (initialWorkflows) {
      return; // Skip if initialWorkflows were provided (SSR)
    }

    void fetchWorkflows();
  }, [initialWorkflows, fetchWorkflows]);

  const filteredWorkflows = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return workflows.filter((workflow) => {
      const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
      const matchesSearch =
        lowerSearch.length === 0 ||
        workflow.name.toLowerCase().includes(lowerSearch) ||
        (workflow.description ?? "").toLowerCase().includes(lowerSearch);
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm, workflows]);

  function resetAction() {
    setPendingAction({ type: null });
  }

  function openCreateWorkflowModal() {
    setNewWorkflowName("");
    setIsCreateModalOpen(true);
  }

  function closeCreateWorkflowModal() {
    if (pendingAction.type === "create") {
      return;
    }
    setIsCreateModalOpen(false);
  }

  async function createWorkflow(nameOverride?: string) {
    try {
      setPendingAction({ type: "create" });
      const workflowName = nameOverride?.trim() ? nameOverride.trim() : "Untitled workflow";

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName,
          description: "Draft workflow created from dashboard",
          nodes: [],
          edges: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workflow");
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);

      setWorkflows((prev) => [normalized, ...prev]);
      showToast({ title: "Workflow created", variant: ToastType.SUCCESS });
      setIsCreateModalOpen(false);
      router.push(`/workspace/${normalized.id}`);
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to create workflow",
        subtitle: error instanceof Error ? error.message : "Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  function handleConfirmCreateWorkflow() {
    void createWorkflow(newWorkflowName);
  }

  async function handleDeleteWorkflow(workflowId: string) {
    const confirmed = window.confirm("Delete this workflow? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      setPendingAction({ type: "delete", workflowId });
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== workflowId));
      showToast({ title: "Workflow deleted", variant: ToastType.SUCCESS });
      // Refresh workflows to ensure consistency
      if (!initialWorkflows) {
        void fetchWorkflows();
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to delete workflow",
        subtitle: error instanceof Error ? error.message : "Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  async function handleDuplicateWorkflow(workflowId: string) {
    try {
      setPendingAction({ type: "duplicate", workflowId });
      const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate workflow");
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);
      setWorkflows((prev) => [normalized, ...prev]);
      showToast({
        title: "Workflow duplicated",
        variant: ToastType.SUCCESS,
      });
      // Refresh workflows to ensure consistency
      if (!initialWorkflows) {
        void fetchWorkflows();
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to duplicate workflow",
        subtitle: error instanceof Error ? error.message : "Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  function handleOpenWorkflow(workflowId: string) {
    setIsOpeningWorkflow(workflowId);
    // Small delay to show loading state before navigation
    setTimeout(() => {
      router.push(`/workspace/${workflowId}`);
    }, 100);
  }

  const [isOpeningWorkflow, setIsOpeningWorkflow] = useState<string | null>(null);
  const creating = pendingAction.type === "create";
  const mutatingWorkflowId = pendingAction.workflowId;

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6 bg-[#eeeff3] dark:bg-[#151516]">
      <section className="flex flex-wrap justify-between gap-4 items-center">
        <div className="titleGroup">
          <h1 className="m-0 text-3xl font-semibold text-gray-900 dark:text-white">
            Workflow Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
            Review, filter, and jump into any orchestration workspace.
          </p>
        </div>
        <IconSwitch
          checked={theme === "dark"}
          onChange={toggleTheme}
          icon={<Sun size={18} />}
          IconChecked={<Moon size={18} />}
          variant="secondary"
          className="h-12 w-12 bg-white dark:bg-[#27282b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#323336] shadow-sm p-0 flex items-center justify-center"
        />
      </section>

      <section className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#27282b] rounded-2xl p-4 shadow-sm">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white">
          <Icon name="Search" size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search workflows"
            onChange={(event) => setSearchTerm(event.target.value)}
            disabled={isLoading}
            className="border-none outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 focus:outline-none bg-transparent text-inherit w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              className="h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white px-4 min-w-[200px] flex items-center justify-between disabled:opacity-50"
            >
              {STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ??
                "All statuses"}
              <Icon name="ChevronDown" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
            >
              {STATUS_OPTIONS.map((status) => (
                <DropdownMenuRadioItem key={status.value} value={status.value}>
                  {status.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-12">
          <button
            className={clsx(
              "h-12 w-12 flex items-center justify-center border-none text-gray-600 dark:text-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              viewMode === "grid" && "bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white"
            )}
            type="button"
            onClick={() => setViewMode("grid")}
            disabled={isLoading}
            aria-label="Grid view"
          >
            <Icon name="LayoutGrid" size={18} />
          </button>
          <button
            className={clsx(
              "h-12 w-12 flex items-center justify-center border-none text-gray-600 dark:text-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              viewMode === "list" && "bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white"
            )}
            type="button"
            onClick={() => setViewMode("list")}
            disabled={isLoading}
            aria-label="List view"
          >
            <Icon name="List" size={18} />
          </button>
        </div>
      </section>

      <section className="flex justify-between items-center text-gray-600 dark:text-gray-400">
        <span>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" />
              Loading workflows...
            </span>
          ) : (
            `Showing ${filteredWorkflows.length} of ${workflows.length} workflows`
          )}
        </span>
        <Button
          className="min-w-[180px] px-6 py-3 text-base rounded-full"
          onClick={openCreateWorkflowModal}
          disabled={creating || isLoading}
          variant="default"
          size="lg"
        >
          {creating ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Icon name="Plus" size={18} />
              New workflow
            </>
          )}
        </Button>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#27282b] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="flex justify-between gap-3 items-start mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl py-8 px-2 text-center bg-white dark:bg-[#27282b] text-gray-600 dark:text-gray-400">
          <h3 className="m-0 mb-2 text-gray-900 dark:text-white text-lg font-semibold">
            No workflows found
          </h3>
          <p>Try adjusting your filters or create a new workflow to get started.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
          {filteredWorkflows.map((workflow) => (
            <article
              key={workflow.id}
              className="group bg-white dark:bg-[#27282b] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 flex flex-col gap-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50"
            >
              <div className="flex justify-between gap-3 items-start">
                <div className="flex-1">
                  <h3 className="m-0 text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {workflow.name}
                  </h3>
                  <p className="m-0 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {workflow.description || "No description provided"}
                  </p>
                </div>
                <span
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold capitalize border shrink-0",
                    STATUS_STYLES[workflow.status] ||
                      "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {STATUS_LABELS[workflow.status]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mt-6">
                <div className="flex items-center gap-1.5">
                  <Icon name="Box" size={16} />
                  <span>{workflow.nodesCount} nodes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="GitBranch" size={16} />
                  <span>{workflow.edgesCount} edges</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500 text-xs">
                <Icon name="Clock" size={14} />
                <span>Updated {formatDate(workflow.updatedAt)}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button
                  type="button"
                  className="flex-1 text-center rounded-xl py-3 px-4 border-none cursor-pointer font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleOpenWorkflow(workflow.id)}
                  disabled={isOpeningWorkflow === workflow.id}
                >
                  {isOpeningWorkflow === workflow.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="Pencil" size={16} />
                      Edit
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDuplicateWorkflow(workflow.id)}
                  disabled={
                    pendingAction.type === "duplicate" && mutatingWorkflowId === workflow.id
                  }
                  title="Duplicate workflow"
                >
                  <Icon name="Copy" size={18} />
                </button>
                <button
                  type="button"
                  className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-transparent text-red-600 dark:text-red-400 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  disabled={pendingAction.type === "delete" && mutatingWorkflowId === workflow.id}
                  title="Delete workflow"
                >
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-[#27282b]">
          <table className="w-full border-collapse">
            <thead className="bg-[#eeeff3] dark:bg-[#151516]">
              <tr>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Updated
                </th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Nodes
                </th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Edges
                </th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <div>
                      <strong>{workflow.name}</strong>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {workflow.description || "No description"}
                      </p>
                    </div>
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs font-semibold capitalize border border-gray-200 dark:border-gray-700",
                        STATUS_STYLES[workflow.status] ||
                          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {STATUS_LABELS[workflow.status]}
                    </span>
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    {formatDate(workflow.updatedAt)}
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    {workflow.nodesCount}
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    {workflow.edgesCount}
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="rounded-lg border-transparent bg-[#1296e7] text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-[#0d7ac4]"
                        onClick={() => handleOpenWorkflow(workflow.id)}
                        disabled={isOpeningWorkflow === workflow.id}
                      >
                        {isOpeningWorkflow === workflow.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          "Edit"
                        )}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleDuplicateWorkflow(workflow.id)}
                        disabled={
                          pendingAction.type === "duplicate" && mutatingWorkflowId === workflow.id
                        }
                      >
                        {pendingAction.type === "duplicate" && mutatingWorkflowId === workflow.id
                          ? "Duplicating…"
                          : "Duplicate"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-300 dark:border-red-700 bg-transparent text-red-600 dark:text-red-400 px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        disabled={
                          pendingAction.type === "delete" && mutatingWorkflowId === workflow.id
                        }
                      >
                        {pendingAction.type === "delete" && mutatingWorkflowId === workflow.id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isCreateModalOpen && (
        <Modal
          open={isCreateModalOpen}
          title="Create workflow"
          onClose={pendingAction.type === "create" ? undefined : closeCreateWorkflowModal}
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="default" disabled={creating} onClick={handleConfirmCreateWorkflow}>
                {creating ? "Creating…" : "Create workflow"}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 w-full">
            <label
              htmlFor="workflow-name-input"
              className="font-semibold text-gray-900 dark:text-white"
            >
              Workflow name
            </label>
            <Input
              id="workflow-name-input"
              value={newWorkflowName}
              autoFocus
              className="w-full"
              onChange={(event) => setNewWorkflowName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleConfirmCreateWorkflow();
                }
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
