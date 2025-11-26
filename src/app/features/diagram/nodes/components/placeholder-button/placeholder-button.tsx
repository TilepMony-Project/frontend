import { Button } from "@/components/ui/button";

import { PlusCircle } from "lucide-react";

type Props = {
  label: string;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PlaceholderButton({ label, size = "sm", ...props }: Props) {
  return (
    <Button className="border-dashed" size={size} variant="secondary" {...props}>
      <PlusCircle />
      {label}
    </Button>
  );
}
