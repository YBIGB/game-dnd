import { defineStore } from "pinia"
import { ref } from "vue"

const defaultState = () => ({
  hasKey: false,
  hasClue: false,
  shopRobbed: false,
  shopTradeDone: false,
  graveDug: false,
  graveInsightDone: false,
  bossDefeated: false,
})

export const useDungeonStore = defineStore("dungeon", () => {
  const dungeonState = ref(defaultState())

  function resetDungeon() {
    dungeonState.value = defaultState()
  }

  /**
   * 应用后端返回的副本状态更新
   * @param {Partial<typeof defaultState>} updates
   */
  function applyServerUpdates(updates) {
    if (!updates) return
    Object.keys(updates).forEach((key) => {
      if (key in dungeonState.value) {
        dungeonState.value[key] = updates[key]
      }
    })
  }

  return { dungeonState, resetDungeon, applyServerUpdates }
})
