import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimeoutOptions {
  /** Tempo de inatividade em milissegundos antes de chamar onInactive */
  timeout: number
  /** Callback chamado quando o usuário fica inativo */
  onInactive: () => void
  /** Se o hook está ativo ou não */
  enabled?: boolean
}

/**
 * Hook que detecta inatividade do usuário e executa uma ação após um período sem interação.
 *
 * @param options Configurações do hook
 *
 * @example
 * ```tsx
 * useInactivityTimeout({
 *   timeout: 15 * 60 * 1000, // 15 minutos
 *   onInactive: () => logout(),
 *   enabled: isAuthenticated
 * })
 * ```
 */
export function useInactivityTimeout({
  timeout,
  onInactive,
  enabled = true
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<number>()
  const onInactiveRef = useRef(onInactive)

  // Atualiza a referência do callback sem resetar o timer
  useEffect(() => {
    onInactiveRef.current = onInactive
  }, [onInactive])

  const resetTimer = useCallback(() => {
    // Limpa o timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Cria novo timer
    timeoutRef.current = setTimeout(() => {
      onInactiveRef.current()
    }, timeout)
  }, [timeout])

  useEffect(() => {
    if (!enabled) {
      // Se desabilitado, limpa o timer e não faz nada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      return
    }

    // Eventos que indicam atividade do usuário
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Inicia o timer
    resetTimer()

    // Adiciona listeners para todos os eventos
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    // Cleanup: remove listeners e limpa timer
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, resetTimer])
}
