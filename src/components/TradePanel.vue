<template>
  <div class="trade-panel">
    <!-- 双栏布局 -->
    <div class="trade-layout">
      <!-- 玩家侧 -->
      <div class="trade-side">
        <div class="side-header">
          <span class="side-title">🎒 {{ playerName }}</span>
          <span class="gold-display">
            🪙 <strong>{{ playerGoldQty }}</strong> 金币
          </span>
        </div>
        <div class="side-grid">
          <div
            v-for="(item, index) in playerGridSlots"
            :key="'p-' + index"
            class="trade-slot"
            :class="{
              empty: !item,
              'can-sell': item && item.id !== 'gold',
              'no-sell': item && item.id !== 'gold' && playerGoldLowForItem(item),
            }"
            @click="handlePlayerItemClick(item)"
          >
            <template v-if="item && item.id !== 'gold'">
              <el-tooltip
                placement="top"
                :show-after="300"
                popper-class="inventory-tooltip"
              >
                <template #content>
                  <div class="tooltip-body">
                    <div class="tooltip-row"><span class="tooltip-label">名称</span>{{ item.name }}</div>
                    <div class="tooltip-row"><span class="tooltip-label">描述</span>{{ item.description }}</div>
                    <div class="tooltip-row"><span class="tooltip-label">价值</span>💰 {{ item.value }} 金币</div>
                    <div class="tooltip-row"><span class="tooltip-label">数量</span>{{ item.qty }}</div>
                    <div v-if="item.specialNote && item.specialNote !== '无'" class="tooltip-row">
                      <span class="tooltip-label">特殊</span>✨ {{ item.specialNote }}
                    </div>
                  </div>
                </template>
                <div class="slot-inner">
                  <span class="item-icon">{{ item.icon }}</span>
                  <span v-if="item.qty > 1" class="item-qty-badge">{{ item.qty }}</span>
                  <span class="item-value-label">💰{{ item.value }}</span>
                </div>
              </el-tooltip>
            </template>
          </div>
        </div>
      </div>

      <!-- 中间箭头 -->
      <div class="trade-middle">
        <div class="arrow-icon">🔄</div>
        <div class="arrow-sub">交换</div>
      </div>

      <!-- NPC 侧 -->
      <div class="trade-side">
        <div class="side-header">
          <span class="side-title">🏪 {{ npcName }}</span>
          <span class="gold-display">
            🪙 <strong>{{ npcGoldQty }}</strong> 金币
          </span>
        </div>
        <div class="side-grid">
          <div
            v-for="(item, index) in npcGridSlots"
            :key="'n-' + index"
            class="trade-slot"
            :class="{
              empty: !item,
              'can-buy': item && item.id !== 'gold',
              'no-buy': item && item.id !== 'gold' && npcGoldLowForItem(item),
            }"
            @click="handleNpcItemClick(item)"
          >
            <template v-if="item && item.id !== 'gold'">
              <el-tooltip
                placement="top"
                :show-after="300"
                popper-class="inventory-tooltip"
              >
                <template #content>
                  <div class="tooltip-body">
                    <div class="tooltip-row"><span class="tooltip-label">名称</span>{{ item.name }}</div>
                    <div class="tooltip-row"><span class="tooltip-label">描述</span>{{ item.description }}</div>
                    <div class="tooltip-row"><span class="tooltip-label">价格</span>💰 {{ item.value }} 金币</div>
                    <div class="tooltip-row"><span class="tooltip-label">数量</span>{{ item.qty }}</div>
                    <div v-if="item.specialNote && item.specialNote !== '无'" class="tooltip-row">
                      <span class="tooltip-label">特殊</span>✨ {{ item.specialNote }}
                    </div>
                  </div>
                </template>
                <div class="slot-inner">
                  <span class="item-icon">{{ item.icon }}</span>
                  <span v-if="item.qty > 1" class="item-qty-badge">{{ item.qty }}</span>
                  <span class="item-value-label">💰{{ item.value }}</span>
                </div>
              </el-tooltip>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { ElMessage } from "element-plus"

const GRID_COLS = 4

const props = defineProps({
  playerInventory: { type: Array, default: () => [] },
  npcInventory: { type: Array, default: () => [] },
  npcName: { type: String, default: "商店老板" },
  playerName: { type: String, default: "我的背包" },
  onTrade: { type: Function, default: null },
})

const emit = defineEmits(["close", "trade-success"])

/* ── 提取金币 ── */
const playerGoldItem = computed(() =>
  props.playerInventory.find((i) => i.id === "gold")
)
const npcGoldItem = computed(() =>
  props.npcInventory.find((i) => i.id === "gold")
)
const playerGoldQty = computed(() => playerGoldItem.value?.qty ?? 0)
const npcGoldQty = computed(() => npcGoldItem.value?.qty ?? 0)

/* ── 过滤出非金币物品，填充网格 ── */
const playerNonGold = computed(() =>
  props.playerInventory.filter((i) => i.id !== "gold")
)
const npcNonGold = computed(() =>
  props.npcInventory.filter((i) => i.id !== "gold")
)

function fillGrid(items) {
  const result = [...items]
  while (result.length < GRID_COLS * 3) {
    result.push(null)
  }
  return result
}

const playerGridSlots = computed(() => fillGrid(playerNonGold.value))
const npcGridSlots = computed(() => fillGrid(npcNonGold.value))

/* ── 校验 ── */
function playerGoldLowForItem(item) {
  if (!item) return false
  return playerGoldQty.value < item.value
}

function npcGoldLowForItem(item) {
  if (!item) return false
  return npcGoldQty.value < item.value
}

/* ── 交易操作 ── */
function handlePlayerItemClick(item) {
  if (!item || item.id === "gold") return
  // 卖给商店：检查 NPC 资金
  if (npcGoldQty.value < item.value) {
    ElMessage.warning("老板钱不够了，买不起这件物品")
    return
  }
  doTrade(item, "sell")
}

function handleNpcItemClick(item) {
  if (!item || item.id === "gold") return
  // 从商店买：检查玩家资金
  if (playerGoldQty.value < item.value) {
    ElMessage.warning("金币不足，需要 " + item.value + " 金币")
    return
  }
  doTrade(item, "buy")
}

function doTrade(item, direction) {
  // direction: "buy" 买 NPC 的物品, "sell" 卖给 NPC
  const cost = item.value
  const fromKey = direction === "buy" ? "npc" : "player"
  const toKey = direction === "buy" ? "player" : "npc"

  // 更新金币
  const fromGold = fromKey === "player" ? playerGoldItem.value : npcGoldItem.value
  const toGold = toKey === "player" ? playerGoldItem.value : npcGoldItem.value

  if (fromGold) fromGold.qty -= cost
  if (toGold) toGold.qty += cost

  // 转移物品
  const fromInv = fromKey === "player" ? props.playerInventory : props.npcInventory
  const toInv = toKey === "player" ? props.playerInventory : props.npcInventory

  const idx = fromInv.findIndex((i) => i.id === item.id)
  if (idx !== -1) {
    fromInv[idx].qty -= 1
    if (fromInv[idx].qty <= 0) {
      fromInv.splice(idx, 1)
    }
  }

  const existing = toInv.find((i) => i.id === item.id)
  if (existing) {
    existing.qty += 1
  } else {
    toInv.push({ ...item, qty: 1 })
  }

  // 通知父组件
  emit("trade-success", { direction, item, cost })
  if (props.onTrade) {
    props.onTrade(direction, item)
  }
}
</script>

<script>
export default { name: "TradePanel" }
</script>

<style scoped>
.trade-panel {
  min-width: 680px;
  padding: 4px 0;
}

.trade-layout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.trade-side {
  flex: 1;
  min-width: 0;
}

.trade-middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 4px 0;
  flex-shrink: 0;
  user-select: none;
}

.arrow-icon {
  font-size: 32px;
  line-height: 1;
}

.arrow-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
  letter-spacing: 1px;
}

/* 侧边标题 & 金币 */
.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.side-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-gold);
}

.gold-display {
  font-size: 14px;
  color: var(--text-primary);
  background: rgba(240, 192, 64, 0.12);
  padding: 4px 12px;
  border-radius: 6px;
}

.gold-display strong {
  color: #f0c040;
  font-size: 16px;
}

/* 网格 */
.side-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.trade-slot {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: border-color 0.2s, background-color 0.2s, opacity 0.2s;
  cursor: default;
}

.trade-slot:not(.empty) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
}

.trade-slot.can-sell,
.trade-slot.can-buy {
  cursor: pointer;
}

.trade-slot.can-sell:hover,
.trade-slot.can-buy:hover {
  border-color: var(--accent-gold);
  background: rgba(240, 192, 64, 0.12);
}

.trade-slot.no-sell,
.trade-slot.no-buy {
  opacity: 0.45;
  cursor: not-allowed;
}

.trade-slot.no-sell:hover,
.trade-slot.no-buy:hover {
  border-color: #5c3a3a;
  background: rgba(220, 60, 60, 0.08);
}

.trade-slot.empty {
  border: 1px dashed rgba(42, 58, 92, 0.35);
  background: transparent;
}

.slot-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.item-icon {
  font-size: 26px;
  line-height: 1;
  user-select: none;
}

.item-qty-badge {
  position: absolute;
  bottom: 3px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: #e0e0e0;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 4px;
  line-height: 1;
}

.item-value-label {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 9px;
  color: var(--accent-gold);
  background: rgba(0, 0, 0, 0.55);
  padding: 1px 4px;
  border-radius: 4px;
  line-height: 1.3;
}

/* tooltip 样式 */
.tooltip-body {
  max-width: 200px;
}

.tooltip-row {
  display: flex;
  gap: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: #d0d0d0;
}

.tooltip-row + .tooltip-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 3px;
}

.tooltip-label {
  color: #8a8a9a;
  flex-shrink: 0;
  min-width: 32px;
}
</style>
