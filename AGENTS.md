# DND 跑团游戏 — AI 助手指南

## 项目概述

这是一个基于 **Vue 3 + Vite** 的 D&D 风格跑团（桌面角色扮演）Web 游戏。前端底座已搭建完成，所有页面已实现，API 层已就绪等待对接后端。

## 技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | 当前前端主流框架 |
| 路由 | Vue Router 4（`createWebHistory`，懒加载） | 管理所有页面跳转 |
| 状态管理 | Pinia（组合式 Store） | Vue 3 官方推荐，轻量且类型安全 |
| UI 组件库 | **Element Plus** | 已选定，团队统一使用，避免选型分歧 |
| HTTP 请求 | **axios** | 封装在 `src/api/client.js` 中 |
| 构建工具 | Vite 6 | 仅 `@vitejs/plugin-vue` 插件 |

## 目录约定

```
dnd-game/
├── docs/              # 前后端交接文档
│   ├── API-CONTRACT.md      # 接口契约（与后端共享）
│   ├── BACKEND-DEV-GUIDE.md # 后端开发指引
│   └── FRONTEND-TASKS.md    # 前端改造任务清单（已归档）
├── public/            # 公共静态资源（当前为空）
├── src/
│   ├── pages/         # 页面组件，每个路由对应一个文件
│   │   ├── Login.vue
│   │   ├── CreateCharacter.vue
│   │   ├── Tavern.vue
│   │   └── Dungeon.vue
│   ├── api/           # API 请求层（后端接口调用）
│   │   ├── client.js       # axios 封装（baseURL + Token 注入 + 响应拦截）
│   │   ├── index.js        # 统一导出
│   │   ├── auth.js         # loginApi / registerApi
│   │   ├── character.js    # CRUD 四个接口
│   │   └── dungeon.js      # dungeonActionApi
│   ├── types/         # 类型定义
│   │   └── api.js          # 所有 API 请求/响应类型（JsDoc 格式）
│   ├── components/    # 通用业务组件（可被多个页面复用）
│   │   ├── CharacterStatusBar.vue   # 底部角色状态栏
│   │   ├── GameModal.vue            # 弹窗组件
│   │   ├── ModalRenderer.vue        # 弹窗渲染器
│   │   └── JudgementContent.vue     # 掷骰判定结果展示
│   ├── stores/        # Pinia 状态仓库
│   │   ├── auth.js         # 登录态（token + username + 登录/注册/登出）
│   │   ├── character.js    # 角色相关状态（列表 + 当前角色，走 API）
│   │   ├── dungeon.js      # 副本临时状态（7 个标记位）
│   │   └── modal.js        # 弹窗栈管理
│   ├── utils/
│   │   └── modalHelper.js  # showPrompt / showJudgement 辅助函数
│   ├── router/
│   │   └── index.js    # 集中式路由配置（懒加载 + meta.title + 导航守卫）
│   ├── assets/
│   │   ├── global.css  # 全局暗黑奇幻主题样式 + Element Plus 暗色覆盖
│   │   └── tavern-bg.png
│   ├── App.vue         # 根组件（<router-view /> + <ModalRenderer />）
│   └── main.js         # 入口（挂载 Pinia + Router + Element Plus + 全局样式）
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置（port: 5173, host: true）
├── AGENTS.md           # 本文件 — AI 助手开发约定
├── GUIDE.md            # 面向开发者的中文入门文档
└── package.json
```

## 数据结构定义

### 登录态（Auth Store）

`src/stores/auth.js` 维护的完整数据结构：

```js
{
  username: string,  // 当前登录用户名，空字符串表示未登录
  token: string,     // JWT Token，空字符串表示未登录
}
```

提供方法：`login(username, password)`（调 API）、`register(username, password)`（调 API）、`logout()`（清除全部）、`initFromStorage()`（从 localStorage 恢复 token）
提供计算属性：`isLoggedIn`

### 角色数据（Character Store）

`src/stores/character.js` 维护的完整数据结构：

```js
{
  characters: [
    {
      id: number,            // 唯一标识（由后端分配）
      name: string,          // 角色名
      level: number,         // 等级
      hp: number,            // 当前生命
      maxHp: number,         // 最大生命
      gold: number,          // 金币数
      stats: {               // 六维属性
        strength: number,     // 力量
        dexterity: number,    // 敏捷
        constitution: number, // 体质
        intelligence: number, // 智力
        wisdom: number,       // 感知
        charisma: number      // 魅力
      },
      inventory: [           // 持有物列表
        { name: string, qty: number }
      ],
      completedDungeons: string[], // 已通关副本名称列表
      isAlive: boolean       // 是否存活
    }
  ],
  currentCharacter: Character | null // 当前选中的角色
}
```

提供方法：`selectCharacter(character)`、`fetchCharacters()`（调 API）、`addCharacter(character)`（调 API）、`removeCharacter(id)`（调 API）、`updateCharacter(id, data)`（调 API）
提供计算属性：`characterCount`、`isCurrentCharacterAlive`
提供状态：`loading`（加载中）

> 注意：`initDemoData()` 已移除，不再有硬编码示例数据。角色数据全部通过 API 从后端获取。

### 副本临时状态（Dungeon Store）

`src/stores/dungeon.js` 维护的完整数据结构：

```js
{
  dungeonState: {
    hasKey: boolean,          // 是否持有钥匙
    hasClue: boolean,         // 是否持有线索
    shopRobbed: boolean,      // 本副本是否已盗窃过
    shopTradeDone: boolean,   // 本副本是否已交易过
    graveDug: boolean,        // 本副本是否已挖掘过
    graveInsightDone: boolean,// 本副本是否已灵感判定过
    bossDefeated: boolean     // 本副本是否已击败头目
  }
}
```

提供方法：`resetDungeon()`、`applyServerUpdates(updates)`（合并后端返回的状态）

## 开发规范

### 编码约定
- 所有源文件（.vue、.js、.css、.md、.html）统一使用 **UTF-8 编码并带 BOM（字节顺序标记）**。
- 严禁使用 GBK、GB2312、UTF-16 等其他编码，以免多会话编辑时中文变为乱码。
- Vite/Vue 工具链对 UTF-8 BOM 兼容良好，无需担心副作用。

### 页面开发
- 所有页面组件必须放在 `src/pages/`，使用 **Composition API + `<script setup>`**。
- 路由统一在 `src/router/index.js` 中配置，必须使用 **懒加载**：
  ```js
  { path: "/your-path", name: "YourName", component: () => import("../pages/YourPage.vue"), meta: { title: "页面标题" } }
  ```
- 路由守卫规定：`requiresAuth: true` 的路由在无 token 时自动重定向到 `/login`。
- 每个页面应保持独立、内聚，不要跨页面引用其他页面的内部组件。

### Store 开发
- 全局状态统一使用 Pinia 组合式 Store（`defineStore` + 函数式声明）。
- Store 中涉及数据持久化的操作应调 `src/api/` 中的函数，不要在 Store 中直接使用 axios。
- API 调用失败时应有合理的降级处理（catch 中 fallback 或清空数据）。

### API 层开发
- 所有后端请求封装在 `src/api/` 目录下，每个模块一个文件。
- `client.js` 已统一处理：baseURL、Token 注入、响应解包、网络错误提示。
- 新增 API 函数时引用 `client.js` 的默认导出，不新建 axios 实例。
- 新增 API 模块后在 `src/api/index.js` 中导出。

### 组件开发
- 通用业务组件放在 `src/components/`，文件名使用 **PascalCase**（如 `CharacterCard.vue`）。
- 页面内的私有子组件可直接放在 `pages/` 下对应页面的同级目录或以内联形式写在页面中。

### 并行开发约束
- **各自的文件互不重叠**：每个开发者负责各自的页面文件（`pages/*.vue`）和对应的 Store 模块（如需要）。底座文件（`router/index.js`、`main.js`、`App.vue`）不应被随意修改。
- **不要修改 `App.vue` 的结构** — 根组件仅保留 `<router-view />` + `<ModalRenderer />`。
- **不要修改 `main.js` 的挂载逻辑**。
- CSS：优先使用 `<style scoped>`，全局样式统一放在 `src/assets/global.css` 中。已预定义 CSS 变量（`--bg-primary`、`--bg-card`、`--border-color`、`--accent-gold` 等）和全局 class（`.page-container`、`.page-card`、`.placeholder-text`），页面开发时应优先复用这些公共样式。
- 避免硬编码魔法值，游戏常量（属性值、副本状态标记等）应定义在 Store 或独立的常量文件中。
- **UI 风格统一**：所有开发者统一使用 Element Plus 组件（`el-button`、`el-card`、`el-dialog`、`el-form` 等），不要在页面中混入其他 UI 库的组件。
- 如需使用 Element Plus 图标，统一从 `@element-plus/icons-vue` 导入。

### 路由设计要点
- 根路径 `/` 已配置为重定向到 `/login`。
- 登录/注册成功后跳转到 `/tavern`（酒馆）。
- 酒馆页面已有"进入副本"按钮，跳转到 `/dungeon`。

### 全局样式与主题
- 项目已内置暗黑奇幻主题，通过 `src/assets/global.css` 中的 CSS 变量控制。
- 提供了 `.page-container`（flex 居中的全屏容器）和 `.page-card`（居中卡片）等预设 class，新建页面时应优先使用。
- Element Plus 组件样式已有全局暗色覆盖，无需重复修改。

## 运行方式

```powershell
npm install       # 安装依赖
npm run dev       # 启动开发服务器 → http://localhost:5173
npm run build     # 构建生产版本
npm run preview   # 预览构建产物
```

后端未就绪时，副本页面会自动回退到本地逻辑，不影响游玩；登录/注册和角色管理需要后端提供服务。

## 页面状态

| 路由路径 | 页面 | 状态 |
|----------|------|------|
| `/` | 重定向到 `/login` | — |
| `/login` | 登录 | ✅ 已实现（登录/注册切换，Token 机制，路由守卫） |
| `/create-character` | 创建角色 | ✅ 已实现（属性分配 UI，调 API 创建） |
| `/tavern` | 酒馆 | ✅ 已实现（角色列表、详情、持有物/记录 tab、遣散） |
| `/dungeon` | 副本 | ✅ 已实现（地图、场景、7 种行动，API 优先+本地回退） |

## 验收标准（供 AI 验证参考）

1. **启动验证**：`npm install && npm run dev` 能在 3 分钟内启动
2. **路由验证**：手动输入 4 个路由路径，每个都正确渲染对应的页面组件
3. **构建验证**：`npm run build` 无错误通过
4. **规范验证**：所有源文件 UTF-8 BOM，`pages/`、`components/`、`stores/`、`api/`、`types/` 目录结构完整

## 跨项目协作约定

后端（独立项目）与本前端项目通过 docs/ 目录下的文档进行沟通，不再通过其他渠道传递接口信息。

| 文档 | 用途 | 共享方 |
|------|------|--------|
| `docs/API-CONTRACT.md` | 完整接口契约，双方共同遵守 | 前后端共享 |
| `docs/BACKEND-DEV-GUIDE.md` | 后端任务跟踪表 + 注意事项 | 前端维护，后端参考 |

**状态跟踪机制：**

- `BACKEND-DEV-GUIDE.md` 中每个后端任务有唯一标识 `[AUTH-01]`、`[CHAR-02]` 等
- 新增任务时标记待实现，后端完成告知后改为已完成
- 状态变更通过更新该 MD 文件完成，后端不需要改此文件

**协作流程：**

1. 前端需要新增/修改接口 同步更新 `docs/API-CONTRACT.md` 和 `docs/BACKEND-DEV-GUIDE.md`
2. 新任务在 `BACKEND-DEV-GUIDE.md` 中标记为待实现
3. 后端实现完成后告知前端
4. 前端验证联调通过 改为已完成

**编码约定**

- 所有 `docs/` 下的 `.md` 文件统一使用 UTF-8 编码并带 BOM，与源文件一致
- API 类型定义以 `API-CONTRACT.md` 为准，前端 `src/types/api.js` 和 `src/api/` 为其实现
- **代码边界**：前后端互为独立项目，双方 AI 均不得直接通读对方源码。需要同步状态时，前端会修改自己 docs/ 目录下的文档，一切任务交接以文档为准。后端完成后由你告知前端去更新对应的状态标识
outes/、models/ 等目录

## 新人入职参考

同目录下的 `GUIDE.md` 是面向开发者的中文入门文档。前后端协作约定详见上方【跨项目协作约定】章节。

### 语言约定
- 所有思考过程、审批请求、代码注释、与用户的交流统一使用**中文**。