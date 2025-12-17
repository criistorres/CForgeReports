import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
    id: string | null
    nome: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    onNavigate: (pastaId: string | null) => void
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
    if (items.length === 0) return null

    return (
        <nav className="flex items-center gap-2 text-sm">
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
                <Home className="w-4 h-4" />
                <span>Início</span>
            </button>

            {items.map((item, index) => (
                <div key={item.id || 'root'} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <button
                        onClick={() => onNavigate(item.id)}
                        className={`
              transition-colors
              ${index === items.length - 1
                                ? 'text-white font-medium'
                                : 'text-slate-400 hover:text-white'
                            }
            `}
                    >
                        {item.nome}
                    </button>
                </div>
            ))}
        </nav>
    )
}
