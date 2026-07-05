<template>
  <div class="judgement-content">
    <!-- 掷骰过程 -->
    <div class="dice-roll-section">
      <div class="section-label">🎲 掷骰</div>
      <div class="dice-result">
        <span class="dice-number">{{ roll.raw }}</span>
        <span class="dice-sides">d20</span>
      </div>
    </div>

    <!-- 调整值 -->
    <div v-if="roll.modifier !== 0" class="modifier-section">
      <div class="section-label">⚡ 调整值</div>
      <div class="modifier-value" :class="roll.modifier > 0 ? 'positive' : 'negative'">
        {{ roll.modifier > 0 ? "+" : "" }}{{ roll.modifier }}
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 最终结果 -->
    <div class="total-section">
      <div class="section-label">📊 最终结果</div>
      <div class="total-value">{{ roll.total }}</div>
    </div>

    <!-- 目标 DC -->
    <div class="dc-section">
      <div class="section-label">🎯 难度等级 (DC)</div>
      <div class="dc-value">{{ roll.dc }}</div>
    </div>

    <!-- 成功/失败判定 -->
    <div class="verdict-section">
      <div
        class="verdict-badge"
        :class="roll.success ? 'success' : 'failure'"
      >
        {{ roll.success ? "✅ 成功" : "❌ 失败" }}
      </div>
    </div>

    <!-- 额外描述 -->
    <div v-if="roll.description" class="description">
      {{ roll.description }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  roll: {
    type: Object,
    required: true,
    default: () => ({
      raw: 10,
      modifier: 0,
      total: 10,
      dc: 15,
      success: false,
      description: "",
    }),
  },
})

defineEmits(["close"])
</script>

<script>
export default { name: "JudgementContent" }
</script>

<style scoped>
.judgement-content {
  text-align: center;
}

.section-label {
  font-size: 13px;
  color: #a0a0b0;
  margin-bottom: 6px;
}

/* 掷骰区域 */
.dice-roll-section {
  margin-bottom: 14px;
}

.dice-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dice-number {
  font-size: 36px;
  font-weight: 800;
  color: #f0c040;
}

.dice-sides {
  font-size: 16px;
  color: #6c6c80;
  font-weight: 600;
}

/* 调整值 */
.modifier-section {
  margin-bottom: 14px;
}

.modifier-value {
  font-size: 24px;
  font-weight: 700;
}

.modifier-value.positive {
  color: #67c23a;
}

.modifier-value.negative {
  color: #f56c6c;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #2a3a5c;
  margin: 14px 0;
}

/* 最终结果 */
.total-section {
  margin-bottom: 10px;
}

.total-value {
  font-size: 40px;
  font-weight: 800;
  color: #e0e0e0;
}

/* DC */
.dc-section {
  margin-bottom: 16px;
}

.dc-value {
  font-size: 28px;
  font-weight: 700;
  color: #e6a23c;
}

/* 判定 */
.verdict-section {
  margin-bottom: 10px;
}

.verdict-badge {
  display: inline-block;
  padding: 8px 28px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
}

.verdict-badge.success {
  background: rgba(103, 194, 58, 0.2);
  border: 1px solid #67c23a;
  color: #67c23a;
}

.verdict-badge.failure {
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid #f56c6c;
  color: #f56c6c;
}

.description {
  margin-top: 12px;
  color: #a0a0b0;
  font-size: 13px;
  font-style: italic;
}
</style>
