<template>
  <div class="lobby-page">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="welcome-text">
          <span class="welcome-icon">👋</span>
          <span>欢迎回来，{{ authStore.username || "冒险者" }}</span>
        </div>
        <el-button
          type="primary"
          class="create-btn"
          @click="goCreateCharacter"
        >
          + 新建角色
        </el-button>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="main-content">
      <!-- 空状态 -->
      <div v-if="characterStore.characters.length === 0" class="empty-state">
        <div class="empty-icon">🎒</div>
        <p class="empty-title">还没有角色</p>
        <p class="empty-desc">点击右上角新建你的第一位冒险者</p>
        <el-button
          type="primary"
          size="large"
          class="empty-btn"
          @click="goCreateCharacter"
        >
          创建角色
        </el-button>
      </div>

      <!-- 角色卡片网格 -->
      <div v-else class="card-grid">
        <div
          v-for="character in characterStore.characters"
          :key="character.id"
          class="character-card"
          :class="{ dead: !character.isAlive }"
          @click="selectAndEnter(character)"
        >
          <!-- 头像占位 -->
          <div class="avatar-section">
            <span class="avatar-icon">{{ character.isAlive ? "🧙" : "💀" }}</span>
          </div>

          <!-- 信息区 -->
          <div class="info-section">
            <div class="char-name">{{ character.name }}</div>
            <div class="char-level">Lv.{{ character.level }}</div>

            <div class="char-stats">
              <div class="stat-row">
                <span class="stat-icon">❤️</span>
                <span class="stat-label">HP</span>
                <span
                  class="stat-value"
                  :class="hpStatusClass(character)"
                >
                  {{ character.hp }} / {{ character.maxHp }}
                </span>
              </div>
              <div class="stat-row">
                <span class="stat-icon">💰</span>
                <span class="stat-label">金币</span>
                <span class="stat-value gold">{{ character.gold }}</span>
              </div>
            </div>
          </div>

          <!-- 状态标签 -->
          <div class="status-badge" :class="character.isAlive ? 'alive' : 'dead'">
            {{ character.isAlive ? "存活" : "阵亡" }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { useCharacterStore } from "../stores/character"

const router = useRouter()
const authStore = useAuthStore()
const characterStore = useCharacterStore()

onMounted(() => {
  characterStore.initDemoData()
})

function goCreateCharacter() {
  router.push("/create-character")
}

function selectAndEnter(character) {
  characterStore.selectCharacter(character)
  router.push("/tavern")
}

function hpStatusClass(character) {
  if (!character.isAlive) return "dead-text"
  const ratio = character.hp / character.maxHp
  if (ratio > 0.6) return "healthy"
  if (ratio >= 0.3) return "wounded"
  return "critical"
}
</script>

<style scoped>
/* ========== 页面布局 ========== */
.lobby-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #0f0f23 100%);
}

/* ========== 顶部导航栏 ========== */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 15, 35, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
}

.top-bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.welcome-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-icon {
  font-size: 22px;
}

.create-btn {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
  transition: transform 0.15s, box-shadow 0.15s;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(240, 192, 64, 0.3);
  background: linear-gradient(135deg, #f0c040, #f5d060);
}

/* ========== 主体 ========== */
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 100px;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 28px;
}

.empty-btn {
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
}

.empty-btn:hover {
  background: linear-gradient(135deg, #f0c040, #f5d060);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(240, 192, 64, 0.3);
}

/* ========== 角色卡片网格 ========== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* ========== 角色卡片 ========== */
.character-card {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 2px solid var(--hp-green);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.character-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(103, 194, 58, 0.15);
}

.character-card.dead {
  border-color: #5a5a6a;
}

.character-card.dead:hover {
  box-shadow: 0 8px 30px rgba(90, 90, 106, 0.15);
}

/* ========== 头像区 ========== */
.avatar-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.avatar-icon {
  font-size: 36px;
  line-height: 1;
}

/* ========== 信息区 ========== */
.info-section {
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 2px;
}

.char-level {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.char-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.stat-icon {
  font-size: 16px;
  line-height: 1;
}

.stat-label {
  color: var(--text-secondary);
  min-width: 32px;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.healthy {
  color: var(--hp-green);
}

.stat-value.wounded {
  color: var(--hp-yellow);
}

.stat-value.critical {
  color: var(--hp-red);
}

.stat-value.dead-text {
  color: #6c6c80;
}

.stat-value.gold {
  color: var(--accent-gold);
}

/* ========== 状态标签 ========== */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.status-badge.alive {
  background: rgba(103, 194, 58, 0.15);
  color: var(--hp-green);
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.status-badge.dead {
  background: rgba(108, 108, 128, 0.2);
  color: #6c6c80;
  border: 1px solid rgba(108, 108, 128, 0.3);
}
</style>
