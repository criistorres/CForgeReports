import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'

interface ForgeButtonProps extends ButtonProps {
  glow?: boolean
  gradient?: boolean
}

export function ForgeButton({
  className,
  glow = false,
  gradient = true,
  variant = 'default',
  ...props
}: ForgeButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        gradient && variant === 'default' && 'btn-gradient',
        glow && 'glow-on-hover',
        className
      )}
      {...props}
    />
  )
}
