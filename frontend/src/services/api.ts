import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// Flag para evitar múltiplas tentativas simultâneas de refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor de requisição: adiciona token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de resposta: renova token expirado automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se o erro não é 401 ou já tentamos renovar, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Se já está renovando, enfileira a requisição
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }).catch(err => {
        return Promise.reject(err)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      // Sem refresh token, força logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      // Tenta renovar o token
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/token/refresh/`,
        { refresh: refreshToken }
      )

      const { access } = response.data

      // Atualiza o token no localStorage
      localStorage.setItem('access_token', access)

      // Atualiza o header da requisição original
      originalRequest.headers.Authorization = `Bearer ${access}`

      // Processa fila de requisições pendentes
      processQueue(null, access)

      // Retenta a requisição original
      return api(originalRequest)
    } catch (refreshError) {
      // Refresh falhou, força logout
      processQueue(refreshError, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
