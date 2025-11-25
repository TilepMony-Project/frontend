import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenuItemProps = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export type MenuProps = {
  items: MenuItemProps[];
  children: React.ReactNode;
};

export function Menu({ items, children }: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className="gap-2 cursor-pointer"
          >
            {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
