import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue'), meta: { title: '登录' } },
  { path: '/lobby', name: 'Lobby', component: () => import('../pages/Lobby.vue'), meta: { title: '大厅' } },
  { path: '/create-character', name: 'CreateCharacter', component: () => import('../pages/CreateCharacter.vue'), meta: { title: '创建角色' } },
  { path: '/tavern', name: 'Tavern', component: () => import('../pages/Tavern.vue'), meta: { title: '酒馆' } },
  { path: '/dungeon', name: 'Dungeon', component: () => import('../pages/Dungeon.vue'), meta: { title: '副本' } },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
