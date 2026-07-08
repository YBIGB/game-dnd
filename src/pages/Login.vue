<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <!-- 游戏标识 -->
      <div class="game-brand">
        <span class="dice-icon">🎲</span>
        <h1 class="game-title">DND 跑团</h1>
      </div>

      <!-- 登录/注册切换 -->
      <div class="mode-tabs">
        <span
          class="mode-tab"
          :class="{ active: !isRegister }"
          @click="isRegister = false"
        >登录</span>
        <span
          class="mode-tab"
          :class="{ active: isRegister }"
          @click="isRegister = true"
        >注册</span>
      </div>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        class="login-form"
        @keyup.enter="handleSubmit"
      >
        <el-form-item prop="account">
          <el-input
            v-model="form.account"
            :placeholder="isRegister ? '请输入新账号' : '请输入账号'"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword" v-if="isRegister">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
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
            @click="handleSubmit"
          >
            {{ isRegister ? "注 册" : "登 录" }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部提示 -->
      <div class="login-hint">
        <p v-if="!isRegister">首次使用？切换到「注册」创建新账号</p>
        <p v-else>已有账号？切换到「登录」</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { User, Lock } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { useAuthStore } from "../stores/auth"

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)
const isRegister = ref(false)

const form = reactive({
  account: "",
  password: "",
  confirmPassword: "",
})

const formRules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" },
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (isRegister.value && value !== form.password) {
          callback(new Error("两次输入的密码不一致"))
        } else if (isRegister.value && !value) {
          callback(new Error("请再次输入密码"))
        } else {
          callback()
        }
      },
      trigger: "blur",
    },
  ],
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    if (isRegister.value) {
      await authStore.register(form.account.trim(), form.password)
      ElMessage.success("注册成功，欢迎加入！")
    } else {
      await authStore.login(form.account.trim(), form.password)
    }
    router.push("/tavern")
  } catch (err) {
    ElMessage.error(err.message || "操作失败，请重试")
  } finally {
    loading.value = false
  }
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
  margin: 16px 0 8px;
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

/* 模式切换 */
.mode-tabs {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.mode-tab {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s, border-color 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -9px;
  user-select: none;
}

.mode-tab:hover {
  color: var(--text-primary);
}

.mode-tab.active {
  color: var(--accent-gold);
  border-bottom-color: var(--accent-gold);
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
