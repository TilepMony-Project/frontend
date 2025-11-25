'use client';

import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import type { WorkflowSummary } from '@/actions/workflows';
import { Icon } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { showSnackbar } from '@/utils/show-snackbar';
import { Button, Input, Modal, SnackbarType } from '@synergycodes/overflow-ui';



type ViewMode = 'grid' | 'list';

type PendingAction = {
  type: 'create' | 'duplicate' | 'delete' | null;
  workflowId?: string;
};

type Props = {
  initialWorkflows: WorkflowSummary[];
};

type WorkflowApiPayload = {
  _id?: string | { toString(): string };
  id?: string;
  name?: string;
  description?: string;
  status?: WorkflowSummary['status'];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastExecutedAt?: string | Date | null;
  nodes?: unknown[];
  edges?: unknown[];
  nodesCount?: number;
  edgesCount?: number;
};

const STATUS_OPTIONS: Array<{ label: string; value: WorkflowSummary['status'] | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Running', value: 'running' },
  { label: 'Running (Waiting)', value: 'running_waiting' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Finished', value: 'finished' },
  { label: 'Failed', value: 'failed' },
];

const STATUS_LABELS: Record<WorkflowSummary['status'], string> = {
  draft: 'Draft',
  running: 'Running',
  running_waiting: 'Running (Waiting)',
  stopped: 'Stopped',
  finished: 'Finished',
  failed: 'Failed',
};

const STATUS_STYLES: Record<WorkflowSummary['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  running: 'bg-green-100 text-green-800',
  running_waiting: 'bg-green-100 text-green-800',
  stopped: 'bg-yellow-100 text-yellow-900',
  finished: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
};

function normalizeWorkflow(workflow: WorkflowApiPayload): WorkflowSummary {
  return {
    id: workflow._id?.toString?.() ?? workflow.id ?? '',
    name: workflow.name ?? 'Untitled workflow',
    description: workflow.description ?? '',
    status: workflow.status ?? 'draft',
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
    return 'Not executed yet';
  }
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

export function WorkflowDashboard({ initialWorkflows }: Props) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>(initialWorkflows ?? []);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkflowSummary['status']>('all');
  const [pendingAction, setPendingAction] = useState<PendingAction>({ type: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const { theme, toggleTheme } = useTheme();

  const filteredWorkflows = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return workflows.filter((workflow) => {
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      const matchesSearch =
        lowerSearch.length === 0 ||
        workflow.name.toLowerCase().includes(lowerSearch) ||
        (workflow.description ?? '').toLowerCase().includes(lowerSearch);
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm, workflows]);

  function resetAction() {
    setPendingAction({ type: null });
  }

  function openCreateWorkflowModal() {
    setNewWorkflowName('');
    setIsCreateModalOpen(true);
  }

  function closeCreateWorkflowModal() {
    if (pendingAction.type === 'create') {
      return;
    }
    setIsCreateModalOpen(false);
  }

  async function createWorkflow(nameOverride?: string) {
    try {
      setPendingAction({ type: 'create' });
      const workflowName = nameOverride?.trim() ? nameOverride.trim() : 'Untitled workflow';

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowName,
          description: 'Draft workflow created from dashboard',
          nodes: [],
          edges: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);

      setWorkflows((prev) => [normalized, ...prev]);
      showSnackbar({ title: 'Workflow created', variant: SnackbarType.SUCCESS });
      setIsCreateModalOpen(false);
      router.push(`/workspace/${normalized.id}`);
    } catch (error) {
      console.error(error);
      showSnackbar({
        title: 'Unable to create workflow',
        subtitle: error instanceof Error ? error.message : 'Please try again.',
        variant: SnackbarType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  function handleConfirmCreateWorkflow() {
    void createWorkflow(newWorkflowName);
  }

  async function handleDeleteWorkflow(workflowId: string) {
    const confirmed = window.confirm('Delete this workflow? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setPendingAction({ type: 'delete', workflowId });
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== workflowId));
      showSnackbar({ title: 'Workflow deleted', variant: SnackbarType.SUCCESS });
    } catch (error) {
      console.error(error);
      showSnackbar({
        title: 'Unable to delete workflow',
        subtitle: error instanceof Error ? error.message : 'Please try again.',
        variant: SnackbarType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  async function handleDuplicateWorkflow(workflowId: string) {
    try {
      setPendingAction({ type: 'duplicate', workflowId });
      const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate workflow');
      }

      const { workflow } = await response.json();
      const normalized = normalizeWorkflow(workflow);
      setWorkflows((prev) => [normalized, ...prev]);
      showSnackbar({
        title: 'Workflow duplicated',
        variant: SnackbarType.SUCCESS,
      });
    } catch (error) {
      console.error(error);
      showSnackbar({
        title: 'Unable to duplicate workflow',
        subtitle: error instanceof Error ? error.message : 'Please try again.',
        variant: SnackbarType.ERROR,
      });
    } finally {
      resetAction();
    }
  }

  function handleOpenWorkflow(workflowId: string) {
    router.push(`/workspace/${workflowId}`);
  }

  const creating = pendingAction.type === 'create';
  const mutatingWorkflowId = pendingAction.workflowId;

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6 bg-[#eeeff3] dark:bg-[#151516]">
      <section className="flex flex-wrap justify-between gap-4 items-start">
        <div className="titleGroup">
          <h1 className="m-0 text-3xl font-semibold text-gray-900 dark:text-white">Workflow Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">Review, filter, and jump into any orchestration workspace.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            className="flex items-center gap-1.5 rounded-full"
            variant="secondary"
            size="medium"
            onClick={toggleTheme}
          >
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={18} />
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </Button>
          <Button
            className="min-w-[180px] h-13 text-base rounded-full"
            onClick={openCreateWorkflowModal}
            disabled={creating}
            variant="primary"
            size="large"
          >
            {creating ? 'Creating...' : 'New workflow'}
          </Button>
        </div>
      </section>

      <section className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#27282b] rounded-2xl p-4 shadow-sm">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white">
          <Icon name="Search" size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search workflows"
            onChange={(event) => setSearchTerm(event.target.value)}
            className="border-none outline-none bg-transparent text-inherit w-full"
          />
        </div>

        <select
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-[#eeeff3] dark:bg-[#151516] text-gray-900 dark:text-white p-3 min-w-[180px]"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className={clsx(
              'bg-transparent border-none py-2 px-4 flex items-center gap-1.5 text-gray-600 dark:text-gray-400 cursor-pointer font-medium',
              viewMode === 'grid' && 'bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white'
            )}
            type="button"
            onClick={() => setViewMode('grid')}
          >
            <Icon name="LayoutGrid" size={16} />
            Grid
          </button>
          <button
            className={clsx(
              'bg-transparent border-none py-2 px-4 flex items-center gap-1.5 text-gray-600 dark:text-gray-400 cursor-pointer font-medium',
              viewMode === 'list' && 'bg-[#eeeff3] dark:bg-[#27282b] text-gray-900 dark:text-white'
            )}
            type="button"
            onClick={() => setViewMode('list')}
          >
            <Icon name="List" size={16} />
            List
          </button>
        </div>
      </section>

      <section className="flex justify-between items-center text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredWorkflows.length} of {workflows.length} workflows
        </span>
        {searchTerm && <span className="text-gray-600 dark:text-gray-400 text-sm">Filtered by "{searchTerm}"</span>}
      </section>

      {filteredWorkflows.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl py-12 px-6 text-center bg-white dark:bg-[#27282b] text-gray-600 dark:text-gray-400">
          <h3 className="m-0 mb-2 text-gray-900 dark:text-white text-lg font-semibold">No workflows found</h3>
          <p>Try adjusting your filters or create a new workflow to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filteredWorkflows.map((workflow) => (
            <article key={workflow.id} className="bg-white dark:bg-[#27282b] rounded-2xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-3.5 shadow-sm">
              <div className="flex justify-between gap-3 items-start">
                <div>
                  <h3 className="m-0 text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                  {workflow.description ? (
                    <p className="m-0 text-gray-600 dark:text-gray-400 text-sm">{workflow.description}</p>
                  ) : (
                    <p className="m-0 text-gray-600 dark:text-gray-400 text-sm">No description provided</p>
                  )}
                </div>
                <span
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-semibold capitalize border border-gray-200 dark:border-gray-700',
                    STATUS_STYLES[workflow.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {STATUS_LABELS[workflow.status]}
                </span>
              </div>

              <div className="flex gap-4 text-gray-600 dark:text-gray-400 text-sm">
                <span>{workflow.nodesCount} nodes</span>
                <span>•</span>
                <span>{workflow.edgesCount} edges</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Updated {formatDate(workflow.updatedAt)}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Last executed: {formatDate(workflow.lastExecutedAt)}</p>

              <div className="mt-auto flex gap-2 flex-wrap">
                <button
                  type="button"
                  className={clsx(
                    'flex-1 min-w-[120px] text-center rounded-xl p-2.5 border cursor-pointer font-semibold',
                    'border-transparent bg-[#1296e7] text-white hover:bg-[#0d7ac4]'
                  )}
                  onClick={() => handleOpenWorkflow(workflow.id)}
                >
                  Open workspace
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-[120px] text-center rounded-xl p-2.5 border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white cursor-pointer font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleDuplicateWorkflow(workflow.id)}
                  disabled={
                    pendingAction.type === 'duplicate' && mutatingWorkflowId === workflow.id
                  }
                >
                  {pendingAction.type === 'duplicate' && mutatingWorkflowId === workflow.id
                    ? 'Duplicating…'
                    : 'Duplicate'}
                </button>
                <button
                  type="button"
                  className={clsx(
                    'flex-1 min-w-[120px] text-center rounded-xl p-2.5 border cursor-pointer font-semibold',
                    'text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                  )}
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  disabled={pendingAction.type === 'delete' && mutatingWorkflowId === workflow.id}
                >
                  {pendingAction.type === 'delete' && mutatingWorkflowId === workflow.id
                    ? 'Deleting…'
                    : 'Delete'}
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
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Updated</th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nodes</th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Edges</th>
                <th className="text-left p-3.5 text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <div>
                      <strong>{workflow.name}</strong>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{workflow.description || 'No description'}</p>
                    </div>
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-semibold capitalize border border-gray-200 dark:border-gray-700',
                        STATUS_STYLES[workflow.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {STATUS_LABELS[workflow.status]}
                    </span>
                  </td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{formatDate(workflow.updatedAt)}</td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{workflow.nodesCount}</td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{workflow.edgesCount}</td>
                  <td className="p-3.5 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="rounded-lg border-transparent bg-[#1296e7] text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-[#0d7ac4]"
                        onClick={() => handleOpenWorkflow(workflow.id)}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleDuplicateWorkflow(workflow.id)}
                        disabled={
                          pendingAction.type === 'duplicate' && mutatingWorkflowId === workflow.id
                        }
                      >
                        {pendingAction.type === 'duplicate' && mutatingWorkflowId === workflow.id
                          ? 'Duplicating…'
                          : 'Duplicate'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-300 dark:border-red-700 bg-transparent text-red-600 dark:text-red-400 px-3 py-1.5 cursor-pointer text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        disabled={
                          pendingAction.type === 'delete' && mutatingWorkflowId === workflow.id
                        }
                      >
                        {pendingAction.type === 'delete' && mutatingWorkflowId === workflow.id
                          ? 'Deleting…'
                          : 'Delete'}
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
          onClose={pendingAction.type === 'create' ? undefined : closeCreateWorkflowModal}
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="primary" disabled={creating} onClick={handleConfirmCreateWorkflow}>
                {creating ? 'Creating…' : 'Create workflow'}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 w-full">
            <label htmlFor="workflow-name-input" className="font-semibold text-gray-900 dark:text-white">Workflow name</label>
            <Input
              id="workflow-name-input"
              value={newWorkflowName}
              autoFocus
              className="w-full"
              onChange={(event) => setNewWorkflowName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
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
