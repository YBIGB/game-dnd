import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDungeonStore = defineStore('dungeon', () => {
  const dungeonState = ref({
    hasKey: false,
    hasClue: false,
    shopRobbed: false,
    graveDug: false,
    bossDefeated: false,
  })
  function resetDungeon() {
    dungeonState.value = { hasKey: false, hasClue: false, shopRobbed: false, graveDug: false, bossDefeated: false }
  }
  return { dungeonState, resetDungeon }
})
