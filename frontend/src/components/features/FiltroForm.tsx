/**
 * Componente para edição de filtros de um relatório.
 * Permite adicionar, editar, reordenar e remover filtros.
 */
import { useState } from 'react'

export interface Filtro {
  id?: string
  parametro: string
  label: string
  tipo: 'DATA' | 'TEXTO' | 'NUMERO' | 'LISTA'
  obrigatorio: boolean
  valor_padrao?: string
  opcoes?: string[]
  formato_data?: string
  ordem?: number
}

interface FiltroFormProps {
  filtros: Filtro[]
  onChange: (filtros: Filtro[]) => void
}

function FiltroForm({ filtros, onChange }: FiltroFormProps) {
  const [editandoOpcoes, setEditandoOpcoes] = useState<number | null>(null)
  const [opcoesTexto, setOpcoesTexto] = useState('')

  const adicionarFiltro = () => {
    const novoFiltro: Filtro = {
      parametro: '',
      label: '',
      tipo: 'TEXTO',
      obrigatorio: false,
      valor_padrao: '',
      opcoes: [],
      formato_data: ''
    }
    onChange([...filtros, novoFiltro])
  }

  const removerFiltro = (index: number) => {
    const novosFiltros = filtros.filter((_, i) => i !== index)
    onChange(novosFiltros)
  }

  const updateFiltro = (index: number, campo: keyof Filtro, valor: any) => {
    const novosFiltros = [...filtros]
    novosFiltros[index] = { ...novosFiltros[index], [campo]: valor }
    onChange(novosFiltros)
  }

  const moverFiltro = (index: number, direcao: 'cima' | 'baixo') => {
    if (
      (direcao === 'cima' && index === 0) ||
      (direcao === 'baixo' && index === filtros.length - 1)
    ) {
      return
    }

    const novosFiltros = [...filtros]
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1
    const temp = novosFiltros[index]
    novosFiltros[index] = novosFiltros[novoIndex]
    novosFiltros[novoIndex] = temp

    onChange(novosFiltros)
  }

  const abrirEditarOpcoes = (index: number) => {
    setEditandoOpcoes(index)
    setOpcoesTexto((filtros[index].opcoes || []).join('\n'))
  }

  const salvarOpcoes = () => {
    if (editandoOpcoes !== null) {
      const opcoes = opcoesTexto
        .split('\n')
        .map(op => op.trim())
        .filter(op => op.length > 0)
      updateFiltro(editandoOpcoes, 'opcoes', opcoes)
      setEditandoOpcoes(null)
      setOpcoesTexto('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Filtros do Relatório</h3>
        <button
          onClick={adicionarFiltro}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
        >
          + Adicionar Filtro
        </button>
      </div>

      {filtros.length === 0 ? (
        <div className="text-gray-400 text-center py-8 border border-dashed border-gray-600 rounded">
          Nenhum filtro configurado. Clique em "Adicionar Filtro" para começar.
        </div>
      ) : (
        filtros.map((filtro, idx) => (
          <div key={idx} className="bg-slate-700 p-4 rounded space-y-3">
            <div className="flex gap-3 items-start">
              {/* Parâmetro */}
              <div className="flex-shrink-0 w-40">
                <label className="text-xs text-gray-400 block mb-1">Parâmetro</label>
                <input
                  value={filtro.parametro}
                  onChange={e => updateFiltro(idx, 'parametro', e.target.value)}
                  placeholder="@parametro"
                  className={`w-full bg-slate-600 p-2 rounded text-white text-sm ${(!filtro.parametro || filtro.parametro === '@')
                    ? 'border-2 border-red-500'
                    : 'border border-slate-600'
                    }`}
                />
                {(!filtro.parametro || filtro.parametro === '@') && (
                  <span className="text-red-400 text-xs">Obrigatório</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Label</label>
                <input
                  value={filtro.label}
                  onChange={e => updateFiltro(idx, 'label', e.target.value)}
                  placeholder="Nome exibido ao usuário"
                  className="w-full bg-slate-600 p-2 rounded text-white text-sm"
                />
              </div>

              {/* Tipo */}
              <div className="flex-shrink-0 w-32">
                <label className="text-xs text-gray-400 block mb-1">Tipo</label>
                <select
                  value={filtro.tipo}
                  onChange={e => updateFiltro(idx, 'tipo', e.target.value)}
                  className="w-full bg-slate-600 p-2 rounded text-white text-sm"
                >
                  <option value="DATA">Data</option>
                  <option value="TEXTO">Texto</option>
                  <option value="NUMERO">Número</option>
                  <option value="LISTA">Lista</option>
                </select>
              </div>

              {/* Obrigatório */}
              <div className="flex-shrink-0 pt-6">
                <label className="text-white flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filtro.obrigatorio}
                    onChange={e => updateFiltro(idx, 'obrigatorio', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Obrigatório
                </label>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-1 pt-6">
                <button
                  onClick={() => moverFiltro(idx, 'cima')}
                  disabled={idx === 0}
                  className="text-gray-400 hover:text-white disabled:opacity-30"
                  title="Mover para cima"
                >
                  ↑
                </button>
                <button
                  onClick={() => moverFiltro(idx, 'baixo')}
                  disabled={idx === filtros.length - 1}
                  className="text-gray-400 hover:text-white disabled:opacity-30"
                  title="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  onClick={() => removerFiltro(idx)}
                  className="text-red-400 hover:text-red-300"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Opções (para tipo LISTA) */}
            {filtro.tipo === 'LISTA' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Opções</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-600 p-2 rounded text-white text-sm">
                    {filtro.opcoes && filtro.opcoes.length > 0
                      ? filtro.opcoes.join(', ')
                      : 'Nenhuma opção definida'}
                  </div>
                  <button
                    onClick={() => abrirEditarOpcoes(idx)}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            )}

            {/* Valor Padrão e Formato Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valor Padrão (opcional)</label>
                <input
                  value={filtro.valor_padrao || ''}
                  onChange={e => updateFiltro(idx, 'valor_padrao', e.target.value)}
                  placeholder="Valor padrão"
                  className="w-full bg-slate-600 p-2 rounded text-white text-sm"
                />
              </div>

              {filtro.tipo === 'DATA' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Formato Data</label>
                  <div className="flex gap-2">
                    <select
                      value={DATE_FORMATS.some(f => f.value === filtro.formato_data) ? filtro.formato_data : (filtro.formato_data ? 'custom' : '%Y-%m-%d')}
                      onChange={e => {
                        const val = e.target.value
                        updateFiltro(idx, 'formato_data', val === 'custom' ? '' : val)
                      }}
                      className="flex-1 bg-slate-600 p-2 rounded text-white text-sm"
                    >
                      {DATE_FORMATS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>

                    {(!DATE_FORMATS.some(f => f.value === filtro.formato_data) || filtro.formato_data === '') && (
                      <input
                        value={filtro.formato_data || ''}
                        onChange={e => updateFiltro(idx, 'formato_data', e.target.value)}
                        placeholder="Ex: %H:%M"
                        className="w-32 bg-slate-600 p-2 rounded text-white text-sm border border-primary-500"
                        title="Formato personalizado (padrão Python strftime)"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Modal para editar opções */}
      {editandoOpcoes !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h4 className="text-white text-lg mb-4">Editar Opções</h4>
            <p className="text-gray-400 text-sm mb-2">
              Digite uma opção por linha:
            </p>
            <textarea
              value={opcoesTexto}
              onChange={e => setOpcoesTexto(e.target.value)}
              className="w-full bg-slate-700 text-white p-3 rounded h-48 font-mono text-sm"
              placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={salvarOpcoes}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setEditandoOpcoes(null)
                  setOpcoesTexto('')
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DATE_FORMATS = [
  { label: 'Padrão (YYYY-MM-DD)', value: '%Y-%m-%d' },
  { label: 'Compacto (YYYYMMDD)', value: '%Y%m%d' },
  { label: 'Brasileiro (DD/MM/YYYY)', value: '%d/%m/%Y' },
  { label: 'Ano/Mês (YYYY-MM)', value: '%Y-%m' },
  { label: 'Mês/Ano (MM/YYYY)', value: '%m/%Y' },
  { label: 'Personalizado...', value: 'custom' },
]

export default FiltroForm
