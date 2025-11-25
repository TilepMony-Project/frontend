import { toast } from "sonner"

export enum ToastType {
   SUCCESS = 'success',
   ERROR = 'error',
   INFO = 'info',
   WARNING = 'warning',
}

type ShowToastParams = {
   title: string;
   subtitle?: string;
   variant: ToastType;
   action?: {
      label: string;
      onClick: () => void;
   };
}

export function showToast({ title, subtitle, variant, action }: ShowToastParams) {
   const options = {
      description: subtitle,
      action: action ? {
         label: action.label,
         onClick: action.onClick,
      } : undefined,
   };

   switch (variant) {
      case ToastType.SUCCESS:
         toast.success(title, options);
         break;
      case ToastType.ERROR:
         toast.error(title, options);
         break;
      case ToastType.INFO:
         toast.info(title, options);
         break;
      case ToastType.WARNING:
         toast.warning(title, options);
         break;
      default:
         toast(title, options);
   }
}
