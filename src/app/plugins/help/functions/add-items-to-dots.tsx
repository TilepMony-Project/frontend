import { MenuItemProps } from '@synergycodes/overflow-ui';
import { Icon } from '@/components/icons';
import { openNoAccessModal } from './open-no-access-modal';

export function addItemsToDots({ returnValue }: { returnValue: unknown }) {
  if (!Array.isArray(returnValue)) {
    return;
  }

  const items = returnValue as MenuItemProps[];

  const newItems: MenuItemProps[] = [
    {
      label: 'Save as Image',
      icon: <Icon name="Image" />,
      onClick: openNoAccessModal,
    },
    {
      type: 'separator',
    },
    {
      label: 'Archive',
      icon: <Icon name="Archive" />,
      destructive: true,
      onClick: openNoAccessModal,
    },
  ];

  return { replacedReturn: [...items, ...newItems] };
}
