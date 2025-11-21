import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

export const setAuthToken = (token: string | null | undefined): void => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }
  delete client.defaults.headers.common.Authorization
}

export default client
