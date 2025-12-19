import { useState, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    if (resolvePromise) {
      setIsLoading(true)
      // Pequeno delay para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 300))
      resolvePromise(true)
      setIsOpen(false)
      setIsLoading(false)
      setResolvePromise(null)
      setOptions(null)
    }
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setIsOpen(false)
      setIsLoading(false)
      setResolvePromise(null)
      setOptions(null)
    }
  }, [resolvePromise])

  const ConfirmComponent = options ? (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleConfirm}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      isLoading={isLoading}
    />
  ) : null

  return {
    confirm,
    ConfirmComponent
  }
}

