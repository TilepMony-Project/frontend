import { toast } from "sonner";

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
  WARNING = "warning",
  LOADING = "loading",
}

type ShowToastParams = {
  title: string;
  subtitle?: string;
  variant: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string | number;
};

const MAX_TOAST_LENGTH = 120;

export function truncateText(text?: string): string | undefined {
  if (!text) return undefined;
  if (text.length <= MAX_TOAST_LENGTH) return text;
  return text.substring(0, MAX_TOAST_LENGTH) + "...";
}

export function showToast({ title, subtitle, variant, action, id }: ShowToastParams) {
  const truncatedSubtitle = truncateText(subtitle);
  const options = {
    description: truncatedSubtitle,
    id,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  };

  switch (variant) {
    case ToastType.SUCCESS:
      return toast.success(title, options);
    case ToastType.ERROR:
      return toast.error(title, options);
    case ToastType.INFO:
      return toast.info(title, options);
    case ToastType.WARNING:
      return toast.warning(title, options);
    case ToastType.LOADING:
      return toast.loading(title, options);
    default:
      return toast(title, options);
  }
}
