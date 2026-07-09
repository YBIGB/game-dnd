import client from "./client"

/**
 * 获取物品列表
 * @param {{ type?: string, subtype?: string }} [params] 可选筛选参数
 * @returns {Promise<import("../types/api").ItemListResponse>}
 */
export function fetchItemsApi(params) {
  return client.get("/items", { params })
}

/**
 * 获取单个物品
 * @param {number} id
 * @returns {Promise<import("../types/api").ItemDetailResponse>}
 */
export function fetchItemApi(id) {
  return client.get(`/items/${id}`)
}
