import client from "./client"

/**
 * 获取当前用户的角色列表
 * @returns {Promise<import("../types/api").CharacterDTO[]>}
 */
export function fetchCharactersApi() {
  return client.get("/characters")
}

/**
 * 创建角色
 * @param {import("../types/api").CreateCharacterRequest} data
 * @returns {Promise<import("../types/api").CreateCharacterResponse>}
 */
export function createCharacterApi(data) {
  return client.post("/characters", data)
}

/**
 * 更新角色
 * @param {number} id
 * @param {import("../types/api").UpdateCharacterRequest} data
 * @returns {Promise<import("../types/api").UpdateCharacterResponse>}
 */
export function updateCharacterApi(id, data) {
  return client.put(`/characters/${id}`, data)
}

/**
 * 删除角色（遣散）
 * @param {number} id
 * @returns {Promise<import("../types/api").DeleteCharacterResponse>}
 */
export function deleteCharacterApi(id) {
  return client.delete(`/characters/${id}`)
}
