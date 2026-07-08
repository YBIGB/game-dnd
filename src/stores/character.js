import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { fetchCharactersApi, createCharacterApi, updateCharacterApi, deleteCharacterApi } from "../api/character"

export const useCharacterStore = defineStore("character", () => {
  const characters = ref([])
  const currentCharacter = ref(null)
  const loading = ref(false)

  const characterCount = computed(() => characters.value.length)

  const isCurrentCharacterAlive = computed(() =>
    currentCharacter.value ? currentCharacter.value.isAlive : false
  )

  function selectCharacter(character) {
    currentCharacter.value = character
  }

  async function fetchCharacters() {
    loading.value = true
    try {
      const data = await fetchCharactersApi()
      characters.value = data.characters || data
    } catch {
      // 后端不可用时保持空列表
      characters.value = []
    } finally {
      loading.value = false
    }
  }

  async function addCharacter(character) {
    const data = await createCharacterApi({
      name: character.name,
      stats: character.stats,
    })
    const created = data.character || data
    characters.value.push(created)
    return created
  }

  async function removeCharacter(id) {
    const idx = characters.value.findIndex((c) => c.id === id)
    if (idx === -1) return
    await deleteCharacterApi(id)
    characters.value.splice(idx, 1)
    if (currentCharacter.value && currentCharacter.value.id === id) {
      currentCharacter.value = null
    }
  }

  async function updateCharacter(id, data) {
    const result = await updateCharacterApi(id, data)
    const updated = result.character || result
    const idx = characters.value.findIndex((c) => c.id === id)
    if (idx !== -1) {
      characters.value[idx] = { ...characters.value[idx], ...updated }
    }
    if (currentCharacter.value && currentCharacter.value.id === id) {
      currentCharacter.value = { ...currentCharacter.value, ...updated }
    }
    return updated
  }

  return {
    characters,
    currentCharacter,
    loading,
    characterCount,
    isCurrentCharacterAlive,
    selectCharacter,
    fetchCharacters,
    addCharacter,
    removeCharacter,
    updateCharacter,
  }
})
