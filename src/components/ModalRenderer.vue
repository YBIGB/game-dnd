<template>
  <GameModal
    v-for="modal in modalStore.modalStack"
    :key="modal.id"
    :visible="modal.visible"
    :title="modal.title"
    :content="modal.content"
    :component="modal.component"
    :componentProps="modal.componentProps"
    :buttons="modal.buttons"
    @close="modalStore.close(modal.id)"
    @button-click="(btn) => handleButtonClick(modal, btn)"
  />
</template>

<script setup>
import { useModalStore } from "../stores/modal"
import GameModal from "./GameModal.vue"

const modalStore = useModalStore()

function handleButtonClick(modal, btn) {
  if (btn.close !== false) {
    modalStore.close(modal.id)
  }
}
</script>
