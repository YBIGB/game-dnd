import client from "./client"

/**
 * NPC 商店默认商品（开发阶段 mock 数据）
 * @type {import("../types/api").InventoryItemDTO[]}
 */
export const MOCK_SHOP_INVENTORY = [
  { id: "gold", name: "金币", icon: "🪙", qty: 200, description: "商店老板的钱袋", specialNote: "等价物", value: 1, stackable: true },
  { id: "shovel", name: "铁铲", icon: "⛏️", qty: 1, description: "一把结实的铁铲，可以用来挖掘", specialNote: "挖掘必备", value: 50, stackable: false },
  { id: "hp-potion", name: "生命药水", icon: "❤️", qty: 3, description: "恢复 20 点生命值", specialNote: "无", value: 20, stackable: true },
  { id: "torch", name: "火把", icon: "🔥", qty: 2, description: "照亮黑暗的普通火把", specialNote: "无", value: 5, stackable: true },
  { id: "magic-ring", name: "魔法戒指", icon: "💍", qty: 1, description: "散发着微弱光芒的戒指", specialNote: "魔力+3", value: 100, stackable: false },
]

/**
 * 获取商店/NPC 的商品列表
 * @param {number} [shopId] - 商店 ID（预留，后续扩展）
 * @returns {Promise<{ inventory: import("../types/api").InventoryItemDTO[], npcGold: number }>}
 */
export async function fetchShopInventoryApi(shopId) {
  try {
    const url = "/shop/inventory" + (shopId ? "/" + shopId : "")
    const data = await client.get(url)
    return data
  } catch {
    return { inventory: MOCK_SHOP_INVENTORY, npcGold: 200 }
  }
}

/**
 * 执行交易请求
 * @param {Object} params
 * @param {number} params.characterId - 角色 ID
 * @param {string} params.itemId - 物品 ID
 * @param {"buy"|"sell"} params.direction - 交易方向
 * @param {number} params.qty - 数量
 * @returns {Promise<Object>}
 */
export async function executeTradeApi({ characterId, itemId, direction, qty }) {
  try {
    const data = await client.post("/shop/trade", { characterId, itemId, direction, qty })
    return data
  } catch {
    return { success: true, message: "交易成功（本地模式）" }
  }
}
