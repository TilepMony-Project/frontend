import { withIntegrationThroughApi } from "./integration-variants/with-integration-through-api";
import { withIntegrationThroughLocalStorage } from "./integration-variants/with-integration-through-local-storage";
import { withIntegrationThroughProps } from "./integration-variants/with-integration-through-props";
import { withIntegrationThroughServerAction } from "./integration-variants/with-integration-through-server-action";

const hocByStrategy = {
  API: withIntegrationThroughApi,
  LOCAL_STORAGE: withIntegrationThroughLocalStorage,
  PROPS: withIntegrationThroughProps,
  SERVER_ACTION: withIntegrationThroughServerAction,
} as const;

/*
  Pick the hocByStrategy that fits your usage best.
  Using SERVER_ACTION for auto-save with MongoDB via Next.js Server Actions.
*/
export const withIntegration = hocByStrategy.SERVER_ACTION;
