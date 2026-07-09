import client from "./client"

/**
 * 获取当前角色的背包物品
 * @param {number} characterId - 角色 ID
 * @returns {Promise<import("../types/api").InventoryItemDTO[]>}
 */
export async function fetchInventoryApi(characterId) {
  try {
    const data = await client.get(`/characters/${characterId}/inventory`)
    return data
  } catch {
    // 后端不可用时返回 mock 数据
    return MOCK_INVENTORY
  }
}

/**
 * 默认 mock 背包数据
 * @type {import("../types/api").InventoryItemDTO[]}
 */
export const MOCK_INVENTORY = [
  { id: "iron-sword", name: "铁剑", icon: "⚔️", qty: 1, description: "一把锈迹斑斑的剑", specialNote: "无", stackable: false },
  { id: "teleport-scroll", name: "传送卷轴", icon: "📜", qty: 2, description: "可以用于传送到其他位置", specialNote: "获得传送技能", stackable: true },
  { id: "hp-potion", name: "生命药水", icon: "❤️", qty: 3, description: "恢复 20 点生命值", specialNote: "无", stackable: true },
  { id: "magic-amulet", name: "魔法护符", icon: "🔮", qty: 1, description: "散发着微弱蓝光的护符", specialNote: "魔力+5", stackable: false },
  { id: "copper-pouch", name: "铜币袋", icon: "🪙", qty: 1, description: "装满铜币的袋子", specialNote: "无", stackable: false },
  { id: "torch", name: "火把", icon: "🔥", qty: 4, description: "照亮黑暗的普通火把", specialNote: "无", stackable: true },
  { id: "old-key", name: "生锈钥匙", icon: "🗝️", qty: 1, description: "不知能打开哪扇门的旧钥匙", specialNote: "无", stackable: false },
]
