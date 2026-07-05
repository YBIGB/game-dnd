import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useCharacterStore = defineStore("character", () => {
  const characters = ref([])
  const currentCharacter = ref(null)

  const characterCount = computed(() => characters.value.length)

  const isCurrentCharacterAlive = computed(() =>
    currentCharacter.value ? currentCharacter.value.isAlive : false
  )

  function selectCharacter(character) {
    currentCharacter.value = character
  }

  function addCharacter(character) {
    characters.value.push(character)
  }

  function removeCharacter(id) {
    const idx = characters.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      characters.value.splice(idx, 1)
      if (currentCharacter.value && currentCharacter.value.id === id) {
        currentCharacter.value = null
      }
    }
  }

  function initDemoData() {
    if (characters.value.length > 0) return
    characters.value.push({
      id: 1,
      name: "伊兰迪尔",
      level: 3,
      hp: 24,
      maxHp: 30,
      gold: 150,
      stats: {
        strength: 14,
        dexterity: 12,
        constitution: 16,
        intelligence: 10,
        wisdom: 8,
        charisma: 13,
      },
      inventory: [
        { name: "铁剑", qty: 1 },
        { name: "治疗药水", qty: 2 },
      ],
      completedDungeons: ["幽暗洞穴"],
      isAlive: true,
    })
    characters.value.push({
      id: 2,
      name: "塞尔温",
      level: 1,
      hp: 0,
      maxHp: 20,
      gold: 50,
      stats: {
        strength: 8,
        dexterity: 15,
        constitution: 10,
        intelligence: 14,
        wisdom: 12,
        charisma: 16,
      },
      inventory: [{ name: "短弓", qty: 1 }],
      completedDungeons: [],
      isAlive: false,
    })
  }

  return {
    characters,
    currentCharacter,
    characterCount,
    isCurrentCharacterAlive,
    selectCharacter,
    addCharacter,
    removeCharacter,
    initDemoData,
  }
})
