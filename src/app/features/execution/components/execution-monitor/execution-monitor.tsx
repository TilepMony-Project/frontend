'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/icons';
import useStore from '@/store/store';
import { copy } from '@/utils/copy';

import styles from './execution-monitor.module.css';

type ExecutionStatus = 'running' | 'running_waiting' | 'stopped' | 'finished' | 'failed' | 'draft';

type ExecutionLogEntry = {
  nodeId: string;
  nodeType: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
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

const TERMINAL_STATUSES: ExecutionStatus[] = ['finished', 'failed', 'stopped'];

export function ExecutionMonitor() {
  const nodes = useStore((state) => state.nodes);
  const setExecutionMonitorActive = useStore((state) => state.setExecutionMonitorActive);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionResponse['execution'] | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStatusRef = useRef<() => Promise<void>>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedWorkflowId = localStorage.getItem('tilepmoney_current_workflow_id');
    setWorkflowId(storedWorkflowId);
  }, []);

  const hasTerminalStatus = execution ? TERMINAL_STATUSES.includes(execution.status) : false;

  fetchStatusRef.current = async () => {
    if (!workflowId) {
      return;
    }

    try {
      setIsFetching(true);
      const response = await fetch(`/api/workflows/${workflowId}/status`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch execution status');
      }

      const payload = (await response.json()) as ExecutionResponse;
      setExecution(payload.execution ?? null);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Execution monitor error:', err);
      setError('Unable to fetch execution status');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!workflowId) {
      return;
    }

    fetchStatusRef.current?.();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workflowId]);

  useEffect(() => {
    if (!workflowId) {
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
  }, [workflowId, hasTerminalStatus]);

  const progress = useMemo(() => {
    if (!execution || nodes.length === 0) {
      return 0;
    }
    const completed = execution.executionLog.filter((entry) => entry.status === 'complete').length;
    return Math.min(100, Math.round((completed / nodes.length) * 100));
  }, [execution, nodes.length]);

  const nodeStatuses = useMemo(() => {
    const statusByNodeId = new Map<string, ExecutionLogEntry['status']>();

    if (execution?.executionLog) {
      for (const entry of execution.executionLog) {
        statusByNodeId.set(entry.nodeId, entry.status);
      }
    }

    return nodes.map((node) => {
      const status =
        statusByNodeId.get(node.id) ??
        (execution?.status === 'running' || execution?.status === 'running_waiting'
          ? 'pending'
          : 'pending');
      return {
        id: node.id,
        label: ((node.data as any)?.properties?.label as string) ?? node.type ?? 'Node',
        type: node.type ?? 'node',
        status,
      };
    });
  }, [execution?.executionLog, execution?.status, nodes]);

  const logEntries = execution?.executionLog ?? [];
  const transactions = logEntries.filter((entry) => entry.transactionHash);

  const statusLabel = execution ? getStatusLabel(execution.status) : 'No runs yet';

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
    <aside className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.title}>
          <strong>Execution Monitor</strong>
          <span>
            {workflowId
              ? `Workflow #${workflowId.slice(-6)}`
              : 'Save workflow to enable monitoring'}
          </span>
        </div>

        <div className={styles.actions}>
          {execution && (
            <span
              className={clsx(styles['status-badge'], getStatusClass(execution.status))}
              data-testid="execution-status"
            >
              <Icon
                name={
                  execution.status === 'running'
                    ? 'Spinner'
                    : execution.status === 'failed'
                      ? 'XCircle'
                      : 'CheckCircle'
                }
                size={14}
              />
              {statusLabel}
            </span>
          )}

          <button
            type="button"
            className={styles['icon-button']}
            onClick={() => fetchStatusRef.current?.()}
            aria-label="Refresh execution status"
            disabled={!workflowId || isFetching}
          >
            <Icon name="ArrowsClockwise" size={16} />
          </button>

          <button
            type="button"
            className={styles['icon-button']}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label="Toggle execution monitor"
          >
            <Icon
              name="ChevronDown"
              size={16}
              style={{ transform: isExpanded ? undefined : 'rotate(180deg)' }}
            />
          </button>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {workflowId ? (
        <>
          <div className={styles['progress-block']}>
            <div className={styles['progress-labels']}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className={styles['progress-bar']}>
              <div className={styles['progress-fill']} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={styles.body}>
            <section className={styles.section}>
              <h3>Nodes</h3>
              {nodeStatuses.length === 0 ? (
                <div className={styles['empty-state']}>
                  Add nodes to the canvas to start execution.
                </div>
              ) : (
                <ul className={styles['node-list']}>
                  {nodeStatuses.map((node) => (
                    <li key={node.id} className={styles['node-item']}>
                      <div className={styles['node-meta']}>
                        <Icon
                          name={
                            node.status === 'complete'
                              ? 'CheckCircle'
                              : node.status === 'failed'
                                ? 'XCircle'
                                : node.status === 'processing'
                                  ? 'Spinner'
                                  : 'Clock'
                          }
                          size={16}
                        />
                        <div>
                          <div className={styles['node-label']}>{node.label}</div>
                          <div className={styles['node-type']}>{node.type}</div>
                        </div>
                      </div>
                      <span className={clsx(styles['status-chip'], styles[node.status])}>
                        {node.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.section}>
              <h3>Transaction log</h3>
              {transactions.length === 0 ? (
                <div className={styles['empty-state']}>
                  No blockchain transactions recorded yet.
                </div>
              ) : (
                <ul className={styles['log-list']}>
                  {transactions.map((entry) => (
                    <li key={`${entry.nodeId}-${entry.timestamp}`} className={styles['log-item']}>
                      <div className={styles['log-top']}>
                        <div className={styles['log-details']}>
                          <strong>{entry.nodeType}</strong>
                          <span className={styles.muted}>
                            {new Date(entry.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className={clsx(styles['status-chip'], styles[entry.status])}>
                          {entry.status}
                        </span>
                      </div>
                      {entry.transactionHash && (
                        <div className={styles['hash-row']}>
                          <Icon name="Link2" size={14} />
                          <span>{shortenHash(entry.transactionHash)}</span>
                          <button
                            type="button"
                            className={styles['icon-button']}
                            onClick={() => entry.transactionHash && copy(entry.transactionHash)}
                          >
                            <Icon name="Copy" size={14} />
                          </button>
                        </div>
                      )}
                      {entry.error && <span className={styles.error}>{entry.error}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <footer className={styles['progress-labels']}>
            <span>
              Last updated:{' '}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </span>
            {isFetching && <span>Syncing…</span>}
          </footer>
        </>
      ) : (
        <p className={styles['empty-state']}>
          Save your workflow first to enable execution monitoring.
        </p>
      )}
    </aside>
  );
}

function getStatusLabel(status: ExecutionStatus): string {
  switch (status) {
    case 'running':
      return 'Running';
    case 'running_waiting':
      return 'Waiting';
    case 'failed':
      return 'Failed';
    case 'finished':
      return 'Finished';
    case 'stopped':
      return 'Stopped';
    default:
      return status;
  }
}

function getStatusClass(status: ExecutionStatus) {
  switch (status) {
    case 'running':
      return styles['status-running'];
    case 'running_waiting':
      return styles['status-waiting'];
    case 'failed':
      return styles['status-failed'];
    case 'finished':
      return styles['status-finished'];
    case 'stopped':
      return styles['status-finished'];
    default:
      return styles['status-running'];
  }
}

function shortenHash(hash: string) {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
