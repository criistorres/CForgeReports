import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from '@/components/ui/badge'

type ForgeVariant = 'active' | 'inactive' | 'pending' | 'error'

interface ForgeBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant?: ForgeVariant
}

const variantStyles: Record<ForgeVariant, string> = {
  active: 'badge active',
  inactive: 'badge inactive',
  pending: 'badge pending',
  error: 'badge error',
}

export function ForgeBadge({
  variant = 'active',
  className,
  ...props
}: ForgeBadgeProps) {
  return (
    <Badge
      className={cn(
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
