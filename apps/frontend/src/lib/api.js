import axios from 'axios'

const API_VERSION = import.meta.VITE_API_VERSION || '/api/v1'

const api = axios.create({
  baseURL: API_VERSION,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api