import { useEffect, useMemo, useState } from 'react';
import { useRemoveElements } from '@/hooks/use-remove-elements';
import { useSingleSelectedElement } from '@/features/properties-bar/use-single-selected-element';
import { PropertiesBar } from './components/properties-bar/properties-bar';

export function PropertiesBarContainer() {
  const { removeElements } = useRemoveElements();

  const [selectedTab, setSelectedTab] = useState('properties');

  const selection = useSingleSelectedElement();
  const selectionId = useMemo(() => selection?.node?.id, [selection]);

  useEffect(() => {
    setSelectedTab('properties');
  }, [selectionId]);

  function handleDeleteClick() {
    if (selection) {
      removeElements(selection);
    }
  }

  return (
    <PropertiesBar
      selection={selection}
      onDeleteClick={handleDeleteClick}
      headerLabel="Properties"
      deleteNodeLabel="Delete Node"
      deleteEdgeLabel="Delete Edge"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
    />
  );
}
