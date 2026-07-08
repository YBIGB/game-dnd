# DND 跑团 — 后端开发指引

> 本文档面向**后端开发者**，说明当前前端已完成哪些对接工作、需要后端优先实现哪些接口。
> 完整接口契约详见同目录下的 `API-CONTRACT.md`。

## 状态标识说明

本文档使用以下状态标识跟踪后端任务进度：

| 标识 | 含义 |
|------|------|
| `📝` | 待实现（后端尚未开始） |
| `🔄` | 开发中（后端正在进行） |
| `✅` | 已完成（后端确认实现，前端已验证联调通过） |

> **协作流程**：前端更新本文档新增任务时统一标记为 `📝`；
> 后端实现完成后告知前端，前端验证通过后改为 `✅`。

---

## 当前前端状态

**全部 4 个阶段已完成**，前端已完全准备好对接后端。

| 阶段 | 内容 | 行为 |
|------|------|------|
| ✅ 阶段 0 | API 层骨架 | `src/api/` 目录 + axios 封装 + 类型定义 |
| ✅ 阶段 1 | 认证模块 | 登录/注册走 API，路由守卫，Token 机制 |
| ✅ 阶段 2 | 角色管理 | 角色 CRUD 全部走 API，移除 demo 数据 |
| ✅ 阶段 3 | 副本系统 | 行动调用 API，失败时回退本地逻辑保底 |

---

## 后端任务跟踪

### 🔴 [AUTH] 认证模块

```
POST /api/auth/register
POST /api/auth/login
```

| 任务 | 标识 | 状态 |
|------|------|------|
| 用户注册接口 | `[AUTH-01]` | 📝 |
| 用户登录接口 | `[AUTH-02]` | 📝 |
| JWT Token 签发与验证 | `[AUTH-03]` | 📝 |

**关键点：**

| 项目 | 要求 |
|------|------|
| 密码 | 至少 6 位（前端表单校验，后端也应校验） |
| 响应格式 | 统一 `{ code: 0, data: { token, username }, message: "ok" }` |
| 注册成功 | 建议直接返回 token，避免前端再调一次登录 |
| 密码存储 | 建议 bcrypt 哈希 |
| Token | JWT，需包含用户标识 |

**启动联调步骤：**

1. 后端启动服务（建议端口 **3000**）
2. 前端 `src/api/client.js` 默认指向 `http://localhost:3000/api`
3. 打开前端页面 → 注册账号 → 登录 → 跳转酒馆
4. 刷新页面 → token 从 localStorage 恢复，登录态保持

**CORS：** 后端需允许 `http://localhost:5173`

```js
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
```

---

### 🟡 [CHAR] 角色管理

```
GET    /api/characters          # 当前用户所有角色
POST   /api/characters          # 创建角色
PUT    /api/characters/:id      # 更新角色
DELETE /api/characters/:id      # 遣散角色
```

| 任务 | 标识 | 状态 |
|------|------|------|
| 获取角色列表 | `[CHAR-01]` | 📝 |
| 创建角色（含初始金币） | `[CHAR-02]` | 📝 |
| 更新角色 | `[CHAR-03]` | 📝 |
| 删除角色（遣散） | `[CHAR-04]` | 📝 |

**注意点：**

- 所有接口需要 `Authorization: Bearer <token>` 头
- 角色只能被**创建者自己**操作
- 创建角色时后端**必须校验**属性分配规则（`API-CONTRACT.md §2.2`）：
  - 六维属性范围：3 ~ 10
  - 六项初始值均为 5，额外可分配 4 点
  - 即 `sum(stats) === 34`
- 前端创建角色时提交 `level: 1`、`hp: 20`、`maxHp: 20` 等默认值，**后端不应信任前端默认值**，应自行设定
- **初始金币**：每次创建角色时后端应赋予随机 **50~100** 金币（`Math.floor(Math.random() * 51) + 50`），**不要使用前端传值**
- **交易校验**：所有扣减金币的操作（如商店交易 `shop_trade` 扣 50 金），后端必须先校验 `gold >= cost`，不足时返回错误码 `4001`，避免金币变为负数

---

### 🟢 [DNG] 副本系统

```
POST /api/dungeon/action
```

| 任务 | 标识 | 状态 |
|------|------|------|
| 商店交易 `shop_trade` | `[DNG-01]` | 📝 |
| 商店盗窃 `shop_steal` | `[DNG-02]` | 📝 |
| 墓地挖掘 `grave_dig` | `[DNG-03]` | 📝 |
| 墓地灵感 `grave_insight` | `[DNG-04]` | 📝 |
| 头目战斗 `boss_fight` | `[DNG-05]` | 📝 |
| 头目说服 `boss_persuade` | `[DNG-06]` | 📝 |
| 离开副本 `exit_leave` | `[DNG-07]` | 📝 |

**请求体：**
```json
{
  "actionId": "shop_steal",
  "characterId": 1,
  "dungeonState": { "hasKey": false, "hasClue": false, "shopRobbed": false, "shopTradeDone": false, "graveDug": false, "graveInsightDone": false, "bossDefeated": false }
}
```

**响应体：**
```json
{
  "code": 0,
  "data": {
    "success": true,
    "roll": { "raw": 15, "modifier": 1, "total": 16, "dc": 13, "success": true, "description": "..." },
    "updatedCharacter": { "gold": 30 },
    "dungeonUpdates": { "shopRobbed": true },
    "message": "盗窃成功！你摸走了 30 枚金币。"
  },
  "message": "ok"
}
```

**注意点：**

| 项目 | 要求 |
|------|------|
| 掷骰 | 后端必须使用真随机，前端不做任何判定。后端就绪后自动覆盖前端回退逻辑 |
| 角色变更 | `updatedCharacter` 中返回变更字段即可，前端自动合并 |
| 副本状态 | `dungeonUpdates` 返回需更新的标记位，前端覆盖本地值 |
| 失败行为 | 后端不可用时前端自动回退本地逻辑并提示 |

**各 actionId 核心逻辑（后端必须实现）：**

| actionId | 逻辑 |
|----------|------|
| `shop_trade` | 扣 50 金 → 获得「铁铲」→ `shopTradeDone=true` |
| `shop_steal` | 敏捷 vs DC=15 → 成功+30金 → `shopRobbed=true` |
| `grave_dig` | 需要持有「铁铲」→ 消耗 1 个 → 获得钥匙 → `graveDug=true, hasKey=true` |
| `grave_insight` | 感知 vs DC=12 → 成功获得线索 → `graveInsightDone=true, hasClue=true` |
| `boss_fight` | 力量 vs DC=13 → 成功获得「纪念章」→ `bossDefeated=true` |
| `boss_persuade` | 需要持有线索 → 消耗线索 → 获得钥匙 → `hasClue=false, hasKey=true` |
| `exit_leave` | 需要持有钥匙 → 追加通关记录到角色 → 返回成功 |

---

## 实现顺序建议

| 优先级 | 任务标识 | 接口 | 说明 |
|--------|---------|------|------|
| 🔴 P0 | `[AUTH-01]`~`[AUTH-03]` | 认证模块 | **先做，打通链路** |
| 🟡 P1 | `[CHAR-01]`~`[CHAR-04]` | 角色 CRUD（含初始金币） | 酒馆和创建页面依赖 |
| 🟢 P2 | `[DNG-01]`~`[DNG-07]` | 副本行动 | 副本玩法逻辑，可延后 |

---

## 附录：前端残留硬编码数据清单

> 当前端调用后端 API 失败时，以下数据会被用作回退（fallback）。后端就绪后自动被覆盖。

### 1. 副本场景与地图配置（展示层，可留前端）

`src/pages/Dungeon.vue` — 5 个节点坐标、8 条连线、5 段场景描述文本、行动按钮配置。
属于 UI 布局数据，建议保留在前端。如需动态剧情可后续抽到 `GET /api/dungeon/config`。

### 2. 游戏规则常量（回退 fallback 用）

| 数据 | 文件位置 | 值 |
|------|---------|-----|
| D20 掷骰 | `Dungeon.vue:166` | `Math.floor(Math.random() * 20) + 1` |
| 属性调整值公式 | `Dungeon.vue:162` | `(stat - 10) / 2` 向下取整 |
| 盗窃 DC | `Dungeon.vue:233` | `15` |
| 灵感 DC | `Dungeon.vue:261` | `12` |
| 战斗 DC | `Dungeon.vue:275` | `13` |
| 铁铲价格 | `Dungeon.vue:218` | `50 金` |

### 3. 角色创建默认值（前端参考值，后端应独立校验）

| 数据 | 文件位置 | 值 |
|------|---------|-----|
| 属性初始值 | `CreateCharacter.vue:119` | `5` |
| 属性下限 | `CreateCharacter.vue:120` | `3` |
| 属性上限 | `CreateCharacter.vue:121` | `10` |
| 额外分配点数 | `CreateCharacter.vue:122` | `4` |
| 角色初始等级 | `CreateCharacter.vue:187` | `1` |
| 角色初始 HP | `CreateCharacter.vue:188-189` | `20/20` |
| 角色初始金币 | `CreateCharacter.vue:190` | `10` |

> **后端 `POST /api/characters` 必须独立校验**属性分配规则 `sum(stats) === 34`，否则前端可篡改属性值。

### 4. 弹窗文案（回退 fallback 用）

所有 `showPrompt` / `showJudgement` 中的描述文本（商店交易、盗窃结果、挖掘描述、判定描述等）位于 `Dungeon.vue` 各 fallback 函数中。后端就绪后由 `POST /api/dungeon/action` 返回的 `message` / `roll.description` 替代。

---

## 开发环境建议

| 项目 | 推荐值 | 说明 |
|------|--------|------|
| 端口 | 3000 | 前端默认指向 `localhost:3000/api` |
| 数据库 | SQLite 起步 | 零配置，适合快速原型开发 |
| 响应格式 | `{ code: 0, data: ..., message: "ok" }` | 前端 axios 拦截器统一解包 |
| 错误码 | 见 `API-CONTRACT.md` 通用错误码表 | 前端根据 code 做差异化处理 |

---

## 常见问题

**Q：前端启动后接口报错怎么办？**

A：正常现象。前端所有 API 调用已就绪，后端尚未实现时网络请求会失败。后端实现对应接口后自动可用。副本页面在后端不可用时自动使用本地逻辑，不影响游玩。

**Q：如何快速验证后端连通性？**

A：先实现 `[AUTH-01]` 注册接口，前端注册一个账号能跳转到酒馆即表示链路打通。

**Q：如何调整 API 地址？**

A：设置环境变量 `VITE_API_BASE=http://你的地址/api`，或在 `src/api/client.js` 中直接修改默认值。

**Q：任务完成后如何同步状态？**

A：告知前端，前端验证后将对应任务标识（如 `[AUTH-01]`）的状态从 `📝` 改为 `✅`。

---

> 完整接口类型定义、请求体/响应体详细字段，请参阅 `API-CONTRACT.md`。
> 本文档随前后端对接进度更新。