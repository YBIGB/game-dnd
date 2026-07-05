<template>
  <div class="tavern-page">
    <!-- ==================== 模式1：角色列表（未选中角色时） ==================== -->
    <template v-if="!characterStore.currentCharacter">
      <!-- 顶部导航栏 -->
      <header class="top-bar">
        <div class="top-bar-inner">
          <div class="welcome-text">
            <span class="welcome-icon">👋</span>
            <span>欢迎回来，{{ authStore.username || "冒险者" }}</span>
          </div>
          <el-button type="primary" class="action-btn" @click="goCreateCharacter">
            + 新建角色
          </el-button>
        </div>
      </header>

      <main class="main-content">
        <!-- 空状态 -->
        <div v-if="characterStore.characters.length === 0" class="empty-state">
          <div class="empty-icon">🎒</div>
          <p class="empty-title">还没有角色</p>
          <p class="empty-desc">点击右上角新建你的第一位冒险者</p>
          <el-button type="primary" size="large" class="empty-btn" @click="goCreateCharacter">
            创建角色
          </el-button>
        </div>

        <!-- 角色卡片网格 -->
        <div v-else class="card-grid">
          <div
            v-for="c in characterStore.characters"
            :key="c.id"
            class="character-card"
            :class="{ dead: !c.isAlive }"
            @click="focusCharacter(c)"
          >
            <div class="avatar-section">
              <span class="avatar-icon">{{ c.isAlive ? "🧙" : "💀" }}</span>
            </div>
            <div class="info-section">
              <div class="char-name">{{ c.name }}</div>
              <div class="char-level">Lv.{{ c.level }}</div>
              <div class="char-stats">
                <div class="stat-row">
                  <span class="stat-icon">❤️</span>
                  <span class="stat-label">HP</span>
                  <span class="stat-value" :class="hpClass(c)">{{ c.hp }} / {{ c.maxHp }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-icon">💰</span>
                  <span class="stat-label">金币</span>
                  <span class="stat-value gold">{{ c.gold }}</span>
                </div>
              </div>
            </div>
            <div class="status-badge" :class="c.isAlive ? 'alive' : 'dead'">
              {{ c.isAlive ? "存活" : "阵亡" }}
            </div>
          </div>
        </div>
      </main>
    </template>

    <!-- ==================== 模式2：角色详情（已选中角色） ==================== -->
    <template v-else>
      <header class="top-bar">
        <div class="top-bar-inner">
          <div class="bar-left">
            <span class="char-title">{{ characterStore.currentCharacter.name }}</span>
            <span class="char-subtitle">Lv.{{ characterStore.currentCharacter.level }}</span>
          </div>
          <el-button class="back-btn" @click="backToList">
            返回
          </el-button>
        </div>
      </header>

      <main class="main-content">
        <div class="content-grid">
          <!-- 左侧：头像 + 六维属性 -->
          <section class="panel left-panel">
            <div class="avatar-area">
              <span class="avatar-icon">{{ characterStore.currentCharacter.isAlive ? "🧙" : "💀" }}</span>
            </div>
            <div class="stat-block-title">六维属性</div>
            <div class="stats-grid">
              <div v-for="stat in statList" :key="stat.key" class="stat-item">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="stat-value" :style="{ color: statColor(characterStore.currentCharacter.stats[stat.key]) }">
                  {{ characterStore.currentCharacter.stats[stat.key] }}
                </span>
              </div>
            </div>
          </section>

          <!-- 中间：HP / 金币 / 状态 -->
          <section class="panel middle-panel">
            <div class="hp-section">
              <div class="section-label">❤️ 生命值</div>
              <div class="hp-bar-wrapper">
                <div class="hp-bar-fill" :style="{ width: hpPercent + '%', backgroundColor: hpColor }"></div>
              </div>
              <div class="hp-text" :style="{ color: hpColor }">
                {{ characterStore.currentCharacter.hp }} / {{ characterStore.currentCharacter.maxHp }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="info-row">
              <span class="info-icon">💰</span>
              <span class="info-label">金币</span>
              <span class="info-value gold">{{ characterStore.currentCharacter.gold }}</span>
            </div>
            <div class="divider"></div>
            <div class="info-row">
              <span class="info-icon">{{ characterStore.currentCharacter.isAlive ? "🟢" : "🔴" }}</span>
              <span class="info-label">状态</span>
              <span class="info-value" :style="{ color: characterStore.currentCharacter.isAlive ? '#67c23a' : '#f56c6c' }">
                {{ characterStore.currentCharacter.isAlive ? "存活" : "阵亡" }}
              </span>
            </div>
          </section>

          <!-- 右侧：背包 / 通关记录 -->
          <section class="panel right-panel">
            <el-tabs v-model="activeTab" class="detail-tabs">
              <el-tab-pane label="背包" name="inventory">
                <div v-if="characterStore.currentCharacter.inventory && characterStore.currentCharacter.inventory.length > 0" class="inventory-list">
                  <div v-for="(item, idx) in characterStore.currentCharacter.inventory" :key="idx" class="inv-item">
                    <span class="inv-name">{{ item.name }}</span>
                    <el-tag type="info" size="small" class="inv-qty">x{{ item.qty }}</el-tag>
                  </div>
                </div>
                <div v-else class="empty-tab"><p>背包空空如也……</p></div>
              </el-tab-pane>
              <el-tab-pane label="通关记录" name="records">
                <div v-if="characterStore.currentCharacter.completedDungeons && characterStore.currentCharacter.completedDungeons.length > 0" class="record-list">
                  <div v-for="(dungeon, idx) in characterStore.currentCharacter.completedDungeons" :key="idx" class="record-item">
                    <span class="record-icon">🏁</span>
                    <span class="record-name">{{ dungeon }}</span>
                  </div>
                </div>
                <div v-else class="empty-tab"><p>尚未通关任何副本</p></div>
              </el-tab-pane>
            </el-tabs>
          </section>
        </div>

        <!-- 底部：进入副本 -->
        <div class="bottom-action">
          <el-tooltip v-if="!characterStore.currentCharacter.isAlive" content="角色已阵亡，无法进入副本" placement="top">
            <el-button class="enter-dungeon-btn" size="large" disabled>⚔️ 进入副本</el-button>
          </el-tooltip>
          <el-button v-else class="enter-dungeon-btn" size="large" @click="enterDungeon">⚔️ 进入副本</el-button>
        </div>
      </main>

      <!-- 底部状态条 -->
      <CharacterStatusBar />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { useCharacterStore } from "../stores/character"
import { useDungeonStore } from "../stores/dungeon"
import CharacterStatusBar from "../components/CharacterStatusBar.vue"

const router = useRouter()
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const dungeonStore = useDungeonStore()

const activeTab = ref("inventory")

onMounted(() => {
  characterStore.initDemoData()
})

const statList = [
  { key: "strength", label: "力量" },
  { key: "dexterity", label: "敏捷" },
  { key: "constitution", label: "体质" },
  { key: "intelligence", label: "智力" },
  { key: "wisdom", label: "感知" },
  { key: "charisma", label: "魅力" },
]

const hpPercent = computed(() => {
  const c = characterStore.currentCharacter
  if (!c || c.maxHp <= 0) return 0
  return Math.round((c.hp / c.maxHp) * 100)
})

const hpColor = computed(() => {
  if (hpPercent.value > 60) return "#67c23a"
  if (hpPercent.value >= 30) return "#e6a23c"
  return "#f56c6c"
})

function hpClass(c) {
  if (!c.isAlive) return "dead-text"
  const r = c.hp / c.maxHp
  if (r > 0.6) return "healthy"
  if (r >= 0.3) return "wounded"
  return "critical"
}

function statColor(val) {
  if (val >= 14) return "#67c23a"
  if (val >= 10) return "#e6a23c"
  return "#f56c6c"
}

function focusCharacter(c) {
  characterStore.selectCharacter(c)
}

function backToList() {
  characterStore.selectCharacter(null)
}

function goCreateCharacter() {
  router.push("/create-character")
}

function enterDungeon() {
  dungeonStore.resetDungeon()
  router.push("/dungeon")
}
</script>

<style scoped>
/* ========== 页面布局 ========== */
.tavern-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #0f0f23 100%);
}

/* ========== 顶部导航栏（通用） ========== */
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

.action-btn {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
  transition: transform 0.15s, box-shadow 0.15s;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(240, 192, 64, 0.3);
  background: linear-gradient(135deg, #f0c040, #f5d060);
}

.bar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.char-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-gold);
}

.char-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
}

.back-btn {
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 8px;
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: transparent;
}

.back-btn:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

/* ========== 主体 ========== */
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 100px;
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

.stat-value.healthy { color: var(--hp-green); }
.stat-value.wounded { color: var(--hp-yellow); }
.stat-value.critical { color: var(--hp-red); }
.stat-value.dead-text { color: #6c6c80; }
.stat-value.gold { color: var(--accent-gold); }

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

/* ========== 详情面板（模式2） ========== */
.content-grid {
  display: grid;
  grid-template-columns: 220px 1fr 1fr;
  gap: 24px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  border: 3px solid var(--border-color);
  margin-bottom: 20px;
}

.avatar-area .avatar-icon {
  font-size: 52px;
}

.stat-block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 14px;
  letter-spacing: 2px;
}

.stats-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.middle-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hp-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.hp-bar-wrapper {
  width: 100%;
  height: 22px;
  background: #2a2a4a;
  border-radius: 11px;
  overflow: hidden;
}

.hp-bar-fill {
  height: 100%;
  border-radius: 11px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.hp-text {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.info-icon {
  font-size: 20px;
  line-height: 1;
}

.info-label {
  color: var(--text-secondary);
  min-width: 40px;
}

.info-value {
  font-weight: 600;
  color: var(--text-primary);
}

.info-value.gold {
  color: var(--accent-gold);
  font-size: 18px;
}

.right-panel {
  min-height: 280px;
}

.detail-tabs {
  height: 100%;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.detail-tabs :deep(.el-tabs__item) {
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
}

.detail-tabs :deep(.el-tabs__item.is-active) {
  color: var(--accent-gold);
}

.detail-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--accent-gold);
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inv-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.inv-item:hover {
  border-color: var(--border-color);
}

.inv-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.inv-qty {
  border-radius: 12px;
  font-weight: 600;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.record-icon {
  font-size: 18px;
  line-height: 1;
}

.record-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.empty-tab p {
  color: var(--text-muted);
  font-size: 14px;
}

/* ========== 进入副本按钮 ========== */
.bottom-action {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.enter-dungeon-btn {
  font-size: 18px;
  font-weight: 700;
  padding: 14px 60px;
  border-radius: 12px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  border: none;
  color: #1a1a2e;
  transition: transform 0.15s, box-shadow 0.15s;
}

.enter-dungeon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(240, 192, 64, 0.35);
  background: linear-gradient(135deg, #f0c040, #f5d060);
}

.enter-dungeon-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.enter-dungeon-btn.is-disabled {
  background: #4a4a5a !important;
  color: #7a7a8a !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

/* ========== 响应式 ========== */
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .left-panel .stats-grid {
    max-width: 300px;
  }
}
</style>
