import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  side?: 'left' | 'right'
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = 'right',
  className
}: DrawerProps) {
  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.dataset.dialogsOpen = String(Number(document.body.dataset.dialogsOpen || 0) + 1)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      const openCount = Number(document.body.dataset.dialogsOpen || 0) - 1
      document.body.dataset.dialogsOpen = String(Math.max(0, openCount))
      if (openCount <= 0) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-[9999] w-full max-w-md bg-slate-900 border-l border-slate-700/50 shadow-2xl',
          'flex flex-col',
          side === 'right'
            ? 'right-0 animate-slide-in-from-right'
            : 'left-0 animate-slide-in-from-left',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
            <h2 id="drawer-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </>
  )

  // Renderizar usando portal para garantir que fique acima de tudo
  return createPortal(drawerContent, document.body)
}

