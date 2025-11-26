'use client';

import { useCallback, useEffect, useState } from 'react';

import { IntegrationWrapper } from './wrapper/integration-wrapper';

import { autoSaveWorkflow } from '@/actions/workflows';
import type { IntegrationDataFormatOptional, OnSave } from '@/features/integration/types';
import { getStoreDataForIntegration } from '@/store/slices/diagram-slice/actions';
import { showToast as showSnackbar } from '@/utils/toast-utils';
import { showToast, ToastType } from '@/utils/toast-utils';
import { WorkflowLoadingOverlay } from '@/components/workflow-loading-overlay';
import {
  showSnackbarSaveErrorIfNeeded,
  showSnackbarSaveSuccessIfNeeded,
} from '../../utils/show-snackbar';

// Store workflow ID in localStorage to persist across page refreshes
const WORKFLOW_ID_KEY = 'tilepmoney_current_workflow_id';
const USER_ID_KEY = 'tilepmoney_user_id'; // TODO: Get from auth context

export function withIntegrationThroughServerAction<WProps extends object>(
  WrappedComponent: React.ComponentType<WProps>
) {
  type WithIntegrationProps = React.ComponentProps<typeof WrappedComponent> & {
    workflowId?: string | null;
  };

  function WithIntegrationComponent(allProps: WithIntegrationProps) {
    const { workflowId: workflowIdFromProps, ...restProps } = allProps;

    const [isClient, setIsClient] = useState(false);
    const [workflowId, setWorkflowId] = useState<string | null>(workflowIdFromProps ?? null);
    const [initialData, setInitialData] = useState<IntegrationDataFormatOptional>({});
    const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
    const [userId] = useState<string>(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(USER_ID_KEY) || 'default-user';
      }
      return 'default-user';
    });

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!isClient) {
        return;
      }

      if (workflowIdFromProps) {
        setWorkflowId(workflowIdFromProps);
        if (window.localStorage) {
          window.localStorage.setItem(WORKFLOW_ID_KEY, workflowIdFromProps);
        }
        return;
      }

      if (window.localStorage) {
        const savedWorkflowId = window.localStorage.getItem(WORKFLOW_ID_KEY);
        if (savedWorkflowId) {
          setWorkflowId(savedWorkflowId);
        }
      }
    }, [isClient, workflowIdFromProps]);

    useEffect(() => {
      if (!isClient) {
        return;
      }

      if (!workflowId) {
        setInitialData({});
        setIsLoadingWorkflow(false);
        return;
      }

      let cancelled = false;

      async function fetchWorkflow() {
        try {
          setIsLoadingWorkflow(true);
          const response = await fetch(`/api/workflows/${workflowId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch workflow');
          }

          const { workflow } = await response.json();

          if (!cancelled) {
            setInitialData({
              name: workflow?.name,
              nodes: Array.isArray(workflow?.nodes) ? workflow.nodes : [],
              edges: Array.isArray(workflow?.edges) ? workflow.edges : [],
            });
            setIsLoadingWorkflow(false);
            showToast({
              title: 'Workflow loaded successfully',
              variant: ToastType.SUCCESS,
            });
          }
        } catch (error) {
          console.error('Error loading workflow:', error);
          if (!cancelled) {
            setInitialData({});
            setIsLoadingWorkflow(false);
            showToast({
              title: 'Failed to load workflow',
              subtitle: error instanceof Error ? error.message : 'Please try again.',
              variant: ToastType.ERROR,
            });
          }
        }
      }

      fetchWorkflow();

      return () => {
        cancelled = true;
      };
    }, [isClient, workflowId]);

    const handleSave: OnSave = useCallback(
      async (savingParams) => {
        const data = getStoreDataForIntegration();

        try {
          const result = await autoSaveWorkflow(workflowId, data, userId);

          if (result.success) {
            // Update workflow ID if it was created
            if (result.workflowId && result.workflowId !== workflowId) {
              setWorkflowId(result.workflowId);
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(WORKFLOW_ID_KEY, result.workflowId);
              }
            }

            showSnackbarSaveSuccessIfNeeded(savingParams);
            return 'success';
          }

          showSnackbarSaveErrorIfNeeded(savingParams);
          return 'error';
        } catch (error) {
          console.error('Error saving workflow:', error);
          showSnackbarSaveErrorIfNeeded(savingParams);
          return 'error';
        }
      },
      [workflowId, userId]
    );

    const { name, layoutDirection, nodes, edges } = initialData;

    return (
      <>
        {isLoadingWorkflow && <WorkflowLoadingOverlay />}
        <IntegrationWrapper
          name={name}
          layoutDirection={layoutDirection}
          nodes={nodes}
          edges={edges}
          onSave={handleSave}
        >
          <WrappedComponent {...(restProps as WProps)} />
        </IntegrationWrapper>
      </>
    );
  }

  return WithIntegrationComponent;
}
