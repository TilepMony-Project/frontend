'use client';

import { WalletGuard } from '@/components/wallet-guard';
import { WorkflowDashboard } from '@/features/dashboard/components/workflow-dashboard';

export default function DashboardPage() {
  return (
    <WalletGuard>
      <WorkflowDashboard />
    </WalletGuard>
  );
}
