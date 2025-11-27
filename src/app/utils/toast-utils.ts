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

export function showToast({ title, subtitle, variant, action, id }: ShowToastParams) {
  const options = {
    description: subtitle,
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
