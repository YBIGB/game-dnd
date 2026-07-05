<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <!-- 游戏标识 -->
      <div class="game-brand">
        <span class="dice-icon">🎲</span>
        <h1 class="game-title">DND 跑团</h1>
      </div>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="account">
          <el-input
            v-model="form.account"
            placeholder="请输入账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div class="login-hint">
        <p>测试账号: admin / test    密码: 123456</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { User, Lock } from "@element-plus/icons-vue"
import { ElMessageBox } from "element-plus"
import { useAuthStore } from "../stores/auth"

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  account: "",
  password: "",
})

const formRules = {
  account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
}

const VALID_ACCOUNTS = ["admin", "test"]
const VALID_PASSWORD = "123456"

async function handleLogin() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 600))

  const account = form.account.trim().toLowerCase()
  if (VALID_ACCOUNTS.includes(account) && form.password === VALID_PASSWORD) {
    authStore.setUsername(account)
    router.push("/tavern")
  } else {
    ElMessageBox.alert("账号或密码错误", "登录失败", {
      confirmButtonText: "确定",
      type: "error",
      center: true,
    })
  }

  loading.value = false
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #0f0f23 100%);
}

.login-card {
  width: 420px;
  padding: 12px 20px 20px;
  border-radius: 12px;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color);
}

/* 游戏标识 */
.game-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 0 28px;
}

.dice-icon {
  font-size: 52px;
  line-height: 1;
}

.game-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-gold);
  letter-spacing: 4px;
  margin: 0;
}

/* 表单 */
.login-form {
  margin-bottom: 8px;
}

.login-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  box-shadow: none;
  border-radius: 8px;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-gold);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 1px var(--accent-gold);
}

.login-form :deep(.el-input__inner) {
  color: var(--text-primary);
}

.login-form :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.login-form :deep(.el-input__prefix-inner) {
  color: var(--text-muted);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
  transition: transform 0.15s, box-shadow 0.15s;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(240, 192, 64, 0.35);
  background: linear-gradient(135deg, #f0c040, #f5d060);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 提示信息 */
.login-hint {
  margin-top: 8px;
  padding: 10px 0;
  text-align: center;
}

.login-hint p {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
</style>

