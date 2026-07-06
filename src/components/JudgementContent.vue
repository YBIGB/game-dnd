<template>
  <div class="judgement-content">
    <!-- 过程行：掷骰表达式和结果 -->
    <div class="judgement-row">
      <span class="row-label">🎲 掷骰</span>
      <span class="row-value">掷出 1d20 = <strong>{{ roll.raw }}</strong></span>
    </div>

    <!-- 调整行：调整值计算 -->
    <div v-if="roll.modifier !== 0" class="judgement-row">
      <span class="row-label">⚡ 调整值</span>
      <span class="row-value modifier" :class="roll.modifier > 0 ? 'positive' : 'negative'">
        {{ roll.modifier > 0 ? '+' : '' }}{{ roll.modifier }}
      </span>
    </div>

    <div class="divider"></div>

    <!-- 结果行：最终数值 -->
    <div class="judgement-row">
      <span class="row-label">📊 最终结果</span>
      <span class="row-value total">{{ roll.total }}</span>
    </div>

    <!-- DC -->
    <div class="judgement-row">
      <span class="row-label">🎯 难度等级 (DC)</span>
      <span class="row-value dc">{{ roll.dc }}</span>
    </div>

    <!-- 判定行：成功/失败 + 结果描述 -->
    <div class="verdict-section">
      <div class="verdict-badge" :class="roll.success ? 'success' : 'failure'">
        {{ roll.success ? '✅ 成功' : '❌ 失败' }}
      </div>
    </div>

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
  padding: 4px 0;
}

.judgement-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.row-label {
  color: #a0a0b0;
  font-size: 13px;
}

.row-value {
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 600;
}

.row-value strong {
  color: #f0c040;
  font-size: 20px;
}

.row-value.modifier {
  font-size: 18px;
}

.row-value.modifier.positive {
  color: #67c23a;
}

.row-value.modifier.negative {
  color: #f56c6c;
}

.row-value.total {
  font-size: 24px;
  font-weight: 800;
  color: #e0e0e0;
}

.row-value.dc {
  font-size: 20px;
  font-weight: 700;
  color: #e6a23c;
}

.divider {
  height: 1px;
  background: #2a3a5c;
  margin: 4px 0;
}

.verdict-section {
  text-align: center;
  padding: 12px 0 4px;
}

.verdict-badge {
  display: inline-block;
  padding: 8px 28px;
  border-radius: 8px;
  font-size: 16px;
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
  text-align: center;
  margin-top: 8px;
  color: #a0a0b0;
  font-size: 13px;
  font-style: italic;
  line-height: 1.5;
}
</style>