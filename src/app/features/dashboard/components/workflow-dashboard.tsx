'use client';

import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import type { WorkflowSummary } from '@/actions/workflows';
import { Icon } from '@/components/icons';
import { showSnackbar } from '@/utils/show-snackbar';
import { Button, SnackbarType } from '@synergycodes/overflow-ui';

import styles from './workflow-dashboard.module.css';

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

  async function handleCreateWorkflow() {
    try {
      setPendingAction({ type: 'create' });
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Untitled workflow',
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
    <div className={styles.container}>
      <section className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Workflow Dashboard</h1>
          <p>Review, filter, and jump into any orchestration workspace.</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            className={styles.ctaButton}
            onClick={handleCreateWorkflow}
            disabled={creating}
            variant="primary"
            size="large"
          >
            {creating ? 'Creating...' : 'New workflow'}
          </Button>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={styles.searchInput}>
          <Icon name="Search" size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search workflows"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <div className={styles.viewToggle}>
          <button
            className={clsx(styles.viewButton, viewMode === 'grid' && styles.viewButtonActive)}
            type="button"
            onClick={() => setViewMode('grid')}
          >
            <Icon name="LayoutGrid" size={16} />
            Grid
          </button>
          <button
            className={clsx(styles.viewButton, viewMode === 'list' && styles.viewButtonActive)}
            type="button"
            onClick={() => setViewMode('list')}
          >
            <Icon name="List" size={16} />
            List
          </button>
        </div>
      </section>

      <section className={styles.contentHeader}>
        <span>
          Showing {filteredWorkflows.length} of {workflows.length} workflows
        </span>
        {searchTerm && <span className={styles.muted}>Filtered by “{searchTerm}”</span>}
      </section>

      {filteredWorkflows.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No workflows found</h3>
          <p>Try adjusting your filters or create a new workflow to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className={styles.grid}>
          {filteredWorkflows.map((workflow) => (
            <article key={workflow.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{workflow.name}</h3>
                  {workflow.description ? (
                    <p className={styles.cardDescription}>{workflow.description}</p>
                  ) : (
                    <p className={styles.cardDescription}>No description provided</p>
                  )}
                </div>
                <span
                  className={clsx(
                    styles.statusBadge,
                    styles[
                      `statusBadge${workflow.status.charAt(0).toUpperCase()}${workflow.status.slice(1)}`
                    ]
                  )}
                >
                  {STATUS_LABELS[workflow.status]}
                </span>
              </div>

              <div className={styles.statsRow}>
                <span>{workflow.nodesCount} nodes</span>
                <span>•</span>
                <span>{workflow.edgesCount} edges</span>
              </div>
              <p className={styles.muted}>Updated {formatDate(workflow.updatedAt)}</p>
              <p className={styles.muted}>Last executed: {formatDate(workflow.lastExecutedAt)}</p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={clsx(styles.cardButton, styles.cardButtonPrimary)}
                  onClick={() => handleOpenWorkflow(workflow.id)}
                >
                  Open workspace
                </button>
                <button
                  type="button"
                  className={styles.cardButton}
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
                  className={clsx(styles.cardButton, styles.dangerButton)}
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
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Nodes</th>
                <th>Edges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td>
                    <div>
                      <strong>{workflow.name}</strong>
                      <p className={styles.muted}>{workflow.description || 'No description'}</p>
                    </div>
                  </td>
                  <td>
                    <span
                      className={clsx(
                        styles.statusBadge,
                        styles[
                          `statusBadge${workflow.status.charAt(0).toUpperCase()}${workflow.status.slice(1)}`
                        ]
                      )}
                    >
                      {STATUS_LABELS[workflow.status]}
                    </span>
                  </td>
                  <td>{formatDate(workflow.updatedAt)}</td>
                  <td>{workflow.nodesCount}</td>
                  <td>{workflow.edgesCount}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        type="button"
                        className={clsx(styles.smallButton, styles.smallButtonPrimary)}
                        onClick={() => handleOpenWorkflow(workflow.id)}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className={styles.smallButton}
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
                        className={clsx(styles.smallButton, styles.dangerButton)}
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
    </div>
  );
}
