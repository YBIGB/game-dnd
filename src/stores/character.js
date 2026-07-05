import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref([])
  const currentCharacter = ref(null)
  const characterCount = computed(() => characters.value.length)
  const isCurrentCharacterAlive = computed(() =>
    currentCharacter.value ? currentCharacter.value.isAlive : false
  )
  return { characters, currentCharacter, characterCount, isCurrentCharacterAlive }
})
