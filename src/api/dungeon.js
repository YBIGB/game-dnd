import client from "./client"

/**
 * 执行副本行动
 * @param {import("../types/api").DungeonActionRequest} data
 * @returns {Promise<import("../types/api").DungeonActionResponse>}
 */
export function dungeonActionApi(data) {
  return client.post("/dungeon/action", data)
}
