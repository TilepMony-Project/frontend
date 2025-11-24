'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';

import { IntegrationWrapper } from './wrapper/integration-wrapper';

import { getStoreDataForIntegration } from '@/store/slices/diagram-slice/actions';

import type { IntegrationDataFormatOptional, OnSave } from '@/features/integration/types';
import {
  showSnackbarSaveErrorIfNeeded,
  showSnackbarSaveSuccessIfNeeded,
} from '../../utils/show-snackbar';
import { autoSaveWorkflow } from '@/actions/workflows';

// Store workflow ID in localStorage to persist across page refreshes
const WORKFLOW_ID_KEY = 'tilepmoney_current_workflow_id';
const USER_ID_KEY = 'tilepmoney_user_id'; // TODO: Get from auth context

export function withIntegrationThroughServerAction<WProps extends object>(
  WrappedComponent: React.ComponentType<WProps>
) {
  function WithIntegrationComponent(props: React.ComponentProps<typeof WrappedComponent>) {
    const [isClient, setIsClient] = useState(false);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [userId] = useState<string>(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(USER_ID_KEY) || 'default-user';
      }
      return 'default-user';
    });

    useEffect(() => {
      setIsClient(true);
      // Load workflow ID from localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedWorkflowId = localStorage.getItem(WORKFLOW_ID_KEY);
        if (savedWorkflowId) {
          setWorkflowId(savedWorkflowId);
        }
      }
    }, []);

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
          } else {
            showSnackbarSaveErrorIfNeeded(savingParams);
            return 'error';
          }
        } catch (error) {
          console.error('Error saving workflow:', error);
          showSnackbarSaveErrorIfNeeded(savingParams);
          return 'error';
        }
      },
      [workflowId, userId]
    );

    // Load workflow data on mount (if workflowId exists)
    const { name, layoutDirection, nodes, edges }: IntegrationDataFormatOptional = useMemo(() => {
      // For now, return empty - workflow loading will be handled separately
      // when we implement workflow selection/loading
      return {};
    }, []);

    return (
      <IntegrationWrapper
        name={name}
        layoutDirection={layoutDirection}
        nodes={nodes}
        edges={edges}
        onSave={handleSave}
      >
        <WrappedComponent {...props} />
      </IntegrationWrapper>
    );
  }

  return WithIntegrationComponent;
}
