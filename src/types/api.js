/**
 * API 接口类型定义（JsDoc 格式）
 *
 * 本文档为前后端共享契约的类型定义文件。
 * 后端项目应以此为准实现接口，前端项目通过此文件了解响应结构。
 *
 * 所有的接口定义以 `InterfaceName` 形式命名，
 * 实际为 JsDoc 类型注释，方便在 VSCode 中被 IDE 识别。
 *
 * @typedef {Object} ApiResponse      统一成功响应
 * @property {0} code                 成功码
 * @property {T} data                 响应数据
 * @property {"ok"} message           消息
 *
 * @typedef {Object} ApiErrorResponse 统一错误响应
 * @property {number} code            非零错误码
 * @property {null} data              数据
 * @property {string} message         错误描述
 */

// ──── 认证模块 Auth ────

/**
 * 登录请求
 * @typedef {Object} LoginRequest
 * @property {string} username  用户名，1~20 字符
 * @property {string} password  密码，6~32 字符
 */

/**
 * 登录响应
 * @typedef {Object} LoginResponse
 * @property {string} token     JWT Token
 * @property {string} username  用户名
 */

/**
 * 注册请求
 * @typedef {Object} RegisterRequest
 * @property {string} username  用户名，1~20 字符
 * @property {string} password  密码，6~32 字符
 */

/**
 * 注册响应
 * @typedef {Object} RegisterResponse
 * @property {string} token     JWT Token
 * @property {string} username  用户名
 */

// ──── 角色管理 Character ────

/**
 * 角色 DTO
 * @typedef {Object} CharacterDTO
 * @property {number} id
 * @property {string} name
 * @property {number} level
 * @property {number} hp             当前生命值
 * @property {number} maxHp          最大生命值
 * @property {number} gold           金币
 * @property {Object} stats          六维属性
 * @property {number} stats.strength
 * @property {number} stats.dexterity
 * @property {number} stats.constitution
 * @property {number} stats.intelligence
 * @property {number} stats.wisdom
 * @property {number} stats.charisma
 * @property {Array<{name:string, qty:number}>} inventory  持有物
 * @property {string[]} completedDungeons  已通关副本名称列表
 * @property {boolean} isAlive       是否存活
 */

/**
 * 创建角色请求
 * @typedef {Object} CreateCharacterRequest
 * @property {string} name                                   角色名，1~20 字符
 * @property {Object} stats                                  六维属性
 * @property {number} stats.strength     力量 3~10
 * @property {number} stats.dexterity    敏捷 3~10
 * @property {number} stats.constitution 体质 3~10
 * @property {number} stats.intelligence 智力 3~10
 * @property {number} stats.wisdom       感知 3~10
 * @property {number} stats.charisma     魅力 3~10
 */

/**
 * 创建角色响应
 * @typedef {Object} CreateCharacterResponse
 * @property {CharacterDTO} character
 */

/**
 * 更新角色请求
 * @typedef {Object} UpdateCharacterRequest
 * @property {string} [name]
 * @property {number} [hp]
 * @property {number} [gold]
 * @property {boolean} [isAlive]
 * @property {Array<{name:string, qty:number}>} [inventory]
 * @property {string[]} [completedDungeons]
 */

/**
 * 更新角色响应
 * @typedef {Object} UpdateCharacterResponse
 * @property {CharacterDTO} character
 */

/**
 * 删除角色响应
 * @typedef {Object} DeleteCharacterResponse
 * @property {true} deleted
 */

// ──── 副本互动 Dungeon ────

/**
 * 副本行动请求
 * @typedef {Object} DungeonActionRequest
 * @property {string} actionId              行动标识符
 * @property {number} characterId           执行行动的角色 ID
 * @property {Object} [dungeonState]        前端可选的当前副本本地状态
 * @property {boolean} [dungeonState.hasKey]
 * @property {boolean} [dungeonState.hasClue]
 * @property {boolean} [dungeonState.shopRobbed]
 * @property {boolean} [dungeonState.shopTradeDone]
 * @property {boolean} [dungeonState.graveDug]
 * @property {boolean} [dungeonState.graveInsightDone]
 * @property {boolean} [dungeonState.bossDefeated]
 */

/**
 * 掷骰结果
 * @typedef {Object} RollResult
 * @property {number} raw         原始掷骰结果 (1~20)
 * @property {number} modifier    属性调整值
 * @property {number} total       最终结果 (raw + modifier)
 * @property {number} dc          难度等级
 * @property {boolean} success    是否成功 (total >= dc)
 * @property {string} description 结果描述文本
 */

/**
 * 副本行动响应
 * @typedef {Object} DungeonActionResponse
 * @property {boolean} success                   行动是否成功执行
 * @property {string} [message]                  行动的描述文本
 * @property {RollResult} [roll]                 需要掷骰的行动返回检定结果
 * @property {Partial<CharacterDTO>} [updatedCharacter]  角色变更
 * @property {Object} [dungeonUpdates]           副本状态更新
 * @property {boolean} [dungeonUpdates.hasKey]
 * @property {boolean} [dungeonUpdates.hasClue]
 * @property {boolean} [dungeonUpdates.shopRobbed]
 * @property {boolean} [dungeonUpdates.shopTradeDone]
 * @property {boolean} [dungeonUpdates.graveDug]
 * @property {boolean} [dungeonUpdates.graveInsightDone]
 * @property {boolean} [dungeonUpdates.bossDefeated]
 */


// ──── 背包模块 Inventory ────

/**
 * 背包物品 DTO（前端扩展，含展示信息）
 * @typedef {Object} InventoryItemDTO
 * @property {number|string} id - 物品唯一标识
 * @property {string} name - 物品名称
 * @property {string} icon - 图标（emoji）
 * @property {number} qty - 持有数量
 * @property {string} description - 文本说明
 * @property {string} specialNote - 特殊说明
 * @property {number} value - 金币价值（交易定价用）
 * @property {string} [category] - 物品分类（武器/消耗品/关键物品等，后续扩展）
 * @property {boolean} stackable - 是否可堆叠
 */
export default {}

