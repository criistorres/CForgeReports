/**
 * Utilitário para mapear erros da API em mensagens amigáveis ao usuário
 */

interface ErrorResponse {
  erro?: string
  detail?: string
  message?: string
  non_field_errors?: string[]
  [key: string]: any
}

export function getErrorMessage(error: any): string {
  // Se já é uma string, retorna
  if (typeof error === 'string') {
    return error
  }

  // Se é um objeto de resposta da API
  if (error?.response?.data) {
    const data: ErrorResponse = error.response.data

    // Mensagem de erro específica
    if (data.erro) {
      return data.erro
    }

    // Detail do DRF
    if (data.detail) {
      return data.detail
    }

    // Message genérica
    if (data.message) {
      return data.message
    }

    // Non-field errors
    if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0]
    }

    // Erros de campo específicos
    const fieldErrors = Object.entries(data)
      .filter(([key]) => key !== 'detail' && key !== 'message' && key !== 'erro')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value[0]}`
        }
        return `${key}: ${value}`
      })

    if (fieldErrors.length > 0) {
      return fieldErrors[0]
    }
  }

  // Erro de rede
  if (error?.message) {
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }
    return error.message
  }

  // Status code específicos
  if (error?.response?.status) {
    const status = error.response.status
    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique os campos preenchidos.'
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Você não tem permissão para realizar esta ação.'
      case 404:
        return 'Recurso não encontrado.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
      default:
        return `Erro ${status}. Tente novamente.`
    }
  }

  // Fallback
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

/**
 * Mapeia erros específicos de autenticação
 */
export function getAuthErrorMessage(error: any): string {
  const message = getErrorMessage(error)

  // Mensagens específicas de autenticação
  if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
    return 'Email ou senha incorretos. Verifique suas credenciais.'
  }

  if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expired')) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  if (message.toLowerCase().includes('inactive') || message.toLowerCase().includes('disabled')) {
    return 'Sua conta está desativada. Entre em contato com o administrador.'
  }

  return message
}

/**
 * Mapeia erros específicos de conexão de banco
 */
export function getConnectionErrorMessage(error: any): string {
  const message = getErrorMessage(error)

  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('connection timeout')) {
    return 'Tempo de conexão esgotado. Verifique se o servidor está acessível e a porta está correta.'
  }

  if (message.toLowerCase().includes('authentication') || message.toLowerCase().includes('login failed')) {
    return 'Credenciais inválidas. Verifique usuário e senha.'
  }

  if (message.toLowerCase().includes('database') && message.toLowerCase().includes('not found')) {
    return 'Banco de dados não encontrado. Verifique o nome do database.'
  }

  if (message.toLowerCase().includes('server') && message.toLowerCase().includes('not found')) {
    return 'Servidor não encontrado. Verifique o host e a porta.'
  }

  if (message.toLowerCase().includes('driver') || message.toLowerCase().includes('odbc')) {
    return 'Driver ODBC não encontrado. Instale o driver apropriado para o banco de dados.'
  }

  return message
}

