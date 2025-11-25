import clsx from 'clsx';

import { Separator } from '@/components/ui/separator';

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  isExpanded: boolean;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
};

export function Sidebar({
  isExpanded,
  children,
  className,
  header,
  footer,
  contentClassName,
  ...props
}: SidebarProps) {
  return (
    <div
      className={clsx(
        'h-min w-auto relative items-center justify-between pointer-events-auto rounded-xl bg-[var(--ax-ui-bg-primary-default)] text-[var(--ax-txt-primary-default)] flex flex-col py-3 border border-[var(--ax-ui-stroke-primary-default)]',
        'transition-all duration-300 shadow-lg',
        { 'h-full w-[420px] box-border': isExpanded },
        className
      )}
      {...props}
    >
      <div className="box-border w-full flex flex-col px-4 gap-4 mb-5 last:mb-0">{header}</div>
      {isExpanded && (
        <>
          <Separator />
          <div
            className={clsx(
              'box-border w-full flex flex-col px-4 flex-1 overflow-y-auto overflow-x-hidden py-5',
              contentClassName
            )}
          >
            {children}
          </div>
          {footer && (
            <>
              <Separator />
              <div className="box-border w-full flex flex-col px-4 mt-5">{footer}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
