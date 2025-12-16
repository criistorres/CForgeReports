import { cn } from '@/lib/utils'
import { Label, type LabelProps } from '@/components/ui/label'

export function ForgeLabel({ className, ...props }: LabelProps) {
  return (
    <Label
      className={cn('form-label', className)}
      {...props}
    />
  )
}
