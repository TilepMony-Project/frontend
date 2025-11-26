type WorkspacePageProps = {
  params: Promise<{
    workflowId: string;
  }>;
};

import { App } from "../../app";
import { WalletGuard } from "../../components/wallet-guard";

export default async function WorkspaceWithIdPage({ params }: WorkspacePageProps) {
  const { workflowId } = await params;
  return (
    <WalletGuard>
      <App workflowId={workflowId} />
    </WalletGuard>
  );
}
