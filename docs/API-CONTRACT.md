# DND 跑团游戏 — API 接口契约

> 本文档为前端（Vue 3）与后端（Node.js + Express）之间的正式接口约定。
> 双方以此为准进行独立开发，任何修改需同步更新本文档。

---

## 通用约定

### 基础信息

| 项目 | 值 |
|------|-----|
| Base URL | `http://localhost:3000/api` |
| 请求体格式 | `application/json` |
| 响应体格式 | `application/json` |
| 字符编码 | UTF-8（**带 BOM**） |

### 鉴权方式

所有需要登录的接口在请求头携带 Token：

```
Authorization: Bearer <token>
```

Token 由登录/注册接口返回，前端存储在 `localStorage` 中。

### 统一响应结构

```typescript
// 成功响应
interface ApiResponse<T> {
  code: 0
  data: T
  message: "ok"
}

// 错误响应
interface ApiErrorResponse {
  code: number       // 非零错误码
  data: null
  message: string    // 错误描述，前端可直接展示
}
```

### 通用错误码

| code | 含义 | 说明 |
|------|------|------|
| 0 | 成功 | — |
| 1001 | 参数错误 | 请求参数缺失或格式错误 |
| 1002 | 未登录 | Token 缺失或已过期 |
| 1003 | 无权限 | 无权操作指定资源 |
| 2001 | 账号已存在 | 注册时用户名已被占用 |
| 2002 | 账号或密码错误 | 登录验证失败 |
| 3001 | 角色不存在 | 操作的角色 ID 无效 |
| 3002 | 属性分配无效 | 创建角色时属性值超出 3~10 范围或点数不符 |
| 4001 | 副本行动无效 | actionId 不合法或当前状态不允许该操作 |

---

## 一、认证模块 Auth

### 1.1 用户注册

```
POST /api/auth/register
```

**Request Body：**

```typescript
interface RegisterRequest {
  username: string    // 用户名，1~20 字符
  password: string    // 密码，6~32 字符
}
```

**Success Response (code=0)：**

```typescript
interface RegisterResponse {
  token: string       // JWT Token
  username: string    // 注册用户名
}
```

**错误场景：** 用户名已存在（code=2001）、参数不合法（code=1001）

---

### 1.2 用户登录

```
POST /api/auth/login
```

**Request Body：**

```typescript
interface LoginRequest {
  username: string
  password: string
}
```

**Success Response (code=0)：**

```typescript
interface LoginResponse {
  token: string
  username: string
}
```

**错误场景：** 账号或密码错误（code=2002）

---

## 二、角色管理 Character

### 2.1 获取角色列表

```
GET /api/characters
```

**Headers：** `Authorization: Bearer <token>`

**Success Response：**

```typescript
interface CharacterListResponse {
  characters: CharacterDTO[]
}
```

### 2.2 创建角色

```
POST /api/characters
```

**Headers：** `Authorization: Bearer <token>`

**Request Body：**

```typescript
interface CreateCharacterRequest {
  name: string                                    // 角色名，1~20 字符
  stats: {
    strength: number      // 力量 3~10
    dexterity: number     // 敏捷 3~10
    constitution: number  // 体质 3~10
    intelligence: number  // 智力 3~10
    wisdom: number        // 感知 3~10
    charisma: number      // 魅力 3~10
  }
}
```

**属性分配规则（后端必须校验）：**

- **初始金币**：创建角色时后端应赋予随机 **50~100** 金币（`Math.floor(Math.random() * 51) + 50`），不需要前端传值

- 每项属性范围：3 ~ 10
- 六项初始值均为 5
- 额外可分配点数合计：4 点
- 即 `sum(stats) === 5 * 6 + 4 === 34`

**Success Response：**

```typescript
interface CreateCharacterResponse {
  character: CharacterDTO
}
```

**错误场景：** 属性分配无效（code=3002）、未登录（code=1002）

---

### 2.3 更新角色

```
PUT /api/characters/:id
```

**Headers：** `Authorization: Bearer <token>`

**Request Body：**（所有字段均为可选，仅传需要更新的字段）

```typescript
interface UpdateCharacterRequest {
  name?: string
  hp?: number
  gold?: number
  isAlive?: boolean
  inventory?: Array<{ name: string; qty: number }>
  completedDungeons?: string[]
}
```

**Success Response：**

```typescript
interface UpdateCharacterResponse {
  character: CharacterDTO
}
```

**错误场景：** 角色不存在（code=3001）、无权限（code=1003）

---

### 2.4 遣散角色（删除）

```
DELETE /api/characters/:id
```

**Headers：** `Authorization: Bearer <token>`

**Success Response：**

```typescript
interface DeleteCharacterResponse {
  deleted: true
}
```

**错误场景：** 角色不存在（code=3001）、无权限（code=1003）

---

### 2.5 角色数据结构（DTO）

```typescript
interface CharacterDTO {
  id: number
  name: string
  level: number
  hp: number             // 当前生命值
  maxHp: number          // 最大生命值
  gold: number           // 金币
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  inventory: Array<{
    name: string
    qty: number
  }>
  completedDungeons: string[]   // 已通关副本名称列表
  isAlive: boolean              // 是否存活
}
```

---

## 三、副本互动 Dungeon

### 3.1 执行副本行动

```
POST /api/dungeon/action
```

**Headers：** `Authorization: Bearer <token>`

**Request Body：**

```typescript
interface DungeonActionRequest {
  actionId: string      // 行动标识符（见下方 actionId 对照表）
  characterId: number   // 执行行动的角色 ID
  dungeonState?: {      // 前端可选的当前副本本地状态，用于后端逻辑判断
    hasKey?: boolean
    hasClue?: boolean
    shopRobbed?: boolean
    shopTradeDone?: boolean
    graveDug?: boolean
    graveInsightDone?: boolean
    bossDefeated?: boolean
  }
}
```

**actionId 对照表：**

| actionId | 对应行动 | 依赖属性 | DC |
|----------|----------|----------|----|
| `shop_trade` | 商店交易 | — | — |
| `shop_steal` | 商店盗窃 | 敏捷 (dexterity) | 13 |
| `grave_dig` | 墓地挖掘 | — | — |
| `grave_insight` | 墓地灵感 | 感知 (wisdom) | 12 |
| `boss_fight` | 头目战斗 | 力量 (strength) | 13 |
| `boss_persuade` | 头目说服 | — | — |
| `exit_leave` | 离开副本 | — | — |

**Success Response：**

```typescript
interface DungeonActionResponse {
  success: boolean              // 行动是否成功执行
  message?: string              // 行动的描述文本
  roll?: RollResult             // 需要掷骰的行动返回检定结果
  updatedCharacter?: Partial<CharacterDTO>   // 角色变更（HP/金币/物品等）
  dungeonUpdates?: {            // 副本状态更新
    hasKey?: boolean
    hasClue?: boolean
    shopRobbed?: boolean
    shopTradeDone?: boolean
    graveDug?: boolean
    graveInsightDone?: boolean
    bossDefeated?: boolean
  }
}

interface RollResult {
  raw: number          // 原始掷骰结果 (1~20)
  modifier: number     // 属性调整值
  total: number        // 最终结果 (raw + modifier)
  dc: number           // 难度等级
  success: boolean     // 是否成功 (total >= dc)
  description: string  // 结果描述文本
}
```

**各 actionId 的后端处理逻辑说明：**

| actionId | 处理逻辑 |
|----------|----------|
| `shop_trade` | 直接调用购物逻辑（若已实现）；返回 message |
| `shop_steal` | 对比 character 敏捷 vs DC=13 掷骰；成功后 `shopRobbed=true`；失败仅记录状态 |
| `grave_dig` | 检查角色持有物是否有"铁铲"（需消耗 1 个）；成功后 `hasKey=true, graveDug=true` |
| `grave_insight` | 对比角色感知 vs DC=12 掷骰；成功后 `hasClue=true, graveInsightDone=true` |
| `boss_fight` | 对比角色力量 vs DC=13 掷骰；成功后 `bossDefeated=true`，获得物品"纪念章" |
| `boss_persuade` | 若已持有线索 (`hasClue=true`)，消耗线索并给予钥匙 (`hasKey=true`)；否则失败 |
| `exit_leave` | 需持有钥匙 (`hasKey=true`) 才能离开；成功后追加副本通关记录 |

---

## 四、附录

### 4.1 属性值颜色建议（前端展示）

| 属性值范围 | 颜色语义 | 色值 |
|-----------|---------|------|
| 8 ~ 10 | 优秀（绿色） | `#67c23a` |
| 6 ~ 7 | 普通（金色） | `#e6a23c` |
| 3 ~ 5 | 薄弱（红色） | `#f56c6c` |

### 4.2 版本记录

| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|----------|--------|
| v1.0 | 2026-07-08 | 初始版本，包含 Auth/Character/Dungeon 三模块 | — |
