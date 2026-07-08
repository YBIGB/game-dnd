import client from "./client"

/**
 * 登录
 * @param {string} username
 * @param {string} password
 * @returns {Promise<import("../types/api").LoginResponse>}
 */
export function loginApi(username, password) {
  return client.post("/auth/login", { username, password })
}

/**
 * 注册
 * @param {string} username
 * @param {string} password
 * @returns {Promise<import("../types/api").RegisterResponse>}
 */
export function registerApi(username, password) {
  return client.post("/auth/register", { username, password })
}
