import * as React from "react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const Dialog = ({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null

    // Fechar com ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onOpenChange) {
                onOpenChange(false)
            }
        }
        if (open) {
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
    }, [open, onOpenChange])

    const dialogContent = (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center animate-in fade-in duration-300"
            onClick={() => onOpenChange && onOpenChange(false)}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <div
                className="bg-slate-900/90 border border-white/10 text-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600" />

                {children}
                <button
                    onClick={() => onOpenChange && onOpenChange(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-all p-1.5 rounded-xl hover:bg-purple-500/20 active:scale-90"
                    aria-label="Fechar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>
        </div>
    )

    return createPortal(dialogContent, document.body)
}

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props}>
        {children}
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogTitle }
