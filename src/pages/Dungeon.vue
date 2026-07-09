<template>
  <div class="dungeon-page">
    <div v-if="!characterStore.currentCharacter" class="no-character-overlay">
      <div class="no-char-card">
        <div class="no-char-icon">⚠️</div>
        <p class="no-char-text">请先在酒馆选择角色再进入副本</p>
        <el-button type="primary" size="large" @click="goTavern">返回酒馆</el-button>
      </div>
    </div>
    <template v-else>
      <div class="dungeon-layout">
        <div class="map-area">
          <div class="map-title">🗺️ 副本地图</div>
          <div class="map-container">
            <svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line v-for="(conn, i) in connections" :key="i" :x1="conn.x1" :y1="conn.y1" :x2="conn.x2" :y2="conn.y2" class="conn-line" />
            </svg>
            <div v-for="node in nodes" :key="node.id" class="map-node" :class="{ active: node.id === currentNodeId }" :style="{ left: node.x + '%', top: node.y + '%' }" @click="selectNode(node.id)">
              <div class="node-icon">{{ node.icon }}</div>
              <div class="node-name">{{ node.name }}</div>
            </div>
          </div>
        </div>
        <div class="scene-panel">
          <div class="scene-header">
            <span class="scene-title">{{ currentScene.icon }} {{ currentScene.name }}</span>
          </div>
          <div class="scene-divider"></div>
          <div class="scene-description">
            <p>{{ currentScene.description }}</p>
          </div>
          <div v-if="currentScene.actions && currentScene.actions.length > 0" class="scene-actions">
            <el-button v-for="(action, i) in currentScene.actions" :key="i" :type="action.type || 'primary'" size="large" class="action-btn" @click="handleAction(action)">
              {{ action.label }}
            </el-button>
          </div>
        </div>
      </div>
      <CharacterStatusBar />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useCharacterStore } from "../stores/character"
import { useDungeonStore } from "../stores/dungeon"
import CharacterStatusBar from "../components/CharacterStatusBar.vue"
import { showPrompt, showJudgement } from "../utils/modalHelper"
import { useModalStore } from "../stores/modal"
import { dungeonActionApi } from "../api/dungeon"
import { ElMessage } from "element-plus"

const router = useRouter()
const characterStore = useCharacterStore()
const dungeonStore = useDungeonStore()

const actionLoading = ref(false)

const nodes = [
  { id: "exit",  name: "出口", icon: "🚩", x: 50, y: 8  },
  { id: "shop",  name: "商店", icon: "🏪", x: 20, y: 40 },
  { id: "start", name: "起点", icon: "🚪", x: 50, y: 40 },
  { id: "grave", name: "墓地", icon: "🪦", x: 80, y: 40 },
  { id: "boss",  name: "头目", icon: "👹", x: 50, y: 72 },
]

const connections = [
  { x1: 50, y1: 8,  x2: 20, y2: 40 },
  { x1: 50, y1: 8,  x2: 50, y2: 40 },
  { x1: 50, y1: 8,  x2: 80, y2: 40 },
  { x1: 20, y1: 40, x2: 50, y2: 40 },
  { x1: 20, y1: 40, x2: 50, y2: 72 },
  { x1: 50, y1: 40, x2: 80, y2: 40 },
  { x1: 50, y1: 40, x2: 50, y2: 72 },
  { x1: 80, y1: 40, x2: 50, y2: 72 },
]

const sceneData = {
  start: {
    name: "起点", icon: "🚪",
    description: "你站在副本的入口处。前方是一条分岔路，左右两侧分别通向商店和墓地，正前方则是头目的领地。选择你的道路。",
    actions: [],
  },
  shop: {
    name: "商店", icon: "🏪",
    description: "昏暗的小店里，柜台后坐着一个独眼龙老板。墙上挂着几件看起来不怎么靠谱的商品。你摸了摸口袋里的金币。",
    actions: [
      { label: "💰 交易",     actionId: "shop_trade",    type: "primary" },
      { label: "🖐️ 盗窃",     actionId: "shop_steal",    type: "warning" },
    ],
  },
  grave: {
    name: "墓地", icon: "🪦",
    description: "墓碑歪斜，枯枝遍地。空气中弥漫着泥土与腐叶的气味。你隐约感觉地下埋着什么。",
    actions: [
      { label: "⛏️ 挖掘",     actionId: "grave_dig",     type: "primary" },
      { label: "💡 灵感",     actionId: "grave_insight", type: "info" },
    ],
  },
  boss: {
    name: "头目", icon: "👹",
    description: "一个高大的身影挡在你面前。他打量着你，嘴角露出一丝冷笑。",
    actions: [
      { label: "⚔️ 战斗",     actionId: "boss_fight",    type: "danger" },
      { label: "💬 说服",     actionId: "boss_persuade", type: "success" },
    ],
  },
  exit: {
    name: "出口", icon: "🚩", description: "", actions: [],
  },
}

const currentNodeId = ref("start")

const currentScene = computed(() => {
  const base = sceneData[currentNodeId.value]

  if (currentNodeId.value === "exit") {
    if (dungeonStore.dungeonState.hasKey) {
      return {
        ...base,
        description: "你用钥匙打开了铁门，外面是自由的世界！",
        actions: [{ label: "🚩 离开副本", actionId: "exit_leave", type: "success" }],
      }
    }
    return {
      ...base,
      description: "一扇沉重的铁门挡住了去路，门上的锁孔看起来需要一把特殊的钥匙。",
      actions: [],
    }
  }

  function hasItem(name) {
    const c = characterStore.currentCharacter
    if (!c || !c.inventory) return false
    return c.inventory.some(i => i.itemName === name && i.qty > 0)
  }

  const filtered = base.actions.filter(a => {
    switch (a.actionId) {
      case "shop_trade":    return !dungeonStore.dungeonState.shopTradeDone
      case "shop_steal":    return !dungeonStore.dungeonState.shopRobbed
      case "grave_dig":     return !dungeonStore.dungeonState.graveDug && hasItem("铁铲")
      case "grave_insight": return !dungeonStore.dungeonState.graveInsightDone
      case "boss_fight":    return !dungeonStore.dungeonState.bossDefeated
      case "boss_persuade": return dungeonStore.dungeonState.hasClue
      default:              return true
    }
  })

  return { ...base, actions: filtered }
})

function selectNode(id) {
  if (id === currentNodeId.value) return
  currentNodeId.value = id
}

function getModifier(stat) {
  return Math.floor((stat - 10) / 2)
}

function rollD20(statValue, dc, description) {
  const raw = Math.floor(Math.random() * 20) + 1
  const modifier = getModifier(statValue)
  const total = raw + modifier
  const success = total >= dc
  return { raw, modifier, total, dc, success, description }
}

function handleAction(action) {
  switch (action.actionId) {
    case "shop_trade":    return handleShopTrade()
    case "shop_steal":    return handleShopSteal()
    case "grave_dig":     return handleGraveDig()
    case "grave_insight": return handleGraveInsight()
    case "boss_fight":    return handleBossFight()
    case "boss_persuade": return handleBossPersuade()
    case "exit_leave":    return handleExitLeave()
  }
}

async function tryApiAction(actionId, localFn) {
  if (!characterStore.currentCharacter) return
  actionLoading.value = true
  try {
    const data = await dungeonActionApi({
      actionId,
      characterId: characterStore.currentCharacter.id,
      dungeonState: { ...dungeonStore.dungeonState },
    })
    // API 成功，应用后端返回的更新
    if (data.dungeonUpdates) {
      dungeonStore.applyServerUpdates(data.dungeonUpdates)
    }
    if (data.updatedCharacter) {
      characterStore.updateCharacter(characterStore.currentCharacter.id, data.updatedCharacter)
    }
    if (data.roll) {
      showJudgement(data.roll, "判定结果")
    }
    if (data.message) {
      showPrompt("结果", data.message)
    }
    return data
  } catch (err) {
    // API 不可用时回退到本地逻辑
    ElMessage.warning("后端暂未连接，使用本地判定")
    localFn()
    actionLoading.value = false
  }
}

async function handleShopTrade() {
  await tryApiAction("shop_trade", () => {
    const cost = 50
    const chara = characterStore.currentCharacter
    if (chara.gold < cost) {
      showPrompt("提示", "金币不足！购买铁铲需要 50 金币。")
      return
    }
    chara.gold -= cost
    chara.inventory.push({ itemId: 4, itemName: "铁铲", qty: 1 })
    dungeonStore.dungeonState.shopTradeDone = true
    showPrompt("获得物品", "你花 50 金币购买了一把铁铲！")
  })
}

async function handleShopSteal() {
  await tryApiAction("shop_steal", () => {
    const roll = rollD20(characterStore.currentCharacter.stats.dexterity, 15, "")
    if (roll.success) {
      characterStore.currentCharacter.gold += 30
      roll.description = "成功！你顺手摸走了 30 枚金币！"
    } else {
      roll.description = "失败！老板瞪了你一眼，你赶紧缩回了手。"
    }
    dungeonStore.dungeonState.shopRobbed = true
    showJudgement(roll, "🎯 巧手检定 - 盗窃")
  })
}

async function handleGraveDig() {
  await tryApiAction("grave_dig", () => {
    const inv = characterStore.currentCharacter.inventory
    const idx = inv.findIndex(i => i.itemName === "铁铲")
    if (idx !== -1) {
      inv[idx].qty--
      if (inv[idx].qty <= 0) inv.splice(idx, 1)
    }
    dungeonStore.dungeonState.hasKey = true
    dungeonStore.dungeonState.graveDug = true
    showPrompt("获得物品", "你挖掘了一番，找到了一把生锈的钥匙！")
  })
}

async function handleGraveInsight() {
  await tryApiAction("grave_insight", () => {
    const roll = rollD20(characterStore.currentCharacter.stats.wisdom, 12, "")
    if (roll.success) {
      dungeonStore.dungeonState.hasClue = true
      roll.description = "你敏锐地察觉到了隐藏的线索！一张泛黄的纸条上写着可疑的文字。"
    } else {
      roll.description = "你没有发现任何特别的东西。"
    }
    dungeonStore.dungeonState.graveInsightDone = true
    showJudgement(roll, "💡 感知检定 - 灵感")
  })
}

async function handleBossFight() {
  await tryApiAction("boss_fight", () => {
    const roll = rollD20(characterStore.currentCharacter.stats.strength, 13, "")
    if (roll.success) {
      characterStore.currentCharacter.inventory.push({ itemId: 5, itemName: "纪念章", qty: 1 })
      dungeonStore.dungeonState.bossDefeated = true
      roll.description = "你击败了头目！从他身上找到了一枚纪念章。"
    } else {
      roll.description = "头目轻松挡下了你的攻击，你需要重新寻找机会。"
    }
    showJudgement(roll, "⚔️ 力量检定 - 战斗")
  })
}

async function handleBossPersuade() {
  await tryApiAction("boss_persuade", () => {
    dungeonStore.dungeonState.hasClue = false
    dungeonStore.dungeonState.hasKey = true
    showPrompt("提示", "你出示了那张纸条，头目沉默片刻，扔给你一把钥匙。")
  })
}

async function handleExitLeave() {
  const data = await tryApiAction("exit_leave", () => {
    const modalStore = useModalStore()
    modalStore.open({
      title: "🎉 恭喜通关！",
      content: "你成功通过了副本的考验！<br>所有物品和金币已保留。",
      buttons: [{
        text: "确定",
        type: "primary",
        action: () => {
          characterStore.currentCharacter.completedDungeons.push("demo副本")
          dungeonStore.resetDungeon()
          router.push("/tavern")
        }
      }]
    })
  })
  // API 路径：后端已处理通关逻辑，仍需弹窗确认
  if (data) {
    const modalStore = useModalStore()
    modalStore.open({
      title: "🎉 恭喜通关！",
      content: "你成功通过了副本的考验！<br>所有物品和金币已保留。",
      buttons: [{
        text: "确定",
        type: "primary",
        action: () => {
          dungeonStore.resetDungeon()
          router.push("/tavern")
        }
      }]
    })
  }
}

function goTavern() {
  router.push("/tavern")
}

onMounted(() => {
  dungeonStore.resetDungeon()
  currentNodeId.value = "start"
})
</script>

<style scoped>
.dungeon-layout { display: flex; min-height: 100vh; }
.map-area { width: 33.333%; min-width: 300px; background: var(--bg-secondary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; padding: 32px 16px; }
.map-title { font-size: 18px; font-weight: 700; color: var(--accent-gold); margin-bottom: 28px; letter-spacing: 2px; }
.map-container { position: relative; width: 100%; max-width: 260px; aspect-ratio: 5 / 6; flex-shrink: 0; }
.map-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
.conn-line { stroke: #2a3a5c; stroke-width: 0.6; stroke-dasharray: 1.5 1; opacity: 0.6; }
.map-node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; z-index: 2; padding: 8px 10px; border-radius: 12px; background: var(--bg-card); border: 2px solid var(--border-color); transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; min-width: 64px; }
.map-node:hover { border-color: #4a6a9a; background: #243250; }
.map-node.active { border-color: var(--accent-gold); box-shadow: 0 0 16px rgba(240, 192, 64, 0.35), inset 0 0 8px rgba(240, 192, 64, 0.1); background: #2a3858; }
.node-icon { font-size: 28px; line-height: 1; }
.node-name { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 1px; }
.map-node.active .node-name { color: var(--accent-gold); }
.scene-panel { flex: 1; padding: 48px 48px 32px; display: flex; flex-direction: column; max-width: 720px; }
.scene-header { margin-bottom: 4px; }
.scene-title { font-size: 26px; font-weight: 700; color: var(--accent-gold); }
.scene-divider { height: 2px; background: linear-gradient(90deg, var(--accent-gold), transparent); margin: 16px 0 24px; width: 80px; }
.scene-description p { font-size: 16px; line-height: 1.8; color: var(--text-primary); max-width: 560px; }
.scene-actions { margin-top: 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.action-btn { min-width: 180px; font-size: 15px; font-weight: 600; letter-spacing: 1px; }
</style>