import { defineStore } from "pinia"
import { ref } from "vue"

export const useAuthStore = defineStore("auth", () => {
  const username = ref("")

  function setUsername(name) {
    username.value = name
  }

  function logout() {
    username.value = ""
  }

  return { username, setUsername, logout }
})
