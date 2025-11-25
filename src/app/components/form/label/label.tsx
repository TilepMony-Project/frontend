import clsx from 'clsx';


import { Asterisk } from 'lucide-react';
// Define ItemSize type locally to replace SynergyCode type
export type ItemSize = 'small' | 'medium' | 'large';

export type LabelProps = {
  label: string;
  required?: boolean;
  size?: ItemSize;
};

export function Label({ label, required, size = 'medium' }: LabelProps) {
  return (
    <span className={clsx('flex gap-1 text-[var(--ax-public-form-label-color)] items-center', size === 'large' ? 'ax-public-p10' : 'ax-public-p11')}>
      {required && <Asterisk className="w-2.5 h-2.5 min-w-[0.625rem] text-[var(--ax-public-form-label-asterisk-color)]" />}
      <span className="whitespace-nowrap overflow-hidden text-ellipsis w-full">{label}</span>
    </span>
  );
}
