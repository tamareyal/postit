import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:3000"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


api.interceptors.response.use(
  res => res,
  async (error) => {

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")

      const response = await axios.post("/auth/refreshToken", {
        refreshToken
      })

      localStorage.setItem("accessToken", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken)

      originalRequest.headers.Authorization = `Bearer ${response.data.token}`

      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api