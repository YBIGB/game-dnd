import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/create-character",
    name: "CreateCharacter",
    component: () => import("../pages/CreateCharacter.vue"),
    meta: { title: "创建角色", requiresAuth: true },
  },
  {
    path: "/tavern",
    name: "Tavern",
    component: () => import("../pages/Tavern.vue"),
    meta: { title: "酒馆", requiresAuth: true },
  },
  {
    path: "/dungeon",
    name: "Dungeon",
    component: () => import("../pages/Dungeon.vue"),
    meta: { title: "副本", requiresAuth: true },
  },
]

const router = createRouter({ history: createWebHistory(), routes })

// ── 全局导航守卫：未登录访问需登录页面时重定向到 /login ──
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem("token")
    if (!token) {
      return { path: "/login", query: { redirect: to.fullPath } }
    }
  }
})

export default router
