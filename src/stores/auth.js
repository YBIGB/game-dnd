import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { loginApi, registerApi } from "../api/auth"

export const useAuthStore = defineStore("auth", () => {
  const username = ref("")
  const token = ref("")

  const isLoggedIn = computed(() => !!token.value)

  // ── 初始化：从 localStorage 恢复登录态 ──
  function initFromStorage() {
    const savedToken = localStorage.getItem("token")
    const savedUsername = localStorage.getItem("username")
    if (savedToken && savedUsername) {
      token.value = savedToken
      username.value = savedUsername
    }
  }

  // ── 登录 ──
  async function login(loginUsername, loginPassword) {
    const data = await loginApi(loginUsername, loginPassword)
    token.value = data.token
    username.value = data.username
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.username)
  }

  // ── 注册 ──
  async function register(registerUsername, registerPassword) {
    const data = await registerApi(registerUsername, registerPassword)
    token.value = data.token
    username.value = data.username
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.username)
  }

  // ── 登出 ──
  function logout() {
    username.value = ""
    token.value = ""
    localStorage.removeItem("token")
    localStorage.removeItem("username")
  }

  return { username, token, isLoggedIn, initFromStorage, login, register, logout }
})
