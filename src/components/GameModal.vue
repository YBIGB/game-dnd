<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container">
          <!-- 标题区 -->
          <div class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <button class="modal-close-btn" @click="handleClose">&times;</button>
          </div>

          <!-- 内容区 -->
          <div class="modal-body">
            <!-- 文本/HTML 内容 -->
            <div v-if="content" v-html="content"></div>
            <!-- 动态组件内容 -->
            <component
              v-if="component"
              :is="component"
              v-bind="componentProps"
              @close="handleClose"
            />
            <!-- 默认插槽（优先级最高） -->
            <slot v-if="$slots.default" />
          </div>

          <!-- 底部按钮区 -->
          <div v-if="buttons.length > 0" class="modal-footer">
            <el-button
              v-for="(btn, i) in buttons"
              :key="i"
              :type="btn.type || 'primary'"
              :class="{ 'modal-btn-primary': btn.primary }"
              @click="handleButtonClick(btn)"
            >
              {{ btn.text }}
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  content: { type: String, default: "" },
  component: { type: [Object, Function], default: null },
  componentProps: { type: Object, default: () => ({}) },
  buttons: { type: Array, default: () => [] },
  closeOnOverlay: { type: Boolean, default: true },
})

const emit = defineEmits(["close", "button-click"])

function handleClose() {
  emit("close")
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

function handleButtonClick(btn) {
  emit("button-click", btn)
  if (btn.action) {
    btn.action()
  }
}
</script>

<script>
export default { name: "GameModal" }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: #1e2a45;
  border: 1px solid #2a3a5c;
  border-radius: 12px;
  min-width: 360px;
  max-width: 520px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2a3a5c;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #f0c040;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #6c6c80;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #f56c6c;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #2a3a5c;
}

/* 淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.92) translateY(-10px);
}
</style>
