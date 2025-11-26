import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type FooterVariant = "integrated" | "sticky" | "separated";

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "small" | "medium" | "large" | "extra-large" | "full-screen";
  icon?: React.ReactNode;
  footerVariant?: FooterVariant;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  icon,
  className,
}: ModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-lg",
    large: "max-w-2xl",
    "extra-large": "max-w-4xl",
    "full-screen": "max-w-[95vw] h-[95vh]",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], "shadow-2xl", className, !onClose && "[&>button]:hidden")}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
