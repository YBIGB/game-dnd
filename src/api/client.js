import axios from "axios"

// 可通过环境变量覆盖 API 地址，默认指向本地开发后端
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api"

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

// ── 请求拦截：自动注入 Token ──
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── 响应拦截：统一解包，错误处理 ──
client.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code !== 0) {
      const err = new Error(body.message || "请求失败")
      err.code = body.code
      return Promise.reject(err)
    }
    return body.data
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      return Promise.reject(new Error("网络连接失败，请检查后端服务是否启动"))
    }
    if (error.response) {
      const msg = error.response.data?.message || `请求错误 (${error.response.status})`
      return Promise.reject(new Error(msg))
    }
    return Promise.reject(error)
  }
)

export default client
