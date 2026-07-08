# DND 跑团游戏 — 前端改造任务清单（mock 转后端对接）

> 本文档仅包含**前端项目 `E:\360\game-try` 需要改动的部分**，
> 后端接口定义详见同目录下的 `API-CONTRACT.md`。
> 任务按阶段排列，各阶段独立可验证。

---

## 阶段零：基础设施搭建 — `src/api/` 服务层 + 共享类型

> **前置条件**：无，可立即开始
> **产出**：API 调用骨架 + 类型定义，所有页面功能不受影响

### 任务 0.1 新建 `src/types/` 目录及类型定义

```
src/types/
└── api.js              # 所有 API 请求/响应的类型定义
```

**改动清单：**

- 新建 `src/types/api.js`，内容直接复制 `API-CONTRACT.md` 中的类型定义（JsDoc 格式注释即可，纯 JS 项目无需 TypeScript 编译）
- 类型定义覆盖：统一响应结构、各接口 Request/Response、CharacterDTO、RollResult

---

### 任务 0.2 新建 `src/api/` 请求工具层

```
src/api/
├── client.js           # axios 封装：baseURL、Token 注入、响应拦截
├── index.js            # 统一导出所有 API 模块
├── auth.js             # 认证相关 API（本阶段先导出空壳）
├── character.js        # 角色相关 API（本阶段先导出空壳）
└── dungeon.js          # 副本相关 API（本阶段先导出空壳）
```

**改动清单：**

- 安装依赖：`npm install axios`
- 新建 `src/api/client.js`：
  - `baseURL` 配置为 `http://localhost:3000/api`（后续可通过环境变量 `VITE_API_BASE` 覆盖）
  - 请求拦截器：从 localStorage 读取 token 注入 `Authorization` 头
  - 响应拦截器：统一解包 `response.data`，code 非零时 Promise.reject
- 新建 `src/api/auth.js` / `character.js` / `dungeon.js`：
  - 每个文件导出空函数壳，函数签名与 `API-CONTRACT.md` 对应
  - 函数体暂时 `return Promise.reject(new Error("API not implemented"))`
- 新建 `src/api/index.js`：合并导出三个模块

**验收标准：**

- `npm install` 通过，axios 安装成功
- `src/types/api.js` 可用 JsDoc 被 IDE 识别
- 页面运行不受影响（API 函数未被调用，无引用报错）

---

## 阶段一：账号认证 — Login.vue → 后端 API

> **前置条件**：阶段 0 完成，且后端已完成 `POST /api/auth/register` 和 `POST /api/auth/login`
> **产出**：登录/注册走后端，Token 机制建立，路由守卫生效
> **改动文件**：5 个（2 新建 + 3 修改）

### 任务 1.1 实现 `src/api/auth.js`

- 实现 `loginApi({ username, password })` → 调用 `POST /api/auth/login`
- 实现 `registerApi({ username, password })` → 调用 `POST /api/auth/register`

### 任务 1.2 改造 `src/stores/auth.js`

| 改动 | 说明 |
|------|------|
| 新增 `token` ref(`""`) | 存储 JWT |
| 新增 `isLoggedIn` 计算属性 | 返回 `!!token.value` |
| 改造 `setUsername(name)` → `login(username, token)` | 同时保存 username 和 token，写入 localStorage |
| 新增 `register(username, password)` | 调 API 注册，成功后自动登录 |
| 新增 `initFromStorage()` | 从 localStorage 恢复 username + token |
| 改造 `logout()` | 清除 username + token + localStorage，路由跳转 `/login` |

### 任务 1.3 改造 `src/pages/Login.vue`

- 移除 `VALID_ACCOUNTS`、`VALID_PASSWORD`、`await new Promise(r => setTimeout(r, 600))` 模拟延迟
- 登录逻辑改为调用 `authStore.login(form.account, form.password)`
- 新增"注册"按钮或切换模式：`registerMode` 切换登录/注册表单
- 注册模式下调用 `authStore.register(form.account, form.password)`
- 登录/注册失败时提示后端返回的错误信息

### 任务 1.4 改造 `src/router/index.js`

- 新增全局导航守卫 `router.beforeEach`
- 检查目标路由 meta 是否需要登录（`/tavern`、`/dungeon`、`/create-character` 需要）
- 未登录时重定向到 `/login`

### 任务 1.5 改造 `src/main.js`

- 在 app 挂载前调用 `authStore.initFromStorage()` 恢复登录态

**验收标准：**

- 进入首页自动跳转登录页
- 可注册新账号
- 用注册的账号可登录成功
- 错误密码显示后端返回的错误提示
- 刷新页面后登录态保持
- 登出后回到登录页，直接访问 `/tavern` 被拦截

---

## 阶段二：角色管理 — Create + List + 持久化

> **前置条件**：阶段一完成（有 Token 机制）
> **产出**：角色数据持久化到后端，移除所有 demo 数据
> **改动文件**：4 个（1 新建 + 3 修改）

### 任务 2.1 实现 `src/api/character.js`

- `fetchCharactersApi()` → `GET /api/characters`
- `createCharacterApi({ name, stats })` → `POST /api/characters`
- `updateCharacterApi(id, partialData)` → `PUT /api/characters/:id`
- `deleteCharacterApi(id)` → `DELETE /api/characters/:id`

### 任务 2.2 改造 `src/stores/character.js`

| 改动 | 说明 |
|------|------|
| 新增 `loading` ref | 加载状态 |
| 重构 `fetchCharacters()` | 调 API 获取，覆盖本地 `characters` |
| 重构 `addCharacter(character)` | 调 API 创建，成功后 push 返回的真实角色 |
| 重构 `removeCharacter(id)` | 调 API 删除，成功后移除本地 |
| 新增 `updateCharacter(id, data)` | 调 API 更新（HP/金币/物品等变更） |
| **移除 `initDemoData()`** | 不再需要 demo 数据 |
| 挂载自动初始化 | `initFromStorage()` 后若 token 存在则自动 `fetchCharacters()` |

### 任务 2.3 改造 `src/pages/CreateCharacter.vue`

- 创建逻辑改为调用 `characterStore.addCharacter({ name: 表单值, stats: 表单属性 })`
- 提交成功后 `router.push("/tavern")` 保持不变

### 任务 2.4 改造 `src/pages/Tavern.vue`

- 已选中角色详情页面中，遣散操作调用 `characterStore.removeCharacter(id)`
- 无需其他 UI 改动（store 层已封装 API 调用）

**验收标准：**

- 创建的角色刷新后依然存在
- 遣散角色后刷新不再出现
- 两个账号角色互不可见
- 页面首次加载时看到「加载中」状态（如果网络慢）

---

## 阶段三：副本系统 — 掷骰判定后端化

> **前置条件**：阶段二完成（角色 CRUD 走 API）
> **产出**：所有判定由后端执行，前端仅展示结果
> **改动文件**：3 个（1 新建 + 2 修改）

### 任务 3.1 实现 `src/api/dungeon.js`

- `dungeonActionApi({ actionId, characterId, dungeonState })` → `POST /api/dungeon/action`

### 任务 3.2 改造 `src/stores/dungeon.js`

- 保持现有的 `dungeonState`（用于 UI 展示）
- 新增 `applyServerUpdates(updates)` 方法：将后端返回的 `dungeonUpdates` 合并到本地 state
- 新增 `applyCharacterUpdate(updates)` 方法：将后端返回的角色变更应用到 character store

### 任务 3.3 改造 `src/pages/Dungeon.vue`

- 所有 `handleAction()` 中的业务逻辑改为调 `dungeonActionApi`：
  - `handleShopTrade()` → 调 API → 展示返回的 message
  - `handleShopSteal()` → 调 API → 用返回的 RollResult 显示判定弹窗
  - `handleGraveDig()` → 调 API → 处理返回
  - `handleGraveInsight()` → 调 API → 展示判定
  - `handleBossFight()` → 调 API → 展示判定
  - `handleBossPersuade()` → 调 API → 展示结果
  - `handleExitLeave()` → 调 API → 成功后推入通关记录 + 跳转酒馆
- 保留 `rollD20` 函数仅用于计算 modifier（前端展示用），最终结果以后端为准
- 副本中修改角色数据（addItem/removeItem）改为待后端返回后更新

**验收标准：**

- 每个需要掷骰的行动，后端返回真实随机结果
- 同一操作多次调用，结果不同
- 角色 HP/金币/物品变更由后端控制，刷新后持久保持
- 无法通过前端篡改判定结果

---

## 后续待办（Future TODO）

以下为当前阶段不包含、但值得记录的优化方向：

| 优先级 | 事项 | 说明 |
|--------|------|------|
| P2 | 加载状态 UI | API 调用期间显示 loading 骨架屏或局部加载指示器 |
| P2 | 网络错误处理 | API 调用失败时显示友好提示（`el-message`），提供重试 |
| P3 | 环境变量化 | `VITE_API_BASE` 区分开发/生产环境 |
| P3 | 商店购物功能 | 后端配置商品列表和价格，前端展示购物弹窗 |
| P3 | 副本通关历史 | 后端记录每次副本挑战的详细日志，前端可查看 |
| P3 | 沉浸式剧情文本 | 后端返回场景描述，支持分支剧情 |

---

## 附录：前端文件改动总览

```
动作      文件路径                                   涉及阶段
───      ─────────                                  ──────
新建      src/types/api.js                          阶段 0
新建      src/api/client.js                         阶段 0
新建      src/api/index.js                          阶段 0
新建      src/api/auth.js                           阶段 0 → 阶段 1 填充
新建      src/api/character.js                      阶段 0 → 阶段 2 填充
新建      src/api/dungeon.js                        阶段 0 → 阶段 3 填充
修改      src/stores/auth.js                        阶段 1
修改      src/pages/Login.vue                       阶段 1
修改      src/router/index.js                       阶段 1
修改      src/main.js                               阶段 1
修改      src/stores/character.js                   阶段 2
修改      src/pages/CreateCharacter.vue             阶段 2
修改      src/pages/Tavern.vue                      阶段 2
修改      src/stores/dungeon.js                     阶段 3
修改      src/pages/Dungeon.vue                     阶段 3
```

> 其中 `API-CONTRACT.md` 和本文件位于项目根目录，前者给后端用，后者给前端开发者用。
