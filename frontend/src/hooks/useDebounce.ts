import { useState, useEffect } from 'react'

/**
 * Hook para fazer debounce de valores
 * Útil para otimizar chamadas de API em campos de busca
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Configura o timer
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Limpa o timer se o valor mudar antes do delay
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
