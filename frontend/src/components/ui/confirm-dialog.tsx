import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {variant === 'destructive' ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-white mb-2">
                {title}
              </DialogTitle>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-xl transition-all font-medium border border-white/5"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 ${variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

