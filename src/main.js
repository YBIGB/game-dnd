import { createApp } from "vue"
import { createPinia } from "pinia"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "./assets/global.css"
import App from "./App.vue"
import router from "./router"
import { showPrompt, showJudgement } from "./utils/modalHelper"

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 注册全局弹窗方法，方便模板中直接调用
app.config.globalProperties.$modal = { showPrompt, showJudgement }

app.mount("#app")
