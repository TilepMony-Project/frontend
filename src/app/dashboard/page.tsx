import { getWorkflowsForUser } from '@/actions/workflows';
import { WorkflowDashboard } from '@/features/dashboard/components/workflow-dashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  const workflows = await getWorkflowsForUser();
  return <WorkflowDashboard initialWorkflows={workflows} />;
}
