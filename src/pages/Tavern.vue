<template>
  <div class="tavern-page" v-if="character">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="bar-left">
          <span class="char-title">{{ character.name }}</span>
          <span class="char-subtitle">Lv.{{ character.level }}</span>
        </div>
        <el-button class="back-btn" @click="goBack">
          返回大厅
        </el-button>
      </div>
    </header>

    <!-- 主体 -->
    <main class="main-content">
      <div class="content-grid">
        <!-- 左侧：头像 + 六维属性 -->
        <section class="panel left-panel">
          <div class="avatar-area">
            <span class="avatar-icon">{{ character.isAlive ? "🧙" : "💀" }}</span>
          </div>
          <div class="stat-block-title">六维属性</div>
          <div class="stats-grid">
            <div
              v-for="stat in statList"
              :key="stat.key"
              class="stat-item"
            >
              <span class="stat-label">{{ stat.label }}</span>
              <span
                class="stat-value"
                :style="{ color: statColor(character.stats[stat.key]) }"
              >
                {{ character.stats[stat.key] }}
              </span>
            </div>
          </div>
        </section>

        <!-- 中间：HP / 金币 / 状态 -->
        <section class="panel middle-panel">
          <div class="hp-section">
            <div class="section-label">
              <span>❤️ 生命值</span>
            </div>
            <div class="hp-bar-wrapper">
              <div
                class="hp-bar-fill"
                :style="{
                  width: hpPercent + '%',
                  backgroundColor: hpColor,
                }"
              ></div>
            </div>
            <div class="hp-text" :style="{ color: hpColor }">
              {{ character.hp }} / {{ character.maxHp }}
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-row">
            <span class="info-icon">💰</span>
            <span class="info-label">金币</span>
            <span class="info-value gold">{{ character.gold }}</span>
          </div>

          <div class="divider"></div>

          <div class="info-row">
            <span class="info-icon">{{ character.isAlive ? "🟢" : "🔴" }}</span>
            <span class="info-label">状态</span>
            <span
              class="info-value"
              :style="{ color: character.isAlive ? '#67c23a' : '#f56c6c' }"
            >
              {{ character.isAlive ? "存活" : "阵亡" }}
            </span>
          </div>
        </section>

        <!-- 右侧：背包 / 通关记录 标签页 -->
        <section class="panel right-panel">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="背包" name="inventory">
              <div v-if="character.inventory && character.inventory.length > 0" class="inventory-list">
                <div
                  v-for="(item, idx) in character.inventory"
                  :key="idx"
                  class="inv-item"
                >
                  <span class="inv-name">{{ item.name }}</span>
                  <el-tag type="info" size="small" class="inv-qty">
                    x{{ item.qty }}
                  </el-tag>
                </div>
              </div>
              <div v-else class="empty-tab">
                <p>背包空空如也……</p>
              </div>
            </el-tab-pane>

            <el-tab-pane label="通关记录" name="records">
              <div v-if="character.completedDungeons && character.completedDungeons.length > 0" class="record-list">
                <div
                  v-for="(dungeon, idx) in character.completedDungeons"
                  :key="idx"
                  class="record-item"
                >
                  <span class="record-icon">🏁</span>
                  <span class="record-name">{{ dungeon }}</span>
                </div>
              </div>
              <div v-else class="empty-tab">
                <p>尚未通关任何副本</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>
      </div>

      <!-- 底部：进入副本 -->
      <div class="bottom-action">
        <el-tooltip
          v-if="!character.isAlive"
          content="角色已阵亡，无法进入副本"
          placement="top"
        >
          <el-button
            class="enter-dungeon-btn"
            size="large"
            disabled
          >
            ⚔️ 进入副本
          </el-button>
        </el-tooltip>
        <el-button
          v-else
          class="enter-dungeon-btn"
          size="large"
          @click="enterDungeon"
        >
          ⚔️ 进入副本
        </el-button>
      </div>
    </main>

    <!-- 底部状态条 -->
    <CharacterStatusBar />
  </div>

  <!-- 无角色时显示 -->
  <div v-else class="page-container">
    <el-card class="page-card">
      <h1>酒馆</h1>
      <p class="placeholder-text">请先在大厅选择一个角色</p>
      <el-button class="mt-16" @click="goBack">返回大厅</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useCharacterStore } from "../stores/character"
import { useDungeonStore } from "../stores/dungeon"
import CharacterStatusBar from "../components/CharacterStatusBar.vue"

const router = useRouter()
const characterStore = useCharacterStore()
const dungeonStore = useDungeonStore()

const activeTab = ref("inventory")

const character = computed(() => characterStore.currentCharacter)

const statList = [
  { key: "strength", label: "力量" },
  { key: "dexterity", label: "敏捷" },
  { key: "constitution", label: "体质" },
  { key: "intelligence", label: "智力" },
  { key: "wisdom", label: "感知" },
  { key: "charisma", label: "魅力" },
]

const hpPercent = computed(() => {
  if (!character.value || character.value.maxHp <= 0) return 0
  return Math.round((character.value.hp / character.value.maxHp) * 100)
})

const hpColor = computed(() => {
  if (hpPercent.value > 60) return "#67c23a"
  if (hpPercent.value >= 30) return "#e6a23c"
  return "#f56c6c"
})

function statColor(val) {
  if (val >= 14) return "#67c23a"
  if (val >= 10) return "#e6a23c"
  return "#f56c6c"
}

function goBack() {
  router.push("/lobby")
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
  padding-bottom: 100px;
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
  padding: 32px 24px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 220px 1fr 1fr;
  gap: 24px;
}

/* ========== 面板通用 ========== */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

/* ========== 左侧面板 ========== */
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

.avatar-icon {
  font-size: 52px;
  line-height: 1;
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

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ========== 中间面板 ========== */
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

/* ========== 右侧面板 ========== */
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

/* 背包列表 */
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

/* 通关记录列表 */
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

/* 空状态标签页 */
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

/* ========== 底部按钮 ========== */
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

/* ========== 无角色回退 ========== */
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding-bottom: 70px;
  background: var(--bg-primary);
}

.page-card {
  width: 400px;
  text-align: center;
}

.placeholder-text {
  color: var(--text-secondary);
  margin-top: 12px;
}

.mt-16 {
  margin-top: 16px;
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


