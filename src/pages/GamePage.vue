<template>
  <ion-page>
    <ion-content class="game">
      <div v-if="game" class="table">
        <div class="top-bar">
          <div>
            <ion-button size="small" fill="outline" router-link="/home"
              >Home</ion-button
            >
            <ion-button size="small" color="warning" @click="refreshCards"
              >Refresh Cards</ion-button
            >
          </div>

          <strong class="turn-pill" :class="{ thinking: isBotThinking }">
            <ion-icon :icon="turnIcon" aria-hidden="true" />
            <span>{{ turnLabel }}</span>
          </strong>
          <span>Difficulty: {{ game.difficulty }}</span>
        </div>

        <div class="opponents">
          <div
            v-for="bot in bots"
            :key="bot.id"
            class="bot"
            :class="{ activeBot: currentPlayer.id === bot.id }"
          >
            <div class="player-name">
              <ion-icon
                v-if="currentPlayer.id === bot.id"
                :icon="hardwareChipOutline"
                aria-hidden="true"
              />
              <span>{{ bot.name }}</span>
            </div>
            <span>{{ bot.hand.length }} cards</span>
          </div>
        </div>

        <div class="center">
          <div class="table-area">
            <div v-if="game.tableCards.length" class="table-cards">
              <img
                v-for="card in game.tableCards"
                :key="card.id"
                :src="getCardImage(card)"
                :alt="label(card)"
                class="table-card-image"
                draggable="false"
              />
            </div>

            <div v-else>No cards on table</div>

            <div class="table-actions">
              <ion-button
                class="play-btn"
                @click="play"
                :disabled="!isHumanTurn || isBotThinking"
              >
                Play
              </ion-button>

              <ion-button
                class="pass-btn"
                fill="outline"
                @click="pass"
                :disabled="!isHumanTurn || isBotThinking || !game.lastMove"
              >
                Pass
              </ion-button>
            </div>
          </div>
        </div>

        <div class="player-hand" aria-label="Your hand">
          <button
            v-for="card in human.hand"
            :key="card.id"
            type="button"
            class="card-button"
            :class="{ selected: selectedIds.includes(card.id) }"
            :disabled="!isHumanTurn || isBotThinking"
            @click="toggleCard(card.id)"
          >
            <img
              :src="getCardImage(card)"
              :alt="label(card)"
              class="card-image"
              draggable="false"
            />
          </button>
        </div>

        <ion-alert
          :is-open="isGameOver"
          header="Game Finished"
          :message="winnerMessage"
          :buttons="['OK']"
          @didDismiss="finishGame"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { IonPage, IonContent, IonButton, IonAlert, IonIcon } from "@ionic/vue";
import { useRouter } from "vue-router";
import {
  hardwareChipOutline,
  personCircleOutline,
} from "ionicons/icons";
import type { Card, GameState } from "../types/game";
import {
  chooseBotMove,
  passTurn,
  playCards,
  createNewGame,
} from "../services/gameEngine";

import {
  clearGame,
  getRanking,
  loadGame,
  saveGame,
  saveRanking,
} from "../services/storage";
import { getCardImage } from "../services/cardImage";

const router = useRouter();
const game = ref<GameState | null>(null);
const selectedIds = ref<string[]>([]);
const isBotThinking = ref(false);
let botTurnTimer: ReturnType<typeof setTimeout> | null = null;
const BOT_TURN_DELAY_MS = 2000;

const currentPlayer = computed(
  () => game.value!.players[game.value!.currentPlayerIndex],
);
const human = computed(() => game.value!.players.find((p) => p.isHuman)!);
const bots = computed(() => game.value!.players.filter((p) => !p.isHuman));
const isHumanTurn = computed(() => currentPlayer.value.isHuman);
const isGameOver = computed(
  () => (game.value?.finishedPlayerIds.length ?? 0) >= (game.value?.players.length ?? 1),
);
const turnIcon = computed(() =>
  isHumanTurn.value ? personCircleOutline : hardwareChipOutline,
);
const turnLabel = computed(() => {
  if (isBotThinking.value && !isHumanTurn.value) {
    return `${currentPlayer.value.name} thinking...`;
  }

  return `${currentPlayer.value.name}'s turn`;
});

const placementPoints = [10, 5, -5, -10];

const winnerMessage = computed(() => {
  if (!game.value || !isGameOver.value) return "";

  return game.value.finishedPlayerIds
    .map((playerId, index) => {
      const player = game.value!.players.find((p) => p.id === playerId);
      const points = placementPoints[index] ?? 0;
      const sign = points > 0 ? "+" : "";
      return `${index + 1}. ${player?.name ?? "Unknown"}: ${sign}${points} pts`;
    })
    .join("\n");
});

onMounted(() => {
  game.value = loadGame();
  if (!game.value) {
    router.replace("/home");
    return;
  }
  runBotTurns();
});

onBeforeUnmount(() => {
  clearBotTurnTimer();
});

function label(card: Card) {
  const rankMap: Record<number, string> = {
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
    15: "2",
  };
  return `${rankMap[card.rank] || card.rank} of ${card.suit}`;
}

function toggleCard(cardId: string) {
  if (!isHumanTurn.value || isBotThinking.value) return;
  selectedIds.value = selectedIds.value.includes(cardId)
    ? selectedIds.value.filter((id) => id !== cardId)
    : [...selectedIds.value, cardId];
}

function selectedCards() {
  return human.value.hand.filter((card) => selectedIds.value.includes(card.id));
}

function play() {
  if (!game.value || isBotThinking.value) return;
  game.value = playCards(game.value, human.value.id, selectedCards());
  selectedIds.value = [];
  saveGame(game.value);
  runBotTurns();
}

function pass() {
  if (!game.value || isBotThinking.value) return;
  game.value = passTurn(game.value);
  saveGame(game.value);
  runBotTurns();
}

function runBotTurns() {
  clearBotTurnTimer();

  if (!game.value || isGameOver.value || currentPlayer.value.isHuman) {
    isBotThinking.value = false;
    return;
  }

  isBotThinking.value = true;
  botTurnTimer = setTimeout(() => {
    if (!game.value || isGameOver.value || currentPlayer.value.isHuman) {
      isBotThinking.value = false;
      botTurnTimer = null;
      return;
    }

    const move = chooseBotMove(game.value, currentPlayer.value);
    game.value = move
      ? playCards(game.value, currentPlayer.value.id, move)
      : passTurn(game.value);
    saveGame(game.value);
    isBotThinking.value = false;
    botTurnTimer = null;
    runBotTurns();
  }, BOT_TURN_DELAY_MS);
}

function clearBotTurnTimer() {
  if (botTurnTimer) {
    clearTimeout(botTurnTimer);
    botTurnTimer = null;
  }
}

function finishGame() {
  if (!game.value || !isGameOver.value) return;

  const ranking = getRanking();
  ranking.totalGames += 1;

  game.value.finishedPlayerIds.forEach((playerId, index) => {
    const points = placementPoints[index] ?? 0;
    ranking.playerScores[playerId] = (ranking.playerScores[playerId] ?? 0) + points;

    if (playerId === "human") {
      ranking.totalPoints += points;
      if (index === 0) ranking.totalWins += 1;
      if (index === game.value!.players.length - 1) ranking.totalLosses += 1;
    }
  });

  Object.entries(game.value.pointCuts).forEach(([playerId, points]) => {
    ranking.playerScores[playerId] = (ranking.playerScores[playerId] ?? 0) + points;

    if (playerId === "human") {
      ranking.totalPoints += points;
    }
  });

  saveRanking(ranking);
  clearGame();
  router.replace("/home");
}
function refreshCards() {
  if (!game.value) return;

  if (!confirm("Refresh cards and restart this game?")) return;

  clearBotTurnTimer();
  isBotThinking.value = false;
  game.value = createNewGame(game.value.difficulty);
  selectedIds.value = [];
  saveGame(game.value);
  runBotTurns();
}
</script>

<style scoped>
.game {
  --background: radial-gradient(
    circle at center,
    #1f7a3a 0%,
    #14532d 60%,
    #052e16 100%
  );
  color: white;
}

.table {
  height: 100dvh;
  width: 100vw;
  padding: max(10px, env(safe-area-inset-top))
    max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
  display: grid;
  grid-template-rows: 44px 82px minmax(120px, 1fr) 128px;
  gap: 8px;
  overflow: hidden;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar strong {
  background: rgba(255, 255, 255, 0.18);
  padding: 8px 18px;
  border-radius: 999px;
}

.turn-pill,
.player-name,
.human-turn-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.turn-pill ion-icon,
.player-name ion-icon,
.human-turn-chip ion-icon {
  font-size: 20px;
  flex: 0 0 auto;
}

.turn-pill.thinking {
  box-shadow: 0 0 0 3px rgba(253, 230, 138, 0.22);
}

.opponents {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.bot {
  min-width: 95px;
  background: linear-gradient(180deg, #ffffff33, #ffffff18);
  border: 1px solid #ffffff33;
  border-radius: 16px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 8px 20px #00000033;
}

.player-name {
  min-height: 22px;
  font-weight: 800;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 95px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 18px;
}

.player-hand {
  width: 100%;
  min-height: 140px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: visible;
  padding: 30px 8px 8px;
}

.card {
  width: 72px;
  min-width: 72px;
  height: 100px;
  border: none;
  background: transparent;
  padding: 0;
  margin-left: -12px;
  text-align: center;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.card:first-child {
  margin-left: 0;
}

.card-image {
  width: 72px;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 8px 14px #00000055;
  background-color: aliceblue;
}

.card.selected {
  transform: translateY(-22px) scale(1.05);
  filter: drop-shadow(0 0 8px #fde68a);
  background-color: aliceblue;
}

.table-card-image {
  width: 68px;
  margin: 4px;
  border-radius: 6px;
  box-shadow: 0 8px 14px #00000055;
  background-color: aliceblue;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

ion-button {
  font-weight: 700;
  letter-spacing: 0.5px;
}
.activeBot {
  outline: 3px solid #fde68a;
  transform: scale(1.05);
}
.card-button {
  width: 72px;
  min-width: 72px;
  height: 100px;
  border: none;
  background: transparent;
  padding: 0;
  margin-left: -12px;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.card-button:first-child {
  margin-left: 0;
}

.card-button.selected {
  transform: translateY(-22px) scale(1.05);
  filter: drop-shadow(0 0 8px #fde68a);
}

.player-hand {
  width: 100%;
  min-height: 128px;
  position: relative;
  display: flex;
  justify-content: safe center;
  align-items: end;
  gap: 0;
  overflow-x: auto;
  overflow-y: visible;
  padding: 30px 8px 8px;
}

.human-turn-chip {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 112px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.66);
  border: 1px solid rgba(255, 255, 255, 0.24);
  font-size: 13px;
  font-weight: 800;
  pointer-events: none;
  z-index: 20;
}

.human-turn-chip.active {
  color: #fde68a;
  border-color: rgba(253, 230, 138, 0.78);
}

.card-button {
  width: 72px;
  min-width: 72px;
  height: 100px;
  border: none;
  background: transparent;
  padding: 0;
  margin-left: -12px;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
  overflow: visible;
}

.card-button:first-child {
  margin-left: 0;
}

.card-button.selected {
  transform: translateY(-16px) scale(1.04);
  filter: drop-shadow(0 0 8px #fde68a);
  z-index: 10;
}
.table-area {
  width: 100%;
  min-height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-actions {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.play-btn {
  min-width: 100px;
}

.pass-btn {
  min-width: 100px;
}

.status {
  margin-bottom: 6px;
}

@media screen and (orientation: landscape) and (max-height: 430px) {
  .table {
    grid-template-rows: 38px 68px minmax(95px, 1fr) 108px;
    gap: 5px;
    padding: 8px;
  }

  .bot {
    padding: 6px;
    min-width: 78px;
    font-size: 12px;
  }

  .card-button {
    width: 58px;
    min-width: 58px;
    height: 82px;
    margin-left: -10px;
  }

  .card-image {
    width: 58px;
  }

  .table-card-image {
    width: 52px;
  }

  .player-hand {
    min-height: 108px;
    padding-top: 24px;
  }
}
</style>
