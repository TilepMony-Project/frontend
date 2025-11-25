import useStore from '@/store/store';
import { useTranslateIfPossible } from '@/hooks/use-translate-if-possible';
import { WorkflowNodeTemplate } from '../diagram/nodes/workflow-node-template/workflow-node-template';
import type { PaletteItem } from '@/types/common';
import { NodeType } from '@/types/node-types';


const NODE_TEMPLATES = {
  [NodeType.Node]: WorkflowNodeTemplate,
} as const;

type NodePreviewContainerProps = {
  type: string;
};

export function NodePreviewContainer({ type }: NodePreviewContainerProps) {
  const getNodeDefinition = useStore((state) => state.getNodeDefinition);

  const nodeDefinition = getNodeDefinition(type);
  if (!nodeDefinition) {
    return;
  }

  return <NodePreview nodeDefinition={nodeDefinition} />;
}

type NodePreviewProps = {
  nodeDefinition: PaletteItem;
};

function NodePreview({ nodeDefinition }: NodePreviewProps) {
  const { icon, label, description, templateType = NodeType.Node } = nodeDefinition;

  const translateIfPossible = useTranslateIfPossible();

  const nodeLabel = translateIfPossible(label) || label;
  const nodeDescription = translateIfPossible(description) || description;

  const TemplateComponent = NODE_TEMPLATES[templateType];

  return (
    <TemplateComponent
      icon={icon}
      label={nodeLabel}
      description={nodeDescription}
      showHandles={false}
      id={''}
    />
  );
}
