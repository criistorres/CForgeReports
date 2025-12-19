import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface DataTableProps<TData = any> {
  data: TData[]
  columns?: ColumnDef<TData, any>[]
  maxHeight?: string
}

export function DataTable<TData = any>({ data, columns: userColumns, maxHeight = '600px' }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Gerar colunas dinamicamente a partir dos dados ou usar as fornecidas
  const columns = useMemo<ColumnDef<TData, any>[]>(() => {
    if (userColumns) return userColumns
    if (!data || data.length === 0) return []

    return Object.keys(data[0] as object).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => {
        const value = info.getValue()
        return value !== null && value !== undefined ? String(value) : '-'
      },
    }))
  }, [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Nenhum dado para exibir
      </div>
    )
  }

  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  return (
    <div className="space-y-4 min-w-0">
      {/* Tabela com scroll horizontal */}
      <div className="border border-white/5 rounded-2xl overflow-hidden min-w-0 bg-slate-900/40 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto overflow-y-auto min-w-0 custom-scrollbar" style={{ maxHeight }}>
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-white/5 whitespace-nowrap bg-slate-800/50"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 transition-colors ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-purple-400' : ''
                            }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-slate-600 transition-colors">
                              {{
                                asc: <ChevronUp className="w-4 h-4 text-purple-400" />,
                                desc: <ChevronDown className="w-4 h-4 text-purple-400" />,
                              }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDown className="w-4 h-4 group-hover:text-purple-400/50" />
                                )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-purple-500/5 transition-all group">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-[13.5px] text-slate-300 whitespace-nowrap group-hover:text-white transition-colors"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-slate-400">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}{' '}
            de {data.length} linhas
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl transition-all border border-white/5 shadow-lg active:scale-95"
            >
              Primeira
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl transition-all border border-white/5 shadow-lg active:scale-95"
            >
              Anterior
            </button>
            <div className="px-5 py-2 text-xs font-black bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              Página {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl transition-all border border-white/5 shadow-lg active:scale-95"
            >
              Próxima
            </button>
            <button
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl transition-all border border-white/5 shadow-lg active:scale-95"
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
