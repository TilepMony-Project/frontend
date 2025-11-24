import { MenuItemProps } from '@synergycodes/overflow-ui';
import { Icon } from '@/components/icons';

export function addItemsToDots({ returnValue }: { returnValue: unknown }) {
  if (!Array.isArray(returnValue)) {
    return;
  }

  const items = returnValue as MenuItemProps[];

  const newItems: MenuItemProps[] = [
    {
      label: 'Save as Image',
      icon: <Icon name="Image" />,
      onClick: () => {
        // TODO: Implement save as image functionality
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Archive',
      icon: <Icon name="Archive" />,
      destructive: true,
      onClick: () => {
        // TODO: Implement archive functionality
      },
    },
  ];

  return { replacedReturn: [...items, ...newItems] };
}
