import { defineStore } from "pinia"
import { ref, computed } from "vue"

let nextId = 1

export const useModalStore = defineStore("modal", () => {
  const modalStack = ref([])

  const topModal = computed(() => {
    const len = modalStack.value.length
    return len > 0 ? modalStack.value[len - 1] : null
  })

  /**
   * 打开一个弹窗
   * @param {Object} config
   * @param {string} config.title - 弹窗标题
   * @param {string} config.content - 文本内容（纯文本或 HTML）
   * @param {string} config.component - Vue 组件对象，用于渲染复杂内容
   * @param {Object} config.componentProps - 传给组件的 props
   * @param {Array} config.buttons - 按钮配置 [{ text, type, action }]
   * @param {Function} config.onClose - 关闭时的回调
   */
  function open(config) {
    const id = nextId++
    const modal = {
      id,
      visible: true,
      title: config.title || "",
      content: config.content || "",
      component: config.component || null,
      componentProps: config.componentProps || {},
      buttons: config.buttons || [{ text: "确定", type: "primary" }],
      onClose: config.onClose || null,
    }
    modalStack.value.push(modal)
    return id
  }

  function close(id) {
    const idx = modalStack.value.findIndex((m) => m.id === id)
    if (idx === -1) return
    const modal = modalStack.value[idx]
    modal.visible = false
    if (modal.onClose) modal.onClose()
    setTimeout(() => {
      modalStack.value = modalStack.value.filter((m) => m.id !== id)
    }, 250)
  }

  function closeTop() {
    if (modalStack.value.length > 0) {
      close(modalStack.value[modalStack.value.length - 1].id)
    }
  }

  function closeAll() {
    const ids = modalStack.value.map((m) => m.id)
    ids.forEach((id) => close(id))
  }

  return { modalStack, topModal, open, close, closeTop, closeAll }
})
