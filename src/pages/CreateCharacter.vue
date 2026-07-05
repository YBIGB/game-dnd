<template>
  <div class="create-page">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <el-button text class="back-btn" @click="goBack">
          ← 返回
        </el-button>
        <h1 class="page-title">创建新角色</h1>
        <div class="top-bar-spacer"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <el-card class="create-card" shadow="always">
        <!-- 角色名 -->
        <div class="field-section">
          <label class="field-label">角色名</label>
          <el-input
            v-model="name"
            placeholder="请输入角色名"
            size="large"
            maxlength="20"
            show-word-limit
            class="name-input"
          />
        </div>

        <!-- 属性分配区域 -->
        <div class="field-section">
          <label class="field-label">属性分配</label>
          <div class="stats-container">
            <div
              v-for="stat in statDefs"
              :key="stat.key"
              class="stat-row"
            >
              <span class="stat-name">{{ stat.label }}</span>
              <span
                class="stat-value"
                :class="{ 'stat-changed': changedStat === stat.key }"
                :style="{ color: valueColor(stats[stat.key]) }"
              >
                {{ stats[stat.key] }}
              </span>
              <div class="stat-controls">
                <el-button
                  circle
                  size="small"
                  :disabled="stats[stat.key] <= 0"
                  class="ctrl-btn minus-btn"
                  @click="adjustStat(stat.key, -1)"
                >
                  -
                </el-button>
                <el-button
                  circle
                  size="small"
                  :disabled="stats[stat.key] >= 15 || remainingPoints <= 0"
                  class="ctrl-btn plus-btn"
                  @click="adjustStat(stat.key, 1)"
                >
                  +
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 剩余点数 -->
        <div class="points-display">
          <span class="points-label">剩余可分配点数：</span>
          <span class="points-value" :class="{ 'points-empty': remainingPoints === 0 }">
            {{ remainingPoints }}
          </span>
        </div>
      </el-card>

      <!-- 创建角色按钮 -->
      <div class="bottom-action">
        <el-button
          class="create-btn"
          size="large"
          :disabled="!canCreate"
          @click="handleCreate"
        >
          创建角色
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { useCharacterStore } from "../stores/character"

const router = useRouter()
const characterStore = useCharacterStore()

// 六维属性定义
const statDefs = [
  { key: "strength", label: "力量" },
  { key: "dexterity", label: "敏捷" },
  { key: "constitution", label: "体质" },
  { key: "intelligence", label: "智力" },
  { key: "wisdom", label: "感知" },
  { key: "charisma", label: "魅力" },
]

// 角色名
const name = ref("")

// 六维初始全5，额外4点自由分配
const INITIAL_STAT = 5
const FREE_POINTS = 4

const stats = reactive({
  strength: INITIAL_STAT,
  dexterity: INITIAL_STAT,
  constitution: INITIAL_STAT,
  intelligence: INITIAL_STAT,
  wisdom: INITIAL_STAT,
  charisma: INITIAL_STAT,
})

// 已分配点数（已用掉的自定义点数）
const allocatedPoints = ref(0)

// 剩余点数
const remainingPoints = computed(() => FREE_POINTS - allocatedPoints.value)

// 用于动画效果的追踪
const changedStat = ref(null)
let changeTimer = null

// 调整属性
function adjustStat(key, delta) {
  const newVal = stats[key] + delta
  if (newVal < 0 || newVal > 15) return
  if (delta > 0 && remainingPoints.value <= 0) return

  stats[key] = newVal
  allocatedPoints.value += delta

  // 触发数值变化动画
  changedStat.value = key
  clearTimeout(changeTimer)
  changeTimer = setTimeout(() => {
    changedStat.value = null
  }, 400)
}

// 角色名校验
const isNameValid = computed(() => {
  const trimmed = name.value.trim()
  return trimmed.length > 0
})

// 是否可以创建
const canCreate = computed(() => {
  return isNameValid.value && remainingPoints.value === 0
})

// 属性值颜色
function valueColor(val) {
  if (val >= 13) return "var(--hp-green)"
  if (val >= 9) return "var(--text-primary)"
  if (val >= 5) return "var(--text-secondary)"
  return "var(--hp-red)"
}

// 创建角色
function handleCreate() {
  if (!canCreate.value) return

  const trimmedName = name.value.trim()

  // 生成新角色
  const newCharacter = {
    id: Date.now(),
    name: trimmedName,
    level: 1,
    hp: 20,
    maxHp: 20,
    gold: 10,
    stats: { ...stats },
    inventory: [],
    completedDungeons: [],
    isAlive: true,
  }

  characterStore.addCharacter(newCharacter)
  characterStore.selectCharacter(newCharacter)

  ElMessage.success(`欢迎冒险者「${trimmedName}」加入！`)
  router.push("/tavern")
}

// 返回大厅（酒馆）
function goBack() {
  router.push("/tavern")
}
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #0f0f23 100%);
  padding-bottom: 40px;
}

.top-bar {
  background: var(--bg-status-bar);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 560px;
  margin: 0 auto;
  padding: 12px 20px;
}

.back-btn {
  font-size: 15px;
  color: var(--text-secondary) !important;
  font-weight: 600;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--accent-gold) !important;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 2px;
}

.top-bar-spacer {
  width: 80px;
}

.main-content {
  max-width: 480px;
  margin: 32px auto 0;
  padding: 0 20px;
}

.create-card {
  border-radius: 12px;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  padding: 4px 8px;
}

.field-section {
  margin-bottom: 24px;
}

.field-section:last-of-type {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.name-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  box-shadow: none;
  border-radius: 8px;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.name-input :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-gold);
}

.name-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 1px var(--accent-gold);
}

.name-input :deep(.el-input__inner) {
  color: var(--text-primary);
}

.name-input :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.name-input :deep(.el-input__count) {
  color: var(--text-muted);
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;
}

.stat-row:hover {
  border-color: rgba(42, 58, 92, 0.6);
  background: rgba(255, 255, 255, 0.05);
}

.stat-name {
  width: 56px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.stat-value {
  flex: 1;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.25s, transform 0.25s;
}

.stat-changed {
  animation: pulse 0.4s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.stat-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ctrl-btn {
  font-size: 16px;
  font-weight: 700;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
}

.ctrl-btn:not(.is-disabled):hover {
  transform: scale(1.1);
}

.ctrl-btn:not(.is-disabled):active {
  transform: scale(0.95);
}

.minus-btn {
  background: rgba(245, 108, 108, 0.12) !important;
  border: 1px solid rgba(245, 108, 108, 0.3) !important;
  color: var(--hp-red) !important;
}

.minus-btn:not(.is-disabled):hover {
  background: rgba(245, 108, 108, 0.22) !important;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.25);
}

.plus-btn {
  background: rgba(103, 194, 58, 0.12) !important;
  border: 1px solid rgba(103, 194, 58, 0.3) !important;
  color: var(--hp-green) !important;
}

.plus-btn:not(.is-disabled):hover {
  background: rgba(103, 194, 58, 0.22) !important;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.25);
}

.ctrl-btn.is-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.points-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 0 8px;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
}

.points-label {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 500;
}

.points-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-gold);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}

.points-empty {
  color: var(--hp-green);
}

.bottom-action {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.create-btn {
  font-size: 18px;
  font-weight: 700;
  padding: 14px 80px;
  border-radius: 12px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
}

.create-btn:not(.is-disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(240, 192, 64, 0.35);
  background: linear-gradient(135deg, #f0c040, #f5d060);
}

.create-btn:not(.is-disabled):active {
  transform: translateY(0);
  box-shadow: none;
}

.create-btn.is-disabled {
  background: #4a4a5a !important;
  color: #7a7a8a !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}
</style>
