import axios from "axios"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthTokens, refreshToken } from "./authService"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


api.interceptors.response.use(
  res => res,
  async (error) => {

    const originalRequest = error.config
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (error.response?.status === 401 && !originalRequest._retry && currentRefreshToken) {

      originalRequest._retry = true
      try {
        const response = await refreshToken(currentRefreshToken)

        localStorage.setItem(ACCESS_TOKEN_KEY, response.token)
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)

        originalRequest.headers.Authorization = `Bearer ${response.token}`

        return api(originalRequest)
      } catch (refreshErr) {
        // Refresh token failed → log out immediately.
        clearAuthTokens()
        window.location.replace("/")
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default api