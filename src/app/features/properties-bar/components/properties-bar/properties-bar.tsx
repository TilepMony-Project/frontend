

import { Button } from '@/components/ui/button';
import { SegmentPicker } from '@/components/ui/segment-picker';
import { Icon } from '@/components/icons';
import { withOptionalComponentPlugins } from '@/features/plugins-core/adapters/adapter-components';
import { EdgeProperties } from '../edge-properties/edge-properties';
import { PropertiesBarHeader } from '../header/properties-bar-header';
import { NodeProperties } from '../node-properties/node-properties';
import { Sidebar } from '@/components/sidebar/sidebar';
import { renderComponent } from './render-component';
import type { PropertiesBarItem, PropertiesBarProps } from './properties-bar.types';

/**
 * PropertiesBarComponent - A configurable sidebar component for displaying and editing
 * properties of selected workflow elements (nodes and edges).
 *
 * This component provides a flexible tab-based interface that can be extended with custom tabs.
 * By default, it shows a "Properties" tab for basic element properties. Additional tabs can be
 * added through the `tabs` prop to extend functionality.
 * When no custom tabs exist, the SegmentPicker is hidden for a cleaner UI
 */
function PropertiesBarComponent({
  selection,
  onMenuHeaderClick,
  onDeleteClick,
  headerLabel,
  deleteNodeLabel,
  deleteEdgeLabel,
  selectedTab,
  onTabChange,
  onRunNodeClick,
  runNodeLabel,
  tabs = [],
}: PropertiesBarProps) {
  const name = selection?.node?.data?.properties?.label ?? selection?.edge?.data?.label;
  const isExpanded = !!selection;
  const hasCustomItems = tabs.length > 0;

  const segmentPicker = {
    when: () => isExpanded && !!selection?.node && selection.node.type === 'node' && hasCustomItems,
    component: () => (
      <SegmentPicker
        size="xxx-small"
        value={selectedTab}
        onChange={(_, value) => onTabChange(value)}
      >
        {[
          <SegmentPicker.Item key="properties" value="properties">
            Properties
          </SegmentPicker.Item>,
          ...tabs.map(({ label, value }) => (
            <SegmentPicker.Item key={value} value={value}>
              {label}
            </SegmentPicker.Item>
          )),
        ]}
      </SegmentPicker>
    ),
  };

  const contentComponents: PropertiesBarItem[] = [
    {
      when: ({ selection, selectedTab }) => !!selection.node && selectedTab === 'properties',
      component: ({ selection }) => <NodeProperties node={selection.node!} />,
    },
    {
      when: ({ selection }) => !!selection.edge,
      component: ({ selection }) => <EdgeProperties edge={selection.edge!} />,
    },
    ...tabs.flatMap((tab) => tab.components),
  ];

  return (
    <Sidebar
      isExpanded={isExpanded}
      contentClassName="-ml-4 w-[calc(100%+1rem)] [&>*]:pl-4"
      header={
        <>
          <PropertiesBarHeader
            isExpanded={isExpanded}
            header={headerLabel}
            name={name ?? ''}
            onDotsClick={onMenuHeaderClick}
          />
          {isExpanded && renderComponent([segmentPicker], selection, selectedTab)}
        </>
      }
      footer={
        isExpanded && (
          <div className="flex flex-col gap-2 w-full">
            {selection?.node && (
              <Button
                onClick={onRunNodeClick}
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
              >
                <Icon name="Play" size={16} />
                {runNodeLabel}
              </Button>
            )}
            <Button
              onClick={onDeleteClick}
              variant="outline"
              className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <Icon name="Trash2" size={16} />
              {selection?.node ? deleteNodeLabel : deleteEdgeLabel}
            </Button>
          </div>
        )
      }
    >
      {isExpanded && renderComponent(contentComponents, selection, selectedTab)}
    </Sidebar>
  );
}

export const PropertiesBar = withOptionalComponentPlugins(PropertiesBarComponent, 'PropertiesBar');
