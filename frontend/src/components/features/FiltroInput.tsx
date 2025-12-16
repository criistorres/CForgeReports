/**
 * Componente para input de valores de filtros.
 * Usado na execução de relatórios para preencher parâmetros.
 */
import type { Filtro } from './FiltroForm'

interface FiltroInputProps {
  filtro: Filtro
  value: any
  onChange: (value: any) => void
}

export default function FiltroInput({ filtro, value, onChange }: FiltroInputProps) {
  const renderInput = () => {
    switch (filtro.tipo) {
      case 'DATA':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            required={filtro.obrigatorio}
            placeholder={filtro.valor_padrao}
          />
        )

      case 'TEXTO':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            required={filtro.obrigatorio}
            placeholder={filtro.valor_padrao || 'Digite um valor...'}
          />
        )

      case 'NUMERO':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            required={filtro.obrigatorio}
            placeholder={filtro.valor_padrao}
            step="any"
          />
        )

      case 'LISTA':
        return (
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            required={filtro.obrigatorio}
          >
            <option value="">Selecione...</option>
            {(filtro.opcoes || []).map(opcao => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            required={filtro.obrigatorio}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {filtro.label}
        {filtro.obrigatorio && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {filtro.valor_padrao && !filtro.obrigatorio && (
        <p className="text-xs text-gray-400">Padrão: {filtro.valor_padrao}</p>
      )}
    </div>
  )
}
