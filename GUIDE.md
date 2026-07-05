# DND 跑团游戏 — 新人上手文档

## 快速启动
```powershell
cd E:\360\game-try
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`，默认跳转到登录页。

测试账号：admin / test，密码：123456

## 目录结构

```
src/
├── pages/              # 页面组件（每个路由一个文件）
│   ├── Login.vue
│   ├── CreateCharacter.vue
│   ├── Tavern.vue
│   └── Dungeon.vue
├── components/         # 通用业务组件
│   └── CharacterStatusBar.vue
├── stores/             # Pinia 状态仓库
│   ├── auth.js         # 登录态：用户名、登入/登出
│   ├── character.js    # 角色列表、当前角色（含示例数据）
│   └── dungeon.js      # 副本临时状态
├── router/
│   └── index.js        # 路由配置（懒加载）
├── assets/
│   └── global.css      # 全局暗黑奇幻主题样式
├── App.vue             # 根组件（仅 <router-view />）
└── main.js             # 入口文件
```

## 如何新建页面

1. 在 `src/pages/` 下新建 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由配置（使用懒加载）：
   ```js
   { path: '/your-path', name: 'YourName', component: () => import('../pages/YourPage.vue'), meta: { title: '页面标题' } }
   ```
3. 新建页面时优先使用全局预设样式：`page-container`、`page-card`、`placeholder-text`

## 如何新建 Store

1. 在 `src/stores/` 下新建 `.js` 文件
2. 使用 `defineStore` 定义：
   ```js
   import { defineStore } from 'pinia'
   import { ref, computed } from 'vue'
   export const useYourStore = defineStore('your-name', () => {
     const data = ref([])
     return { data }
   })
   ```

## 技术栈

- Vue 3 (Composition API) + Vue Router 4 + Pinia + Element Plus + Vite

## 开发约定

- 所有页面组件放在 `pages/`，通用组件放在 `components/`
- 路由统一在 `router/index.js` 中配置（懒加载）
- 全局状态统一放在 Pinia Store 中管理
- 后续功能模块可并行开发，每人负责不同的页面/Store
- 优先使用 Element Plus 组件，样式使用 `<style scoped>`
