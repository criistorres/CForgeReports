import { cn } from '@/lib/utils'
import { Input, type InputProps } from '@/components/ui/input'
import { forwardRef } from 'react'

export const ForgeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
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

ForgeInput.displayName = 'ForgeInput'
