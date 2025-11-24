type WorkspacePageProps = {
  params: Promise<{
    workflowId: string;
  }>;
};

import { App } from '../../app';

export default async function WorkspaceWithIdPage({ params }: WorkspacePageProps) {
  const { workflowId } = await params;
  return <App workflowId={workflowId} />;
}
