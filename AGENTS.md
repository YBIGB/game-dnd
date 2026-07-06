# DND 跑团游戏 — AI 助手指南

## 项目概述

这是一个基于 **Vue 3 + Vite** 的 D&D 风格跑团（桌面角色扮演）Web 游戏。此项目属于**前端底座搭建**阶段，是所有后续功能的前置条件，优先级最高。底座完工后，团队成员可在此之上并行开发各功能模块（预期至少支撑 3 人并行无冲突）。

## 技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | 当前前端主流框架 |
| 路由 | Vue Router 4（`createWebHistory`，懒加载） | 管理所有页面跳转 |
| 状态管理 | Pinia（组合式 Store） | Vue 3 官方推荐，轻量且类型安全 |
| UI 组件库 | **Element Plus** | 已选定，团队统一使用，避免选型分歧 |
| 构建工具 | Vite 6 | 仅 `@vitejs/plugin-vue` 插件 |

## 目录约定

```
dnd-game/
├── public/            # 公共静态资源（当前为空）
├── src/
│   ├── pages/         # 页面组件，每个路由对应一个文件
│   │   ├── Login.vue
│   │   ├── CreateCharacter.vue
│   │   ├── Tavern.vue
│   │   └── Dungeon.vue
│   ├── components/    # 通用业务组件（可被多个页面复用）
│   │   └── CharacterStatusBar.vue   # 底部角色状态栏（HP/金币/持有物/钥匙/线索）
│   ├── stores/        # Pinia 状态仓库
│   │   ├── auth.js         # 登录态（用户名、登入/登出）
│   │   ├── character.js    # 角色相关状态（列表 + 当前角色）
│   │   └── dungeon.js      # 副本临时状态
│   ├── router/
│   │   └── index.js    # 集中式路由配置（懒加载 + meta.title）
│   ├── assets/         # 静态资源
│   │   ├── global.css  # 全局暗黑奇幻主题样式 + Element Plus 暗色覆盖
│   │   └── (其他资源)
│   ├── App.vue         # 根组件，仅 <router-view />
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
  username: string  // 当前登录用户名，空字符串表示未登录
}
```

提供方法：`setUsername(name)`、`logout()`

### 角色数据（Character Store）

`src/stores/character.js` 维护的完整数据结构：

```js
{
  characters: [
    {
      id: number,            // 唯一标识
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

提供方法：`selectCharacter(character)`、`addCharacter(character)`、`initDemoData()`
提供计算属性：`characterCount`、`isCurrentCharacterAlive`

### 副本临时状态（Dungeon Store）

`src/stores/dungeon.js` 维护的完整数据结构：

```js
{
  dungeonState: {
    hasKey: boolean,        // 是否持有钥匙
    hasClue: boolean,       // 是否持有线索
    shopRobbed: boolean,    // 本副本是否已盗窃过
    graveDug: boolean,      // 本副本是否已挖掘过
    bossDefeated: boolean   // 本副本是否已击败头目
  }
}
```

提供方法：`resetDungeon()`

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
- 每个页面应保持独立、内聚，不要跨页面引用其他页面的内部组件。
- 若后续页面数量增多，可在路由配置中预留 `/game/*` 前缀或采用模块化路由结构以保持可扩展性。

### Store 开发
- 全局状态统一使用 Pinia 组合式 Store（`defineStore` + 函数式声明）。
- 新建 Store 时遵循以下模式：
  ```js
  import { defineStore } from "pinia"
  import { ref, computed } from "vue"

  export const useXxxStore = defineStore("xxx", () => {
    const state = ref(null)
    const computedValue = computed(() => state.value)
    function action() { /* 修改 state */ }
    return { state, computedValue, action }
  })
  ```

### 组件开发
- 通用业务组件放在 `src/components/`，文件名使用 **PascalCase**（如 `CharacterCard.vue`）。
- 页面内的私有子组件可直接放在 `pages/` 下对应页面的同级目录或以内联形式写在页面中。
- 全局层级的 UI 组件（如状态栏 `CharacterStatusBar`）也放在 `src/components/`。

### 并行开发约束
- **各自的文件互不重叠**：每个开发者负责各自的页面文件（`pages/*.vue`）和对应的 Store 模块（如需要）。底座文件（`router/index.js`、`main.js`、`App.vue`）不应被随意修改。
- **不要修改 `App.vue` 的结构** — 根组件仅保留 `<router-view />`。
- **不要修改 `main.js` 的挂载逻辑**。
- CSS：优先使用 `<style scoped>`，全局样式统一放在 `src/assets/global.css` 中。已预定义 CSS 变量（`--bg-primary`、`--bg-card`、`--border-color`、`--accent-gold` 等）和全局 class（`.page-container`、`.page-card`、`.placeholder-text`），页面开发时应优先复用这些公共样式。
- 避免硬编码魔法值，游戏常量（属性值、副本状态标记等）应定义在 Store 或独立的常量文件中。
- **UI 风格统一**：所有开发者统一使用 Element Plus 组件（`el-button`、`el-card`、`el-dialog`、`el-form` 等），不要在页面中混入其他 UI 库的组件。
- 如需使用 Element Plus 图标，统一从 `@element-plus/icons-vue` 导入。

### 路由设计要点
- 根路径 `/` 已配置为重定向到 `/login`。
- 登录页面验证通过后跳转到 `/tavern`（酒馆）。
- 酒馆页面已有"进入副本"按钮，应跳转到 `/dungeon`。
- 路由表中已无 `/lobby` 页面，相关逻辑整合到了酒馆页面中。

### 全局样式与主题
- 项目已内置暗黑奇幻主题，通过 `src/assets/global.css` 中的 CSS 变量控制。
- 提供了 `.page-container`（flex 居中的全屏容器）和 `.page-card`（居中卡片）等预设 class，新建页面时应优先使用。
- Element Plus 组件样式已有全局暗色覆盖，无需重复修改。

## 运行方式

```powershell
npm install       # 安装依赖
npm run dev       # 启动开发服务器 → http://localhost:5173（3分钟内应可访问）
npm run build     # 构建生产版本
npm run preview   # 预览构建产物
```

## 开发路线提示

当前页面状态：

| 路由路径 | 页面 | 状态 |
|----------|------|------|
| `/` | 重定向到 `/login` | — |
| `/login` | 登录 | ✅ 已实现（表单验证、mock 账号 admin/test、跳转酒馆） |
| `/create-character` | 创建角色 | ⏳ 占位 |
| `/tavern` | 酒馆 | ✅ 已实现（角色选择、状态详情、持有物/记录 tab、进入副本） |
| `/dungeon` | 副本 | ⏳ 占位（已引入状态栏） |

Store 已有基础结构：
- `auth.js` — `username`（当前登录用户名）、`setUsername()`、`logout()`
- `character.js` — `characters`（角色列表含 2 条示例数据）、`currentCharacter`（当前角色）、`characterCount`、`isCurrentCharacterAlive`、`selectCharacter()`、`addCharacter()`、`initDemoData()`
- `dungeon.js` — `dungeonState`（5 个副本标记位）、`resetDungeon()`

已实现的通用组件：
- `CharacterStatusBar.vue` — 底部固定状态栏，显示当前角色的 HP 进度条（绿/黄/红状态色）、金币、持有物总数、钥匙/线索图标

## 验收标准（供 AI 验证参考）

1. **启动验证**：`npm install && npm run dev` 能在 3 分钟内启动，浏览器访问显示页面
2. **路由验证**：手动输入 4 个路由路径（`/login`、`/create-character`、`/tavern`、`/dungeon`），每个都正确渲染对应的页面组件
3. **状态验证**：控制台执行 `useCharacterStore().characters` 返回包含 2 条示例数据的数组；执行 `useAuthStore().username` 返回空字符串
4. **目录规范**：新增页面/组件/Store 时有明确的存放位置可循

## 新人入职参考

同目录下的 `GUIDE.md` 是面向开发者的中文入门文档，包含快速启动、目录说明与新建页面/Store 的示例。AI 助手在修改代码前应优先阅读本 AGENTS.md 了解项目约定，确保改动与现有架构一致。
### 语言约定
- 所有思考过程、审批请求、代码注释、与用户的交流统一使用**中文**。