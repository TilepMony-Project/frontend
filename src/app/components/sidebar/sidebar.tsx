import clsx from 'clsx';

import { Separator } from '@/components/ui/separator';

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  isExpanded: boolean;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  maxHeightClass?: string;
};

export function Sidebar({
  isExpanded,
  children,
  className,
  header,
  footer,
  contentClassName,
  maxHeightClass = 'max-h-[80vh]',
  ...props
}: SidebarProps) {
  return (
    <div
      className={clsx(
        'h-min w-auto relative items-center justify-between pointer-events-auto rounded-xl flex flex-col py-3',
        'bg-white dark:bg-[#27282b] text-gray-900 dark:text-white',
        'border border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out shadow-lg',
        isExpanded && ['h-full w-[440px] box-border', maxHeightClass],
        className
      )}
      {...props}
    >
      <div className="box-border w-full flex flex-col px-4 gap-3 mb-4 last:mb-0">{header}</div>
      {isExpanded && (
        <>
          <Separator className="my-0" />
          <div
            className={clsx(
              'box-border w-full flex flex-col px-4 flex-1 overflow-y-auto overflow-x-hidden',
              'py-4',
              contentClassName
            )}
          >
            {children}
          </div>
          {footer && (
            <>
              <Separator className="my-0" />
              <div className="box-border w-full flex flex-col px-4 pt-4 pb-3">{footer}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
