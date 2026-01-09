"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { WorkflowSummary } from "@/actions/workflows";
import { Icon } from "@/components/icons";
import { IconSwitch } from "@/components/ui/icon-switch";
import { Tooltip } from "@/components/ui/tooltip";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  WalletCoinbase,
  WalletMetamask,
  WalletRabby,
  WalletRainbow,
  WalletWalletConnect,
} from "@web3icons/react";
import {
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Heart,
  LogOut,
  Moon,
  Plus,
  Shield as ShieldIcon,
  Sun,
  Wallet as WalletIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { toast } from "sonner";

import { ProfileCheckAlert } from "@/components/profile-check-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { AIWorkflowGenerator } from "@/components/workflow/ai-workflow-generator";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";
import {
  type WorkflowTemplate,
  workflowTemplates,
} from "@/features/dashboard/data/templates";
import { ToastType, showToast } from "@/utils/toast-utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

type ViewMode = "grid" | "list";

type PendingAction = {
  type: "delete" | "create" | "duplicate" | "template" | "update" | null;
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

const STATUS_OPTIONS: Array<{
  label: string;
  value: WorkflowSummary["status"] | "all";
}> = [
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
    nodesCount: Array.isArray(workflow.nodes)
      ? workflow.nodes.length
      : workflow.nodesCount ?? 0,
    edgesCount: Array.isArray(workflow.edges)
      ? workflow.edges.length
      : workflow.edgesCount ?? 0,
  };
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not executed yet";
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function WorkflowDashboard({ initialWorkflows }: Props) {
  const router = useRouter();
  const { accessToken, user, isLoadingToken } = usePrivySession();
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>(
    initialWorkflows ?? []
  );
  const [isLoading, setIsLoading] = useState(!initialWorkflows);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | WorkflowSummary["status"]
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pendingAction, setPendingAction] = useState<PendingAction>({
    type: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [workflowToDelete, setWorkflowToDelete] =
    useState<WorkflowSummary | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"workflows" | "analytics">(
    "workflows"
  );

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositCurrency, setDepositCurrency] = useState<"USD" | "IDR">("USD");
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  const isBusy = isLoading || isLoadingToken;

  // Wallet connection logic
  const isConnected = ready && authenticated;
  const primaryWalletAddress = wallets[0]?.address ?? user?.wallet?.address;
  const linkedAccounts =
    (
      user as {
        linkedAccounts?: Array<{
          type?: string;
          walletClientType?: string;
          address?: string;
        }>;
      }
    )?.linkedAccounts ?? [];
  const externalWallet = linkedAccounts.find(
    (account) => account?.type === "wallet" && account.address
  );
  const walletClientType =
    externalWallet?.walletClientType ||
    user?.wallet?.walletClientType ||
    wallets[0]?.walletClientType ||
    "embedded";
  const originalWallet =
    linkedAccounts.find(
      (account) =>
        account?.type === "wallet" && account.walletClientType !== "privy"
    )?.address || null;
  const loginIdentifier =
    originalWallet || user?.email?.address || primaryWalletAddress;

  type WalletMeta = {
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  };

  const walletMeta = useMemo<WalletMeta>(() => {
    const type = walletClientType?.toLowerCase() ?? "embedded";
    if (type.includes("metamask")) {
      return { label: "MetaMask", Icon: WalletMetamask };
    }
    if (type.includes("rabby")) {
      return { label: "Rabby Wallet", Icon: WalletRabby };
    }
    if (type.includes("coinbase")) {
      return { label: "Coinbase Wallet", Icon: WalletCoinbase };
    }
    if (type.includes("rainbow")) {
      return { label: "Rainbow", Icon: WalletRainbow };
    }
    if (type.includes("walletconnect")) {
      return { label: "WalletConnect", Icon: WalletWalletConnect };
    }
    if (type.includes("privy") || type.includes("embedded")) {
      return { label: "Privy Wallet", Icon: ShieldIcon };
    }
    return { label: "Wallet", Icon: WalletIcon };
  }, [walletClientType]);

  const formatIdentifier = (identifier?: string | null) => {
    if (!identifier) {
      return "Connected";
    }
    if (identifier.includes("@")) {
      return identifier;
    }
    return `${identifier.slice(0, 6)}...${identifier.slice(-4)}`;
  };

  const connectButtonLabel = !ready
    ? "Loading..."
    : isConnected
    ? formatIdentifier(loginIdentifier)
    : "Connect Wallet";

  const handleAuthClick = () => {
    if (!ready) {
      return;
    }
    if (isConnected) {
      logout();
      return;
    }
    login();
  };

  const copyToClipboard = async () => {
    if (loginIdentifier) {
      await navigator.clipboard.writeText(loginIdentifier);
      setHasCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Function to fetch workflows from API
  const fetchWorkflows = useCallback(async () => {
    const freshToken = await getFreshToken();
    if (!freshToken) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/workflows", {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

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
        subtitle:
          error instanceof Error
            ? error.message
            : "Please try refreshing the page",
        variant: ToastType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Fetch workflows client-side on mount if not provided
  useEffect(() => {
    if (initialWorkflows) {
      return;
    }

    if (!accessToken) {
      setIsLoading(true);
      return;
    }

    void fetchWorkflows();
  }, [initialWorkflows, fetchWorkflows, accessToken]);

  const filteredWorkflows = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return workflows.filter((workflow) => {
      const matchesStatus =
        statusFilter === "all" || workflow.status === statusFilter;
      const matchesSearch =
        lowerSearch.length === 0 ||
        workflow.name.toLowerCase().includes(lowerSearch) ||
        (workflow.description ?? "").toLowerCase().includes(lowerSearch);
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm, workflows]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkflows = useMemo(
    () => filteredWorkflows.slice(startIndex, endIndex),
    [filteredWorkflows, startIndex, endIndex]
  );

  function resetAction() {
    setPendingAction({ type: null });
  }

  function openCreateWorkflowModal() {
    setNewWorkflowName("");
    setNewWorkflowDescription("");
    setIsCreateModalOpen(true);
  }

  function closeCreateWorkflowModal() {
    if (pendingAction.type === "create") {
      return;
    }
    setIsCreateModalOpen(false);
  }

  function openTemplateModal() {
    setIsTemplateModalOpen(true);
  }

  function closeTemplateModal() {
    if (pendingAction.type === "template") {
      return;
    }
    setIsTemplateModalOpen(false);
  }

  function openDeleteWorkflowModal(workflow: WorkflowSummary) {
    setWorkflowToDelete(workflow);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteWorkflowModal() {
    if (pendingAction.type === "delete") {
      return;
    }
    setIsDeleteModalOpen(false);
    setWorkflowToDelete(null);
  }

  function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  // Helper function to get a fresh token
  async function getFreshToken(): Promise<string | null> {
    try {
      const token = await getAccessToken();
      return token;
    } catch (error) {
      console.error("Failed to get fresh access token:", error);
      return null;
    }
  }

  async function createWorkflow(
    nameOverride?: string,
    descriptionOverride?: string
  ) {
    // Get a fresh token to avoid expiration issues
    const freshToken = await getFreshToken();
    if (!freshToken) {
      showToast({
        title: "Session not ready",
        subtitle:
          "Please wait for your Privy session before creating a workflow.",
        variant: ToastType.ERROR,
      });
      return;
    }
    try {
      setPendingAction({ type: "create" });
      const workflowName = nameOverride?.trim()
        ? nameOverride.trim()
        : "Untitled workflow";

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          name: workflowName,
          description: descriptionOverride?.trim() || "No description provided",
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
    if (!newWorkflowDescription.trim()) {
      showToast({
        title: "Description required",
        subtitle: "Please provide a description for your workflow.",
        variant: ToastType.ERROR,
      });
      return;
    }
    void createWorkflow(newWorkflowName, newWorkflowDescription);
  }

  async function handleCreateWorkflowFromTemplate(template: WorkflowTemplate) {
    if (!accessToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for Privy to finish connecting.",
        variant: ToastType.ERROR,
      });
      return;
    }

    const freshToken = await getFreshToken();
    if (!freshToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for your Privy session.",
        variant: ToastType.ERROR,
      });
      return;
    }

    try {
      setPendingAction({ type: "template", workflowId: template.id });
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          nodes: deepClone(template.nodes),
          edges: deepClone(template.edges),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workflow from template");
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);
      setWorkflows((prev) => [normalized, ...prev]);
      showToast({
        title: "Template applied",
        subtitle: `${template.name} is ready in your workspace.`,
        variant: ToastType.SUCCESS,
      });
      setIsTemplateModalOpen(false);
      router.push(`/workspace/${normalized.id}`);
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to apply template",
        subtitle: error instanceof Error ? error.message : "Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  async function handleDeleteWorkflow(workflowId: string) {
    const freshToken = await getFreshToken();
    if (!freshToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for your Privy session.",
        variant: ToastType.ERROR,
      });
      return;
    }

    try {
      setPendingAction({ type: "delete", workflowId });
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      setWorkflows((prev) =>
        prev.filter((workflow) => workflow.id !== workflowId)
      );
      showToast({ title: "Workflow deleted", variant: ToastType.SUCCESS });
      setIsDeleteModalOpen(false);
      setWorkflowToDelete(null);
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

  async function handleSetStatusCompleted(workflowId: string) {
    if (!accessToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for Privy to finish connecting.",
        variant: ToastType.ERROR,
      });
      return;
    }

    const freshToken = await getFreshToken();
    if (!freshToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for your Privy session.",
        variant: ToastType.ERROR,
      });
      return;
    }

    try {
      setPendingAction({ type: "update", workflowId });
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({ status: "finished" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workflow status");
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);

      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? normalized : w))
      );

      showToast({
        title: "Workflow completed",
        subtitle: "Status updated to finished",
        variant: ToastType.SUCCESS,
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to update status",
        subtitle: error instanceof Error ? error.message : "Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  async function handleDuplicateWorkflow(workflowId: string) {
    if (!accessToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for Privy to finish connecting.",
        variant: ToastType.ERROR,
      });
      return;
    }
    const toastId = showToast({
      title: "Duplicating workflow...",
      variant: ToastType.LOADING,
    });

    const freshToken = await getFreshToken();
    if (!freshToken) {
      showToast({
        title: "Session not ready",
        subtitle: "Please wait for your Privy session.",
        variant: ToastType.ERROR,
      });
      return;
    }

    try {
      setPendingAction({ type: "duplicate", workflowId });
      const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate workflow");
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);
      setWorkflows((prev) => [normalized, ...prev]);
      showToast({
        id: toastId,
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
        id: toastId,
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

  const [isOpeningWorkflow, setIsOpeningWorkflow] = useState<string | null>(
    null
  );
  const creating = pendingAction.type === "create";
  const creatingTemplate = pendingAction.type === "template";
  const mutatingWorkflowId = pendingAction.workflowId;
  const deletingWorkflowId =
    pendingAction.type === "delete" ? pendingAction.workflowId : null;

  // Fetch user balance
  const [balances, setBalances] = useState<{ IDR: number; USD: number }>({
    IDR: 0,
    USD: 0,
  });

  useEffect(() => {
    async function fetchBalance() {
      const freshToken = await getFreshToken();
      if (!freshToken) return;
      try {
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${freshToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBalances(data.fiatBalances || { IDR: 0, USD: 0 });
        }
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    }
    if (accessToken) {
      void fetchBalance();
    }
  }, [accessToken]);

  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) {
      showToast({
        title: "Invalid Amount",
        subtitle: "Please enter a valid amount to deposit.",
        variant: ToastType.ERROR,
      });
      return;
    }

    const freshToken = await getFreshToken();
    if (!freshToken) return;

    try {
      setIsDepositing(true);
      const response = await fetch("/api/user/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          currency: depositCurrency,
          amount: Number(depositAmount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deposit");
      }

      const data = await response.json();
      setBalances(data.fiatBalances);
      showToast({
        title: "Deposit Successful",
        subtitle: `Added ${depositCurrency} ${Number(
          depositAmount
        ).toLocaleString()} to your balance.`,
        variant: ToastType.SUCCESS,
      });
      setIsDepositModalOpen(false);
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      showToast({
        title: "Deposit Failed",
        subtitle: "Failed to process deposit. Please try again.",
        variant: ToastType.ERROR,
      });
    } finally {
      setIsDepositing(false);
    }
  }

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6 bg-[#eeeff3] dark:bg-[#151516]">
      <ProfileCheckAlert />

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <Modal
          open={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          title="Deposit funds"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDepositModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount}
              >
                {isDepositing ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Processing
                  </>
                ) : (
                  "Deposit"
                )}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 w-full">
            <label className="font-semibold text-gray-900 dark:text-white">
              Select Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDepositCurrency("USD")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
                  depositCurrency === "USD"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                type="button"
              >
                <span className="text-lg font-bold">USD</span>
                <span className="text-xs opacity-70">United States Dollar</span>
              </button>
              <button
                onClick={() => setDepositCurrency("IDR")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
                  depositCurrency === "IDR"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                type="button"
              >
                <span className="text-lg font-bold">IDR</span>
                <span className="text-xs opacity-70">Indonesian Rupiah</span>
              </button>
            </div>

            <label className="font-semibold text-gray-900 dark:text-white mt-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {depositCurrency === "USD" ? "$" : "Rp"}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-9"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleDeposit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        </Modal>
      )}

      <section className="flex flex-wrap justify-between gap-4 items-center">
        <div className="titleGroup">
          <h1 className="m-0 text-3xl font-semibold text-gray-900 dark:text-white">
            Workflow Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
            Review, filter, and jump into any orchestration workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Profile Dropdown */}
          <Button
            type="button"
            variant="ghost"
            className="hidden h-12 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#27282b]/80 px-5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#323336] shadow-sm hover:bg-accent/40 sm:flex"
            onClick={() => router.push("/dashboard/profile")}
          >
            <Icon name="User" size={18} />
            Profile
          </Button>

          {/* Balance Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#27282b]/80 px-5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#323336] shadow-sm hover:bg-accent/40"
              >
                <WalletIcon size={18} />
                <span>Balance</span>
                <ChevronDown size={14} className="text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  Wallet Balance
                </h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                      $
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      USD
                    </span>
                  </div>
                  <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
                    ${balances.USD.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold">
                      Rp
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      IDR
                    </span>
                  </div>
                  <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
                    Rp {balances.IDR.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full gap-2"
                onClick={() => setIsDepositModalOpen(true)}
              >
                <CreditCard size={16} />
                Deposit Funds
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Dropdown */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "h-12 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 outline-none",
                    "bg-white dark:bg-[#1b1b1d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-[#242427]"
                  )}
                >
                  <span className="flex items-center justify-center">
                    <walletMeta.Icon className="h-4 w-4" />
                  </span>
                  {connectButtonLabel}
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {loginIdentifier}
                    </span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-background rounded-md transition-colors"
                    >
                      {hasCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={handleAuthClick}
              disabled={!ready}
              className={cn(
                "h-12 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {connectButtonLabel}
            </button>
          )}
          <IconSwitch
            checked={theme === "dark"}
            onChange={toggleTheme}
            icon={<Sun size={18} />}
            IconChecked={<Moon size={18} />}
            variant="secondary"
            className="h-12 w-12 bg-white dark:bg-[#27282b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#323336] shadow-sm p-0 flex items-center justify-center"
          />
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#27282b] px-2.5 py-1.5 rounded-2xl w-fit border border-gray-200 dark:border-gray-700 shadow-sm mb-2">
        <button
          onClick={() => setActiveTab("workflows")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
            activeTab === "workflows"
              ? "bg-primary text-white transform scale-105"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          type="button"
        >
          <Icon name="LayoutGrid" size={16} />
          My Workflows
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
            activeTab === "analytics"
              ? "bg-primary text-white transform scale-105"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          type="button"
        >
          <Icon name="BarChart3" size={16} />
          Advanced Analysis
        </button>
      </div>

      {activeTab === "analytics" ? (
        <AnalyticsDashboard />
      ) : (
        <>
          <section className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#27282b] rounded-2xl p-4 shadow-sm">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white">
              <Icon name="Search" size={18} />
              <input
                type="text"
                value={searchTerm}
                placeholder="Search workflows"
                onChange={(event) => setSearchTerm(event.target.value)}
                disabled={isBusy}
                className="border-none outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 focus:outline-none bg-transparent text-inherit w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isBusy}
                  className="h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white px-4 min-w-[200px] flex items-center justify-between disabled:opacity-50"
                >
                  {STATUS_OPTIONS.find(
                    (option) => option.value === statusFilter
                  )?.label ?? "All statuses"}
                  <Icon name="ChevronDown" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as typeof statusFilter)
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <DropdownMenuRadioItem
                      key={status.value}
                      value={status.value}
                    >
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
                  viewMode === "grid" &&
                    "bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white"
                )}
                type="button"
                onClick={() => setViewMode("grid")}
                disabled={isBusy}
                aria-label="Grid view"
              >
                <Icon name="LayoutGrid" size={18} />
              </button>
              <button
                className={clsx(
                  "h-12 w-12 flex items-center justify-center border-none text-gray-600 dark:text-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  viewMode === "list" &&
                    "bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white"
                )}
                type="button"
                onClick={() => setViewMode("list")}
                disabled={isBusy}
                aria-label="List view"
              >
                <Icon name="List" size={18} />
              </button>
            </div>
          </section>

          <section className="flex justify-between items-center gap-4 text-gray-600 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    {isLoadingToken
                      ? "Preparing your workspace..."
                      : "Loading workflows..."}
                  </span>
                ) : (
                  <>
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredWorkflows.length)} of{" "}
                    {filteredWorkflows.length} workflows
                    {filteredWorkflows.length !== workflows.length &&
                      ` (${workflows.length} total)`}
                  </>
                )}
              </span>
              {!isLoading && filteredWorkflows.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs"
                      disabled={isBusy}
                    >
                      {itemsPerPage} per page
                      <Icon name="ChevronDown" size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {[6, 12, 24, 48].map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => {
                          setItemsPerPage(size);
                          setCurrentPage(1);
                        }}
                        className="cursor-pointer"
                      >
                        {size} per page
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="min-w-[180px] px-6 py-3 text-base rounded-full border-[1px] border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                onClick={openTemplateModal}
                disabled={creatingTemplate || isLoading}
                variant="outline"
                size="lg"
              >
                {creatingTemplate ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Loading template...
                  </>
                ) : (
                  <>
                    <Icon name="LayoutGrid" size={18} />
                    Choose template
                  </>
                )}
              </Button>
              <AIWorkflowGenerator
                onWorkflowGenerated={() => {
                  // Refresh workflows after AI generation
                  if (!initialWorkflows) {
                    void fetchWorkflows();
                  }
                }}
              />
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
            </div>
          </section>

          {isBusy ? (
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
              <p>
                Try adjusting your filters or create a new workflow to get
                started.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
              {paginatedWorkflows.map((workflow) => (
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
                        pendingAction.type === "duplicate" &&
                        mutatingWorkflowId === workflow.id
                      }
                      title="Duplicate workflow"
                    >
                      <Icon name="Copy" size={18} />
                    </button>
                    <button
                      type="button"
                      className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-transparent text-red-600 dark:text-red-400 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => openDeleteWorkflowModal(workflow)}
                      disabled={
                        pendingAction.type === "delete" &&
                        mutatingWorkflowId === workflow.id
                      }
                      title="Delete workflow"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            pendingAction.type === "update" &&
                            mutatingWorkflowId === workflow.id
                          }
                        >
                          {pendingAction.type === "update" &&
                          mutatingWorkflowId === workflow.id ? (
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icon name="MoreHorizontal" size={18} />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSetStatusCompleted(workflow.id)}
                          disabled={workflow.status === "finished"}
                          className="cursor-pointer dark:border dark:border-gray-700"
                        >
                          <Icon
                            name="CheckCircle2"
                            size={16}
                            className="mr-2"
                          />
                          Set as Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  {paginatedWorkflows.map((workflow) => (
                    <tr key={workflow.id}>
                      <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-xs">
                        <div className="max-w-xs">
                          <strong className="block truncate">
                            {workflow.name}
                          </strong>
                          <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
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
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDuplicateWorkflow(workflow.id)}
                            disabled={
                              pendingAction.type === "duplicate" &&
                              mutatingWorkflowId === workflow.id
                            }
                          >
                            <Icon name="Copy" size={18} />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 dark:border-red-900/50 bg-transparent text-red-600 dark:text-red-400 px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => openDeleteWorkflowModal(workflow)}
                            disabled={
                              pendingAction.type === "delete" &&
                              mutatingWorkflowId === workflow.id
                            }
                          >
                            <Icon name="Trash2" size={18} />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                  pendingAction.type === "update" &&
                                  mutatingWorkflowId === workflow.id
                                }
                              >
                                {pendingAction.type === "update" &&
                                mutatingWorkflowId === workflow.id ? (
                                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Icon name="MoreHorizontal" size={18} />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSetStatusCompleted(workflow.id)
                                }
                                disabled={workflow.status === "finished"}
                                className="cursor-pointer dark:border dark:border-gray-700"
                              >
                                <Icon
                                  name="CheckCircle2"
                                  size={16}
                                  className="mr-2"
                                />
                                Set as Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isBusy && filteredWorkflows.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center py-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <Modal
          open={isCreateModalOpen}
          title="Create workflow"
          onClose={
            pendingAction.type === "create"
              ? undefined
              : closeCreateWorkflowModal
          }
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="default"
                disabled={creating}
                onClick={handleConfirmCreateWorkflow}
              >
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
            <label
              htmlFor="workflow-description-input"
              className="font-semibold text-gray-900 dark:text-white mt-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="workflow-description-input"
              value={newWorkflowDescription}
              className="w-full min-h-[100px]"
              placeholder="Describe your workflow..."
              onChange={(event) =>
                setNewWorkflowDescription(event.target.value)
              }
            />
          </div>
        </Modal>
      )}
      {isTemplateModalOpen && (
        <Modal
          open={isTemplateModalOpen}
          title="Choose a template"
          onClose={creatingTemplate ? undefined : closeTemplateModal}
          size="extra-large"
          titleActions={
            <span className="group relative inline-flex">
              <a
                href="https://www.notion.so/Flow-Templates-2b59b7e1751380948781f49d6ce86707?source=copy_link"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-primary/80 transition-colors focus:outline-none"
                aria-label="View template guidelines"
              >
                <Icon name="Info" size={20} />
              </a>
              <span className="pointer-events-none absolute left-0 bottom-full z-20 mb-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                View template guidelines
              </span>
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {workflowTemplates.map((template) => {
              const isProcessingTemplate =
                creatingTemplate && mutatingWorkflowId === template.id;
              return (
                <article
                  key={template.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27282b] p-5 shadow-sm"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {template.category}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="Box" size={14} />
                      {template.nodes.length} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="GitBranch" size={14} />
                      {template.edges.length} edges
                    </span>
                  </div>
                  <Button
                    variant="default"
                    className="mt-auto"
                    onClick={() =>
                      void handleCreateWorkflowFromTemplate(template)
                    }
                    disabled={isProcessingTemplate}
                  >
                    {isProcessingTemplate ? (
                      <>
                        <Icon
                          name="Loader2"
                          size={18}
                          className="animate-spin"
                        />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Icon name="Copy" size={18} />
                        Use this template
                      </>
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        </Modal>
      )}
      {isDeleteModalOpen && workflowToDelete && (
        <Modal
          open={isDeleteModalOpen}
          title="Delete workflow"
          onClose={
            pendingAction.type === "delete"
              ? undefined
              : closeDeleteWorkflowModal
          }
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeDeleteWorkflowModal}
                disabled={pendingAction.type === "delete"}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleDeleteWorkflow(workflowToDelete.id)}
                disabled={deletingWorkflowId === workflowToDelete.id}
              >
                {deletingWorkflowId === workflowToDelete.id
                  ? "Deleting…"
                  : "Delete workflow"}
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              You are about to delete <strong>{workflowToDelete.name}</strong>.
              This action cannot be undone and the workflow will be permanently
              removed from your dashboard.
            </p>
            <p>If you’re sure, click “Delete workflow” below.</p>
          </div>
        </Modal>
      )}
      <footer className="mt-72 w-full border-t border-gray-200 pt-6 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            ©2025 TilepMoney · All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Terms of Use
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              href="#"
            >
              Security
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
