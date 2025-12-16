import { cn } from '@/lib/utils'
import { Select, type SelectProps } from '@/components/ui/select'
import { forwardRef } from 'react'

export const ForgeSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <Select
        ref={ref}
        className={cn(
          'form-input glow-on-focus',
          className
        )}
        {...props}
      />
    )
  }
)

ForgeSelect.displayName = 'ForgeSelect'
