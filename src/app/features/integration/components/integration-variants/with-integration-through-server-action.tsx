"use client";

import { useCallback, useEffect, useState } from "react";

import { IntegrationWrapper } from "./wrapper/integration-wrapper";

import type { IntegrationDataFormatOptional, OnSave } from "@/features/integration/types";
import { usePrivySession } from "@/hooks/use-privy-session";
import { getStoreDataForIntegration } from "@/store/slices/diagram-slice/actions";
import { showToast, ToastType } from "@/utils/toast-utils";
import { showToast as showSnackbar } from "@/utils/toast-utils";
import { WorkflowLoadingOverlay } from "@/components/workflow-loading-overlay";
import {
  showSnackbarSaveErrorIfNeeded,
  showSnackbarSaveSuccessIfNeeded,
} from "../../utils/show-snackbar";

// Store workflow ID in localStorage to persist across page refreshes
const WORKFLOW_ID_KEY = "tilepmoney_current_workflow_id";
const USER_ID_KEY = "tilepmoney_user_id"; // TODO: Get from auth context

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
    const { accessToken, userId } = usePrivySession();

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (typeof window === "undefined" || !userId) {
        return;
      }
      window.localStorage.setItem(USER_ID_KEY, userId);
    }, [userId]);

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

      if (!accessToken) {
        setIsLoadingWorkflow(true);
        return;
      }

      let cancelled = false;

      async function fetchWorkflow() {
        try {
          setIsLoadingWorkflow(true);
          const response = await fetch(`/api/workflows/${workflowId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch workflow");
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
              title: "Workflow loaded successfully",
              variant: ToastType.SUCCESS,
            });
          }
        } catch (error) {
          console.error("Error loading workflow:", error);
          if (!cancelled) {
            setInitialData({});
            setIsLoadingWorkflow(false);
            showToast({
              title: "Failed to load workflow",
              subtitle: error instanceof Error ? error.message : "Please try again.",
              variant: ToastType.ERROR,
            });
          }
        }
      }

      void fetchWorkflow();

      return () => {
        cancelled = true;
      };
    }, [isClient, workflowId, accessToken]);

    const handleSave: OnSave = useCallback(
      async (savingParams) => {
        const data = getStoreDataForIntegration();

        if (!accessToken) {
          showToast({
            title: "Session expired",
            subtitle: "Please reconnect your Privy session before saving.",
            variant: ToastType.ERROR,
          });
          showSnackbarSaveErrorIfNeeded(savingParams);
          return "error";
        }

        try {
          const endpoint = workflowId ? `/api/workflows/${workflowId}` : "/api/workflows";
          const method = workflowId ? "PUT" : "POST";
          const response = await fetch(endpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: data.name,
              description: data.description,
              nodes: data.nodes ?? [],
              edges: data.edges ?? [],
              status: "draft",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save workflow");
          }

          const payload = (await response.json()) as {
            workflow?: { _id?: string; id?: string };
          };
          const savedId =
            payload.workflow?._id?.toString?.() ?? payload.workflow?.id ?? workflowId ?? null;

          if (savedId && savedId !== workflowId) {
            setWorkflowId(savedId);
            if (typeof window !== "undefined" && window.localStorage) {
              localStorage.setItem(WORKFLOW_ID_KEY, savedId);
            }
          }

          showSnackbarSaveSuccessIfNeeded(savingParams);
          return "success";
        } catch (error) {
          console.error("Error saving workflow:", error);
          showSnackbarSaveErrorIfNeeded(savingParams);
          return "error";
        }
      },
      [workflowId, accessToken]
    );

    const { name, nodes, edges } = initialData;

    return (
      <>
        {(isLoadingWorkflow || (workflowId && !accessToken)) && <WorkflowLoadingOverlay />}
        <IntegrationWrapper
          name={name}
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
