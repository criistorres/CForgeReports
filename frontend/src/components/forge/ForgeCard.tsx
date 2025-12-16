import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ForgeCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  glowOnHover?: boolean
  onClick?: () => void
}

export function ForgeCard({
  title,
  description,
  children,
  className,
  glowOnHover = true,
  onClick
}: ForgeCardProps) {
  return (
    <Card
      className={cn(
        'glass-card',
        glowOnHover && 'glow-on-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-white">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
