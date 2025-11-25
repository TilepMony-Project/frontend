'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'

export interface SegmentPickerProps {
  value?: string
  onChange?: (event: React.SyntheticEvent, value: string) => void
  children?: React.ReactNode
  className?: string
  size?: 'xx-small' | 'xxx-small' | 'small' | 'medium'
}

export interface SegmentPickerItemProps {
  value: string
  children?: React.ReactNode
  className?: string
}

const sizeStyles = {
  'xxx-small': 'h-6 px-2 text-xs',
  'xx-small': 'h-7 px-2.5 text-xs',
  'small': 'h-8 px-3 text-sm',
  'medium': 'h-9 px-4 text-sm',
}

const SegmentPickerContext = React.createContext<{
  value?: string
  onChange?: (event: React.SyntheticEvent, value: string) => void
  size?: SegmentPickerProps['size']
}>({})

export function SegmentPicker({
  value,
  onChange,
  children,
  className,
  size = 'medium',
}: SegmentPickerProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue && onChange) {
      // Create a synthetic event-like object
      const syntheticEvent = {
        currentTarget: {},
        target: {},
      } as React.SyntheticEvent
      onChange(syntheticEvent, newValue)
    }
  }

  return (
    <SegmentPickerContext.Provider value={{ value, onChange, size }}>
      <ToggleGroupPrimitive.Root
        type="single"
        value={value}
        onValueChange={handleValueChange}
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-muted p-1',
          className
        )}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    </SegmentPickerContext.Provider>
  )
}

function SegmentPickerItem({ value, children, className }: SegmentPickerItemProps) {
  const { size = 'medium' } = React.useContext(SegmentPickerContext)

  return (
    <ToggleGroupPrimitive.Item
      value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium',
        'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none',
        'disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground',
        'data-[state=on]:shadow-sm hover:bg-muted-foreground/10',
        sizeStyles[size],
        className
      )}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

SegmentPicker.Item = SegmentPickerItem
