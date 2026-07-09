<template>
  <div class="tavern-page" :style="{ backgroundImage: `linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(15,15,35,0.85) 100%), url(${tavernBg})` }">
    <!-- ==================== 模式1：角色列表（未选中角色时） ==================== -->
    <template v-if="!characterStore.currentCharacter">
      <header class="top-bar">
        <div class="top-bar-inner">
          <div class="welcome-text">
            <span class="welcome-icon">👋</span>
            <span>欢迎回来，{{ authStore.username || "冒险者" }}</span>
          </div>
          <el-button v-if="!hasAliveCharacter" type="primary" class="action-btn" @click="goCreateCharacter">+ 新建角色</el-button>
        </div>
      </header>

      <main class="main-content">
        <div v-if="characterStore.characters.length === 0" class="empty-state">
          <div class="empty-icon">🎒</div>
          <p class="empty-title">还没有角色</p>
          <p class="empty-desc">点击右上角新建你的第一位冒险者</p>
          <el-button type="primary" size="large" class="empty-btn" @click="goCreateCharacter">创建角色</el-button>
        </div>

        <div v-else class="card-grid">
          <div v-for="c in characterStore.characters" :key="c.id" class="character-card" :class="{ dead: !c.isAlive }" @click="focusCharacter(c)">
            <div class="avatar-section"><span class="avatar-icon">{{ c.isAlive ? "🧙" : "💀" }}</span></div>
            <div class="info-section">
              <div class="char-name">{{ c.name }}</div>
              <div class="char-level">Lv.{{ c.level }}</div>
              <div class="char-stats">
                <div class="stat-row"><span class="stat-icon">❤️</span><span class="stat-label">HP</span><span class="stat-value" :class="hpClass(c)">{{ c.hp }} / {{ c.maxHp }}</span></div>
                <div class="stat-row"><span class="stat-icon">💰</span><span class="stat-label">金币</span><span class="stat-value gold">{{ c.gold }}</span></div>
              </div>
            </div>
            <el-popconfirm
              title="确定要遣散该冒险者吗？"
              confirm-button-text="遣散"
              cancel-button-text="取消"
              @confirm.stop="dismissCharacterFromList(c)"
            >
              <template #reference>
                <el-button class="dismiss-btn" size="small" text type="danger" @click.stop>
                  遣散
                </el-button>
              </template>
            </el-popconfirm>
            <div class="status-badge" :class="c.isAlive ? 'alive' : 'dead'">{{ c.isAlive ? "存活" : "阵亡" }}</div>
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
          <div class="bar-right">
            <el-button class="back-btn" @click="backToList">返回酒馆</el-button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="content-grid">
          <section class="panel left-panel">
            <div class="avatar-area"><span class="avatar-icon">{{ characterStore.currentCharacter.isAlive ? "🧙" : "💀" }}</span></div>
            <div class="stat-block-title">六维属性</div>
            <div class="stats-grid">
              <div v-for="stat in statList" :key="stat.key" class="stat-item">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="stat-value" :style="{ color: statColor(characterStore.currentCharacter.stats[stat.key]) }">{{ characterStore.currentCharacter.stats[stat.key] }}</span>
              </div>
            </div>
          </section>

          <section class="panel middle-panel">
            <div class="hp-section">
              <div class="section-label">❤️ 生命值</div>
              <div class="hp-bar-wrapper"><div class="hp-bar-fill" :style="{ width: hpPercent + '%', backgroundColor: hpColor }"></div></div>
              <div class="hp-text" :style="{ color: hpColor }">{{ characterStore.currentCharacter.hp }} / {{ characterStore.currentCharacter.maxHp }}</div>
            </div>
            <div class="divider"></div>
            <div class="info-row"><span class="info-icon">💰</span><span class="info-label">金币</span><span class="info-value gold">{{ characterStore.currentCharacter.gold }}</span></div>
            <div class="divider"></div>
            <div class="info-row">
              <span class="info-icon">{{ characterStore.currentCharacter.isAlive ? "🟢" : "🔴" }}</span>
              <span class="info-label">状态</span>
              <span class="info-value" :style="{ color: characterStore.currentCharacter.isAlive ? '#67c23a' : '#f56c6c' }">{{ characterStore.currentCharacter.isAlive ? "存活" : "阵亡" }}</span>
            </div>
          </section>

          <section class="panel right-panel">
            <el-tabs v-model="activeTab" class="detail-tabs">
              <el-tab-pane label="背包" name="inventory">
                <div v-if="characterStore.currentCharacter.inventory && characterStore.currentCharacter.inventory.length > 0" class="inventory-list">
                  <div v-for="(item, idx) in characterStore.currentCharacter.inventory" :key="idx" class="inv-item">
                    <span class="inv-name">{{ item.itemName }}</span>
                    <el-tag class="inv-qty" size="small" type="info">×{{ item.qty }}</el-tag>
                  </div>
                </div>
                <div v-else class="empty-tab"><p>背包空空如也</p></div>
              </el-tab-pane>
              <el-tab-pane label="冒险记录" name="records">
                <div v-if="characterStore.currentCharacter.completedDungeons && characterStore.currentCharacter.completedDungeons.length > 0" class="record-list">
                  <div v-for="(name, idx) in characterStore.currentCharacter.completedDungeons" :key="idx" class="record-item">
                    <span class="record-icon">🏆</span>
                    <span class="record-name">{{ name }}</span>
                  </div>
                </div>
                <div v-else class="empty-tab"><p>尚未通关任何副本</p></div>
              </el-tab-pane>
            </el-tabs>
          </section>
        </div>

        <div class="bottom-action">
          <el-button
            class="enter-dungeon-btn"
            :class="{ 'is-disabled': !characterStore.isCurrentCharacterAlive }"
            :disabled="!characterStore.isCurrentCharacterAlive"
            @click="goDungeon"
          >
            进入副本
          </el-button>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { useCharacterStore } from "../stores/character"
import { useAuthStore } from "../stores/auth"
import tavernBg from "../assets/tavern-bg.png"

const router = useRouter()
const characterStore = useCharacterStore()
const authStore = useAuthStore()

const activeTab = ref("inventory")

const statList = [
  { key: "strength", label: "力量" },
  { key: "dexterity", label: "敏捷" },
  { key: "constitution", label: "体质" },
  { key: "intelligence", label: "智力" },
  { key: "wisdom", label: "感知" },
  { key: "charisma", label: "魅力" },
]

// 页面挂载时从后端拉取角色列表
onMounted(() => {
  characterStore.fetchCharacters()
})

// 是否有存活角色
const hasAliveCharacter = computed(() =>
  characterStore.characters.some((c) => c.isAlive)
)

function goCreateCharacter() {
  router.push("/create-character")
}

function focusCharacter(c) {
  characterStore.selectCharacter(c)
}

function backToList() {
  characterStore.selectCharacter(null)
}

function goDungeon() {
  router.push("/dungeon")
}

async function dismissCharacter() {
  const c = characterStore.currentCharacter
  if (!c) return
  try {
    await characterStore.removeCharacter(c.id)
    ElMessage.success(`冒险者 ${c.name} 已被遣散`)
  } catch (err) {
    ElMessage.error(err.message || "遣散失败")
  }
}

async function dismissCharacterFromList(c) {
  try {
    await characterStore.removeCharacter(c.id)
    ElMessage.success(`冒险者 ${c.name} 已被遣散`)
  } catch (err) {
    ElMessage.error(err.message || "遣散失败")
  }
}

const hpPercent = computed(() => {
  if (!characterStore.currentCharacter) return 0
  return (characterStore.currentCharacter.hp / characterStore.currentCharacter.maxHp) * 100
})

const hpColor = computed(() => {
  if (hpPercent.value > 60) return "#67c23a"
  if (hpPercent.value >= 30) return "#e6a23c"
  return "#f56c6c"
})

function hpClass(c) {
  if (!c.isAlive) return "dead-text"
  const ratio = c.hp / c.maxHp
  if (ratio > 0.6) return "healthy"
  if (ratio >= 0.3) return "warning"
  return "critical"
}

function statColor(val) {
  if (val >= 16) return "#f0c040"
  if (val >= 12) return "#67c23a"
  if (val >= 8) return "#a0a0b8"
  return "#f56c6c"
}
</script>

<style scoped>
:root {
  --bg-page: #0a0a1a;
  --bg-card: rgba(20, 20, 45, 0.85);
  --border-color: #2a3a5c;
  --text-primary: #e8e8f0;
  --text-secondary: #8888a8;
  --text-muted: #6c6c80;
  --accent-gold: #f0c040;
  --hp-green: #67c23a;
  --hp-yellow: #e6a23c;
  --hp-red: #f56c6c;
}

.tavern-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding-bottom: 40px;
}

.top-bar {
  background: rgba(15, 15, 35, 0.9);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-text {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.welcome-icon { font-size: 24px; line-height: 1; }

.action-btn { font-weight: 600; letter-spacing: 1px; }

.bar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.char-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-gold);
}

.char-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn { font-weight: 600; }

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-icon { font-size: 72px; margin-bottom: 16px; }
.empty-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.empty-desc { color: var(--text-muted); font-size: 15px; margin: 0 0 28px 0; }
.empty-btn { font-weight: 600; }

/* ========== 卡片网格 ========== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.character-card {
  display: flex;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, box-shadow 0.15s;
  position: relative;
}

.character-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent-gold);
  box-shadow: 0 8px 24px rgba(240, 192, 64, 0.12);
}

.character-card.dead {
  opacity: 0.55;
}

.dismiss-btn {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 12px;
  padding: 2px 8px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.character-card:hover .dismiss-btn {
  opacity: 1;
}

.avatar-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.avatar-icon { font-size: 32px; line-height: 1; }

.info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.char-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-level {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-gold);
}

.char-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.stat-row .stat-icon { font-size: 14px; line-height: 1; }
.stat-label { color: var(--text-muted); min-width: 24px; }

.stat-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stat-value.healthy { color: var(--hp-green); }
.stat-value.warning { color: var(--hp-yellow); }
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

.left-panel { display: flex; flex-direction: column; align-items: center; }

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

.avatar-area .avatar-icon { font-size: 52px; }
.stat-block-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 14px; letter-spacing: 2px; }
.stats-grid { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.stat-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; }
.stat-item .stat-value { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }

.middle-panel { display: flex; flex-direction: column; gap: 16px; }
.hp-section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.hp-bar-wrapper { width: 100%; height: 22px; background: #2a2a4a; border-radius: 11px; overflow: hidden; }
.hp-bar-fill { height: 100%; border-radius: 11px; transition: width 0.3s ease, background-color 0.3s ease; }
.hp-text { font-size: 20px; font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
.divider { height: 1px; background: var(--border-color); margin: 4px 0; }
.info-row { display: flex; align-items: center; gap: 10px; font-size: 16px; }
.info-icon { font-size: 20px; line-height: 1; }
.info-row .info-label { color: var(--text-secondary); min-width: 40px; }
.info-value { font-weight: 600; color: var(--text-primary); }
.info-value.gold { color: var(--accent-gold); font-size: 18px; }

.right-panel { min-height: 280px; }
.detail-tabs { height: 100%; }
.detail-tabs :deep(.el-tabs__header) { margin-bottom: 16px; }
.detail-tabs :deep(.el-tabs__item) { color: var(--text-secondary); font-size: 15px; font-weight: 600; }
.detail-tabs :deep(.el-tabs__item.is-active) { color: var(--accent-gold); }
.detail-tabs :deep(.el-tabs__active-bar) { background-color: var(--accent-gold); }

.inventory-list { display: flex; flex-direction: column; gap: 8px; }
.inv-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid transparent; transition: border-color 0.2s; }
.inv-item:hover { border-color: var(--border-color); }
.inv-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.inv-qty { border-radius: 12px; font-weight: 600; }
.record-list { display: flex; flex-direction: column; gap: 8px; }
.record-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; }
.record-icon { font-size: 18px; line-height: 1; }
.record-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.empty-tab { display: flex; align-items: center; justify-content: center; min-height: 120px; }
.empty-tab p { color: var(--text-muted); font-size: 14px; }

.bottom-action { display: flex; justify-content: center; margin-top: 32px; }

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

.enter-dungeon-btn:active { transform: translateY(0); box-shadow: none; }

.enter-dungeon-btn.is-disabled {
  background: #4a4a5a !important;
  color: #7a7a8a !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .left-panel .stats-grid { max-width: 300px; }
}
</style>