import client from "./client"

/**
 * 获取 NPC 列表
 * @param {{ role?: string }} [params] 可选角色筛选
 * @returns {Promise<import("../types/api").NpcListResponse>}
 */
export function fetchNpcsApi(params) {
  return client.get("/npcs", { params })
}

/**
 * 获取单个 NPC
 * @param {number} id
 * @returns {Promise<import("../types/api").NpcDetailResponse>}
 */
export function fetchNpcApi(id) {
  return client.get(`/npcs/${id}`)
}
