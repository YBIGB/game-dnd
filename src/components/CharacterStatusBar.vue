<template>
  <div class="status-bar" v-if="characterStore.currentCharacter">
    <div class="status-bar-inner">
      <!-- 角色名 -->
      <div class="stat-item character-name">
        {{ characterStore.currentCharacter.name }}
      </div>

      <!-- HP 进度条 -->
      <div class="stat-item hp-section">
        <span class="hp-label">HP</span>
        <div class="hp-bar-wrapper">
          <div
            class="hp-bar-fill"
            :style="{ width: hpPercent + '%', backgroundColor: hpColor }"
          ></div>
        </div>
        <span class="hp-text" :style="{ color: hpColor }">
          {{ characterStore.currentCharacter.hp }}/{{ characterStore.currentCharacter.maxHp }}
        </span>
      </div>

      <!-- 金币 -->
      <div class="stat-item">
        <span class="stat-icon">💰</span>
        <span class="stat-value">{{ characterStore.currentCharacter.gold }}</span>
      </div>

      <!-- 持有物 -->
      <div class="stat-item">
        <span class="stat-icon">🎒</span>
        <span class="stat-value">{{ totalItems }}</span>
      </div>

      <!-- 特殊标记 -->
      <div class="stat-item markers">
        <span v-if="dungeonStore.dungeonState.hasKey" class="marker-icon" title="持有钥匙">🔑</span>
        <span v-if="dungeonStore.dungeonState.hasClue" class="marker-icon" title="持有线索">📜</span>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div class="status-bar status-bar-empty" v-else>
    <div class="status-bar-inner">
      <span class="empty-text">未选择角色</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useDungeonStore } from '../stores/dungeon'

const characterStore = useCharacterStore()
const dungeonStore = useDungeonStore()

const hpPercent = computed(() => {
  const c = characterStore.currentCharacter
  if (!c || c.maxHp <= 0) return 0
  return Math.round((c.hp / c.maxHp) * 100)
})

const hpColor = computed(() => {
  if (hpPercent.value > 60) return '#67c23a'
  if (hpPercent.value >= 30) return '#e6a23c'
  return '#f56c6c'
})

const totalItems = computed(() => {
  const c = characterStore.currentCharacter
  if (!c || !c.inventory) return 0
  return c.inventory.reduce((sum, item) => sum + (item.qty || 0), 0)
})
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 15, 35, 0.95);
  border-top: 1px solid #2a3a5c;
  backdrop-filter: blur(8px);
  padding: 8px 20px;
  min-height: 52px;
}

.status-bar-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.character-name {
  font-weight: 700;
  font-size: 16px;
  color: #f0c040;
  min-width: 80px;
}

/* HP 区域 */
.hp-section {
  flex: 1;
  min-width: 0;
  gap: 8px;
}

.hp-label {
  font-weight: 600;
  font-size: 13px;
  color: #e0e0e0;
}

.hp-bar-wrapper {
  flex: 1;
  height: 14px;
  background: #2a2a4a;
  border-radius: 7px;
  overflow: hidden;
  min-width: 120px;
}

.hp-bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.hp-text {
  font-size: 13px;
  font-weight: 600;
  min-width: 48px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 金币 / 持有物 */
.stat-icon {
  font-size: 18px;
  line-height: 1;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #e0e0e0;
  font-variant-numeric: tabular-nums;
}

/* 特殊标记 */
.markers {
  margin-left: auto;
  gap: 4px;
}

.marker-icon {
  font-size: 22px;
  line-height: 1;
}

/* 空状态 */
.status-bar-empty .empty-text {
  color: #6c6c80;
  font-size: 14px;
  width: 100%;
  text-align: center;
}
</style>
