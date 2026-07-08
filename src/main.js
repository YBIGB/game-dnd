import { createApp } from "vue"
import { createPinia } from "pinia"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "./assets/global.css"
import App from "./App.vue"
import router from "./router"
import { useAuthStore } from "./stores/auth"
import { showPrompt, showJudgement } from "./utils/modalHelper"

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 注册全局弹窗方法
app.config.globalProperties.$modal = { showPrompt, showJudgement }

// 启动时恢复登录态（从 localStorage 读取 token）
useAuthStore().initFromStorage()

app.mount("#app")
