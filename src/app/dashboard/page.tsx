import { getWorkflowsForUser } from '@/actions/workflows';
import { WalletGuard } from '@/components/wallet-guard';
import { WorkflowDashboard } from '@/features/dashboard/components/workflow-dashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  const workflows = await getWorkflowsForUser();
  return (
    <WalletGuard>
      <WorkflowDashboard initialWorkflows={workflows} />
    </WalletGuard>
  );
}
