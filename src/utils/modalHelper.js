import { useModalStore } from "../stores/modal"
import JudgementContent from "../components/JudgementContent.vue"

/**
 * 显示一个提示弹窗（只有"确定"按钮）
 * @param {string} title - 弹窗标题
 * @param {string} content - 文本内容（支持 HTML）
 */
export function showPrompt(title, content) {
  const modalStore = useModalStore()
  modalStore.open({
    title,
    content,
    buttons: [{ text: "确定", type: "primary" }],
  })
}

/**
 * 显示一个判定结果弹窗
 * @param {Object} roll
 * @param {number} roll.raw - 原始掷骰结果 (1-20)
 * @param {number} roll.modifier - 调整值
 * @param {number} roll.total - 最终结果
 * @param {number} roll.dc - 难度等级
 * @param {boolean} roll.success - 是否成功
 * @param {string} roll.description - 额外描述
 * @param {string} title - 弹窗标题（默认 "判定结果"）
 */
export function showJudgement(roll, title = "判定结果") {
  const modalStore = useModalStore()
  modalStore.open({
    title,
    component: JudgementContent,
    componentProps: { roll },
    buttons: [{ text: "确定", type: "primary" }],
  })
}
