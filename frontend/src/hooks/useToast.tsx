import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast deve ser usado dentro de ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType, duration: number = 3000) => {
        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, toast])

        // Remove automaticamente após o duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />
            case 'error':
                return <AlertCircle className="w-5 h-5" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />
            case 'info':
                return <Info className="w-5 h-5" />
        }
    }

    const getColors = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-500/10 border-green-500/50 text-green-400'
            case 'error':
                return 'bg-red-500/10 border-red-500/50 text-red-400'
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
            case 'info':
                return 'bg-purple-500/10 border-purple-500/50 text-purple-400'
        }
    }

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            {/* Container de Toasts */}
            <div className="fixed bottom-4 right-4 z-[10001] flex flex-col gap-2 max-w-md">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
              flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm
              animate-in slide-in-from-right-full duration-300
              ${getColors(toast.type)}
            `}
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
