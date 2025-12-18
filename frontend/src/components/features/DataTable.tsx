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
      <div className="border border-slate-700/50 rounded-lg overflow-hidden min-w-0">
        <div className="overflow-x-auto overflow-y-auto min-w-0" style={{ maxHeight }}>
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-800 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-slate-500">
                              {{
                                asc: <ChevronUp className="w-4 h-4" />,
                                desc: <ChevronDown className="w-4 h-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDown className="w-4 h-4" />
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
            <tbody className="bg-slate-900/50 divide-y divide-slate-700/50">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-700/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap"
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors"
            >
              Primeira
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors"
            >
              Próxima
            </button>
            <button
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors"
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
