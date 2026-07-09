<template>
  <div class="inventory-panel">
    <!-- 网格背包 -->
    <div class="inventory-grid">
      <div
        v-for="(item, index) in gridSlots"
        :key="index"
        class="slot-cell"
        :class="{ empty: !item }"
      >
        <template v-if="item">
          <el-tooltip
            placement="top"
            :show-after="300"
            popper-class="inventory-tooltip"
          >
            <template #content>
              <div class="tooltip-content">
                <div class="tooltip-header">
                  <span class="tooltip-icon">{{ item.icon }}</span>
                  <span class="tooltip-name">{{ item.name }}</span>
                </div>
                <div class="tooltip-desc">{{ item.description }}</div>
                <div class="tooltip-qty">数量：{{ item.qty }}</div>
                <div v-if="item.specialNote && item.specialNote !== '无'" class="tooltip-special">
                  ✨ {{ item.specialNote }}
                </div>
              </div>
            </template>
            <div class="slot-content">
              <span class="item-icon">{{ item.icon }}</span>
              <span v-if="item.qty > 1" class="item-qty">{{ item.qty }}</span>
            </div>
          </el-tooltip>
        </template>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="inventory-footer">
      <span class="footer-info">持有物品：{{ itemCount }}</span>
      <el-button type="primary" @click="$emit('close')">关闭背包</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { fetchInventoryApi, MOCK_INVENTORY } from "../api/inventory"
import { useCharacterStore } from "../stores/character"

const TOTAL_SLOTS = 30
const items = ref([])

const emit = defineEmits(["close"])

const characterStore = useCharacterStore()

const itemCount = computed(() => items.value.length)

/** 合并物品与空槽位，组成完整的网格数据 */
const gridSlots = computed(() => {
  const result = [...items.value]
  while (result.length < TOTAL_SLOTS) {
    result.push(null)
  }
  return result
})

onMounted(async () => {
  const characterId = characterStore.currentCharacter?.id
  if (characterId) {
    items.value = await fetchInventoryApi(characterId)
  } else {
    // 无当前角色时直接显示 mock 数据
    items.value = MOCK_INVENTORY
  }
})
</script>

<script>
export default { name: "InventoryPanel" }
</script>

<style scoped>
.inventory-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 540px;
  padding: 8px 0;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.slot-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: border-color 0.2s, background-color 0.2s;
  cursor: default;
}

.slot-cell:not(.empty) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
}

.slot-cell:not(.empty):hover {
  border-color: var(--accent-gold);
  background: rgba(240, 192, 64, 0.08);
}

.slot-cell.empty {
  border: 1px dashed rgba(42, 58, 92, 0.4);
  background: transparent;
}

.slot-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.item-icon {
  font-size: 32px;
  line-height: 1;
  user-select: none;
}

.item-qty {
  position: absolute;
  bottom: 4px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #e0e0e0;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 5px;
  line-height: 1;
}

/* 底部 */
.inventory-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.footer-info {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
