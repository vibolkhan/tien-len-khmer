<template>
  <ion-page>
    <ion-content fullscreen class="game">
      <div v-if="game" class="table">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="top-actions">
            <ion-button size="small" fill="outline" router-link="/home">
              ទំព័រដើម
            </ion-button>

            <ion-button size="small" color="warning" @click="refreshCards">
              ចែកបៀថ្មី
            </ion-button>
          </div>

          <div class="game-title">
            <strong>ទៀនឡេនខ្មែរ</strong>

            <span
              class="turn-badge"
              :class="{ humanTurn: isHumanTurn && !isBotThinking }"
            >
              {{ turnLabel }}
            </span>
          </div>

          <span class="difficulty-badge">
            កម្រិត: {{ difficultyLabel(game.difficulty) }}
          </span>
        </div>

        <!-- Opponents -->
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
              <span>{{ bot.name }} · {{ bot.hand.length }} សន្លឹក</span>
            </div>

            <span class="player-status" :class="playerStatusClass(bot.id)">
              {{ playerStatus(bot.id) }}
            </span>
          </div>
        </div>

        <!-- Center Table -->
        <div class="center">
          <div class="table-area" :class="{ empty: !game.tableCards.length }">
            <div class="table-meta">
              <span class="eyebrow">{{ tableOwnerLabel }}</span>
              <strong>{{ tableMoveLabel }}</strong>
              <small>{{ tableHint }}</small>
            </div>

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

            <div v-else class="empty-table">
              <strong>មិនទាន់មានបៀលើតុ</strong>
              <span>អ្នកអាចចាប់ផ្តើមដោយលេងបៀដែលត្រឹមត្រូវណាមួយ។</span>
            </div>
          </div>
        </div>

        <!-- Human Player Area -->
        <div
          class="player-zone"
          :class="{ active: isHumanTurn && !isBotThinking }"
        >
          <div class="player-control-row">
            <div class="human-info">
              <span class="eyebrow">បៀរបស់អ្នក</span>
              <strong>{{ human.hand.length }} សន្លឹក</strong>

              <span
                v-if="isHumanTurn && !isBotThinking"
                class="inline-turn-chip"
              >
                <ion-icon :icon="personCircleOutline" aria-hidden="true" />
                ដល់វេនអ្នក
              </span>
            </div>

            <div class="selection-feedback" :class="selectionStateClass">
              <strong>{{ selectedMoveLabel }}</strong>
              <small>{{ selectedHint }}</small>
            </div>

            <div class="table-actions" aria-label="សកម្មភាពហ្គេម">
              <ion-button class="pass-btn" @click="pass" :disabled="!canPass">
                <ion-icon
                  slot="start"
                  :icon="playSkipForwardOutline"
                  aria-hidden="true"
                />
                រំលង
              </ion-button>

              <ion-button class="play-btn" @click="play" :disabled="!canPlay">
                <ion-icon
                  slot="start"
                  :icon="playCircleOutline"
                  aria-hidden="true"
                />
                {{ playButtonLabel }}
              </ion-button>
            </div>
          </div>

          <div class="player-hand" aria-label="បៀរបស់អ្នក">
            <button
              v-for="card in human.hand"
              :key="card.id"
              type="button"
              class="card-button"
              :class="{ selected: selectedIds.includes(card.id) }"
              :disabled="!isHumanTurn || isBotThinking"
              :aria-pressed="selectedIds.includes(card.id)"
              :aria-label="label(card)"
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
        </div>

        <ion-alert
          :is-open="isGameOver"
          header="ហ្គេមបានបញ្ចប់"
          :message="winnerMessage"
          :buttons="['យល់ព្រម']"
          @didDismiss="finishGame"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { IonPage, IonContent, IonButton, IonAlert, IonIcon } from "@ionic/vue";
import { useRouter } from "vue-router";
import {
  hardwareChipOutline,
  personCircleOutline,
  playCircleOutline,
  playSkipForwardOutline,
} from "ionicons/icons";
import type { Card, GameState } from "../types/game";
import {
  chooseBotMove,
  passTurn,
  playCards,
  createNewGame,
  canBeat,
  detectMoveType,
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
const hasPlayedGameOverSound = ref(false);
const lastInvalidMoveSignature = ref("");
let botTurnTimer: ReturnType<typeof setTimeout> | null = null;
const BOT_TURN_DELAY_MS = 2000;

function createSound(fileName: string) {
  const sound = new Audio(
    new URL(`../assets/sounds/${fileName}`, import.meta.url).href,
  );
  sound.preload = "auto";
  sound.volume = 0.75;
  return sound;
}

const sounds = {
  lose: createSound("losse.mp3"),
  play: createSound("play.mp3"),
  shuffle: createSound("shuffling.mp3"),
  win: createSound("win.mp3"),
  boom: createSound("boom.mp3"),
  goodBoy: createSound("good-boy.mp3"),
  soSilent: createSound("so-silent.mp3"),
  what: createSound("what.mp3"),
  whoAreYou: createSound("who-are-you.mp3"),
  woooo: createSound("woooo.mp3"),
};

const currentPlayer = computed(
  () => game.value!.players[game.value!.currentPlayerIndex],
);

const human = computed(() => game.value!.players.find((p) => p.isHuman)!);
const bots = computed(() => game.value!.players.filter((p) => !p.isHuman));
const isHumanTurn = computed(() => currentPlayer.value.isHuman);

const selectedCardsForAction = computed(() =>
  human.value.hand.filter((card) => selectedIds.value.includes(card.id)),
);

const canPlay = computed(
  () =>
    isHumanTurn.value &&
    !isBotThinking.value &&
    selectedCardsForAction.value.length > 0 &&
    canBeat(selectedCardsForAction.value, game.value?.lastMove ?? null),
);

const canPass = computed(
  () =>
    isHumanTurn.value && !isBotThinking.value && Boolean(game.value?.lastMove),
);

const isGameOver = computed(
  () =>
    (game.value?.finishedPlayerIds.length ?? 0) >=
    (game.value?.players.length ?? 1),
);

const turnLabel = computed(() => {
  if (isBotThinking.value && !isHumanTurn.value) {
    return `${currentPlayer.value.name} កំពុងគិត...`;
  }

  if (isHumanTurn.value) {
    return "ដល់វេនអ្នក";
  }

  return `ដល់វេន ${currentPlayer.value.name}`;
});

const playButtonLabel = computed(() =>
  selectedIds.value.length > 0 ? `លេង ${selectedIds.value.length}` : "លេង",
);

const tableMoveLabel = computed(() => {
  if (!game.value?.tableCards.length) return "តុទទេ";
  return getMoveName(game.value.tableCards);
});

const tableOwnerLabel = computed(() => {
  if (!game.value?.tableCards.length) return "តុបច្ចុប្បន្ន";

  const lastMove = game.value.lastMove as
    | { playerId?: string }
    | null
    | undefined;

  const playerId = lastMove?.playerId;
  const player = game.value.players.find((p) => p.id === playerId);

  return player ? `${player.name} បានលេង` : "ការលេងបច្ចុប្បន្ន";
});

const tableHint = computed(() => {
  if (!game.value?.tableCards.length) {
    return isHumanTurn.value
      ? "ចាប់ផ្តើមដោយលេងបៀត្រឹមត្រូវណាមួយ។"
      : "កំពុងរង់ចាំបតចាប់ផ្តើម។";
  }

  if (isHumanTurn.value) {
    return `ឈ្នះ ${tableMoveLabel.value} ឬរំលង។`;
  }

  return "កំពុងរង់ចាំបតលេង។";
});

const selectedMoveLabel = computed(() => {
  if (selectedCardsForAction.value.length === 0) return "មិនទាន់ជ្រើសបៀ";
  return getMoveName(selectedCardsForAction.value);
});

const selectedHint = computed(() => {
  if (isBotThinking.value) return "បតកំពុងគិត។";
  if (!isHumanTurn.value) return `កំពុងរង់ចាំ ${currentPlayer.value.name}។`;

  if (selectedCardsForAction.value.length === 0) {
    return game.value?.tableCards.length
      ? `ជ្រើសបៀដើម្បីឈ្នះ ${tableMoveLabel.value}។`
      : "ជ្រើសបៀដើម្បីចាប់ផ្តើម។";
  }

  if (!canPlay.value) return "ការលេងមិនត្រឹមត្រូវ។ ជ្រើសបៀផ្សេងទៀត។";

  return "ការលេងត្រឹមត្រូវ។ រួចរាល់ដើម្បីលេង។";
});

const selectionStateClass = computed(() => {
  if (!isHumanTurn.value || isBotThinking.value) return "waiting";
  if (selectedCardsForAction.value.length === 0) return "empty";
  return canPlay.value ? "valid" : "invalid";
});

const placementPoints = [10, 5, -5, -10];

const winnerMessage = computed(() => {
  if (!game.value || !isGameOver.value) return "";

  return game.value.finishedPlayerIds
    .map((playerId, index) => {
      const player = game.value!.players.find((p) => p.id === playerId);
      const points = placementPoints[index] ?? 0;
      const sign = points > 0 ? "+" : "";
      return `${index + 1}. ${player?.name ?? "មិនស្គាល់"}: ${sign}${points} ពិន្ទុ`;
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

watch(isGameOver, (gameOver) => {
  if (!gameOver || hasPlayedGameOverSound.value || !game.value) return;

  const humanPlace = game.value.finishedPlayerIds.indexOf("human");
  playSound(humanPlace === 0 ? sounds.woooo : sounds.whoAreYou);
  hasPlayedGameOverSound.value = true;
});
watch(
  () => selectedIds.value.join("|"),
  (signature) => {
    if (!signature || !isHumanTurn.value || isBotThinking.value) {
      lastInvalidMoveSignature.value = "";
      return;
    }

    if (!canPlay.value && signature !== lastInvalidMoveSignature.value) {
      playSound(sounds.what);
      lastInvalidMoveSignature.value = signature;
    }
  },
);

function playSound(sound: HTMLAudioElement) {
  sound.currentTime = 0;
  void sound.play().catch(() => undefined);
}
function isBigMove(cards: Card[]) {
  const type = detectMoveType(cards);
  return (
    type === "fourKind" ||
    type === "fiveCardSameSuitSequence" ||
    type === "fourPairs"
  );
}

function playMoveSound(cards: Card[], isHumanMove: boolean) {
  if (isBigMove(cards)) {
    playSound(sounds.boom);
    return;
  }

  playSound(isHumanMove ? sounds.goodBoy : sounds.play);
}

function difficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    easy: "ងាយ",
    medium: "មធ្យម",
    hard: "ពិបាក",
  };

  return labels[difficulty] ?? difficulty;
}

function suitLabel(suit: Card["suit"]) {
  const labels: Record<Card["suit"], string> = {
    spades: "ស្ពេដ",
    hearts: "ហាត",
    clubs: "ក្លឹប",
    diamonds: "ដាយមិន",
  };

  return labels[suit];
}

function rankLabel(rank: number) {
  const rankMap: Record<number, string> = {
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
    15: "2",
  };

  return rankMap[rank] || String(rank);
}

function label(card: Card) {
  return `${rankLabel(card.rank)} ${suitLabel(card.suit)}`;
}

function getMoveName(cards: Card[]) {
  if (!cards.length) return "គ្មានបៀ";

  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const ranks = sorted.map((card) => card.rank);
  const suits = sorted.map((card) => card.suit);

  const rankCounts = ranks.reduce<Record<number, number>>((acc, rank) => {
    acc[rank] = (acc[rank] ?? 0) + 1;
    return acc;
  }, {});

  const uniqueRanks = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => a - b);

  const isSameRank = uniqueRanks.length === 1;
  const isSameSuit = suits.every((suit) => suit === suits[0]);
  const isConsecutive =
    uniqueRanks.length === ranks.length &&
    !uniqueRanks.includes(15) &&
    uniqueRanks.every(
      (rank, index) => index === 0 || rank === uniqueRanks[index - 1] + 1,
    );

  const isConsecutivePairs =
    cards.length % 2 === 0 &&
    uniqueRanks.length === cards.length / 2 &&
    !uniqueRanks.includes(15) &&
    uniqueRanks.every((rank) => rankCounts[rank] === 2) &&
    uniqueRanks.every(
      (rank, index) => index === 0 || rank === uniqueRanks[index - 1] + 1,
    );

  if (cards.length === 1) {
    return `មួយសន្លឹក ${rankLabel(cards[0].rank)}`;
  }

  if (isSameRank && cards.length === 2) {
    return `គូ ${rankLabel(uniqueRanks[0])}`;
  }

  if (isSameRank && cards.length === 3) {
    return `បីសន្លឹកដូចគ្នា ${rankLabel(uniqueRanks[0])}`;
  }

  if (isSameRank && cards.length === 4) {
    return `បួនសន្លឹកដូចគ្នា ${rankLabel(uniqueRanks[0])}`;
  }

  if (cards.length === 5 && isSameSuit && isConsecutive) {
    return `លំដាប់ពណ៌ដូចគ្នា ៥ សន្លឹក ${rankLabel(uniqueRanks[0])}-${rankLabel(
      uniqueRanks[uniqueRanks.length - 1],
    )}`;
  }

  if (isConsecutivePairs && uniqueRanks.length === 2) {
    return `គូជាប់គ្នា ២ ${rankLabel(uniqueRanks[0])}-${rankLabel(
      uniqueRanks[uniqueRanks.length - 1],
    )}`;
  }

  if (isConsecutivePairs && uniqueRanks.length === 3) {
    return `គូជាប់គ្នា ៣ ${rankLabel(uniqueRanks[0])}-${rankLabel(
      uniqueRanks[uniqueRanks.length - 1],
    )}`;
  }

  if (isConsecutivePairs && uniqueRanks.length === 4) {
    return `គូជាប់គ្នា ៤ ${rankLabel(uniqueRanks[0])}-${rankLabel(
      uniqueRanks[uniqueRanks.length - 1],
    )}`;
  }

  if (cards.length === 5) {
    const counts = Object.values(rankCounts).sort((a, b) => a - b);

    if (counts[0] === 2 && counts[1] === 3) {
      const tripleRank = uniqueRanks.find((rank) => rankCounts[rank] === 3);
      const pairRank = uniqueRanks.find((rank) => rankCounts[rank] === 2);

      return `គូ + បីសន្លឹក ${rankLabel(pairRank!)} / ${rankLabel(tripleRank!)}`;
    }
  }

  if (cards.length >= 3 && isConsecutive) {
    return `លំដាប់ ${rankLabel(uniqueRanks[0])}-${rankLabel(
      uniqueRanks[uniqueRanks.length - 1],
    )}`;
  }

  return `${cards.length} សន្លឹកបានជ្រើស`;
}

function playerStatus(playerId: string) {
  if (!game.value) return "";

  if (game.value.finishedPlayerIds.includes(playerId)) {
    const place = game.value.finishedPlayerIds.indexOf(playerId) + 1;
    return `បញ្ចប់លេខ ${place}`;
  }

  if (currentPlayer.value.id === playerId) {
    return isBotThinking.value ? "កំពុងគិត" : "កំពុងលេង";
  }

  const passedIds =
    (game.value as unknown as { passedPlayerIds?: string[] }).passedPlayerIds ??
    [];

  if (passedIds.includes(playerId)) {
    return "បានរំលង";
  }

  return "កំពុងរង់ចាំ";
}

function playerStatusClass(playerId: string) {
  const status = playerStatus(playerId).toLowerCase();

  return {
    playing: status === "កំពុងលេង" || status === "កំពុងគិត",
    passed: status === "បានរំលង",
    finished: status.includes("បញ្ចប់"),
  };
}

function toggleCard(cardId: string) {
  if (!isHumanTurn.value || isBotThinking.value) return;

  selectedIds.value = selectedIds.value.includes(cardId)
    ? selectedIds.value.filter((id) => id !== cardId)
    : [...selectedIds.value, cardId];
}

function selectedCards() {
  return selectedCardsForAction.value;
}

function play() {
  if (!game.value || !canPlay.value) return;

  const cards = selectedCards();
  game.value = playCards(game.value, human.value.id, cards);
  playMoveSound(cards, true);
  selectedIds.value = [];
  saveGame(game.value);
  runBotTurns();
}

function pass() {
  if (!game.value || !canPass.value) return;

  game.value = passTurn(game.value);
  playSound(sounds.soSilent);
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

    if (move) {
      playMoveSound(move, false);
    } else {
      playSound(sounds.soSilent);
    }

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

    ranking.playerScores[playerId] =
      (ranking.playerScores[playerId] ?? 0) + points;

    if (playerId === "human") {
      ranking.totalPoints += points;
      if (index === 0) ranking.totalWins += 1;
      if (index === game.value!.players.length - 1) ranking.totalLosses += 1;
    }
  });

  Object.entries(game.value.pointCuts).forEach(([playerId, points]) => {
    ranking.playerScores[playerId] =
      (ranking.playerScores[playerId] ?? 0) + points;

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

  if (!confirm("តើចង់ចែកបៀថ្មី ហើយចាប់ផ្តើមហ្គេមនេះឡើងវិញឬ?")) return;

  clearBotTurnTimer();
  playSound(sounds.shuffle);
  isBotThinking.value = false;
  hasPlayedGameOverSound.value = false;
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
    #14532d 56%,
    #052e16 100%
  );

  color: #ffffff;
  overflow: hidden;
}

ion-content.game::part(scroll) {
  overflow: hidden;
}

.table {
  --card-w: clamp(58px, 5.25vw, 78px);
  --card-overlap: clamp(-14px, -0.85vw, -8px);
  --table-card-w: clamp(50px, 5.8vw, 72px);
  --player-zone-h: clamp(150px, 24dvh, 214px);

  width: 100vw;
  max-width: 1680px;
  height: 100dvh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: max(6px, env(safe-area-inset-top))
    max(8px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom))
    max(8px, env(safe-area-inset-left));
  display: grid;
  grid-template-rows:
    clamp(38px, 6dvh, 52px)
    clamp(52px, 8.5dvh, 74px)
    minmax(112px, 1fr)
    var(--player-zone-h);
  gap: clamp(4px, 0.8dvh, 8px);
  overflow: hidden;
}

/* Top bar */
.top-bar {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(150px, 1fr) auto minmax(120px, 1fr);
  align-items: center;
  gap: 8px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.top-actions ion-button {
  height: 32px;
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.3px;
}

.game-title {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-title strong {
  font-size: clamp(13px, 1.2vw, 17px);
  line-height: 1.1;
  color: #06130a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.12);
}

.turn-badge {
  margin-top: 3px;
  padding: 4px 13px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.35);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 1000;
  line-height: 1;
  white-space: nowrap;
}

.turn-badge.humanTurn {
  background: #facc15;
  color: #052e16;
  border-color: #fff7ad;
  box-shadow:
    0 0 0 2px rgba(250, 204, 21, 0.22),
    0 0 18px rgba(250, 204, 21, 0.68);
  animation: topTurnPulse 1.2s ease-in-out infinite;
}

.difficulty-badge {
  justify-self: end;
  max-width: 100%;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Opponents */
.opponents {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  justify-items: center;
  gap: clamp(6px, 1.2vw, 18px);
}

.bot {
  width: min(100%, 190px);
  min-width: 0;
  padding: 9px 12px;
  border-radius: 15px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff34, #ffffff18);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 8px 18px rgba(0, 0, 0, 0.22);
  transition:
    transform 0.16s ease,
    outline 0.16s ease,
    box-shadow 0.16s ease;
}

.activeBot {
  outline: 2px solid #fde68a;
  transform: translateY(-1px) scale(1.03);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 0 18px rgba(250, 204, 21, 0.35),
    0 8px 18px rgba(0, 0, 0, 0.28);
}

.player-name {
  min-width: 0;
  min-height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-weight: 1000;
  font-size: clamp(11px, 1vw, 14px);
  color: #020617;
  white-space: nowrap;
}

.player-name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-name ion-icon {
  flex: 0 0 auto;
  font-size: 16px;
}

.player-status {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.38);
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  font-weight: 1000;
  line-height: 1.2;
  white-space: nowrap;
}

.player-status.playing {
  background: rgba(253, 230, 138, 0.24);
  color: #fde68a;
}

.player-status.passed {
  background: rgba(148, 163, 184, 0.25);
  color: #e2e8f0;
}

.player-status.finished {
  background: rgba(34, 197, 94, 0.24);
  color: #bbf7d0;
}

/* Center table */
.center {
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  background:
    radial-gradient(circle at center, rgba(34, 197, 94, 0.1), transparent 62%),
    rgba(0, 0, 0, 0.12);
  border: 1px dashed rgba(255, 255, 255, 0.24);
}

.table-area {
  width: 100%;
  min-height: 0;
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  align-items: center;
  justify-items: center;
  gap: 8px;
  padding: clamp(7px, 1vw, 12px);
  overflow: hidden;
}

.table-meta {
  width: min(360px, 92%);
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 14px;
  background: rgba(5, 46, 22, 0.64);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
  text-align: center;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.table-meta strong {
  margin-top: 2px;
  font-size: clamp(13px, 1.2vw, 17px);
  line-height: 1.15;
}

.table-meta small {
  max-width: 100%;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-cards {
  min-width: 0;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  overflow: hidden;
}

.table-card-image {
  width: var(--table-card-w);
  margin: 3px;
  border-radius: 7px;
  background: aliceblue;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.48);
}

.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.empty-table strong {
  font-size: clamp(15px, 1.5vw, 20px);
  color: rgba(255, 255, 255, 0.9);
}

.empty-table span {
  font-size: 12px;
}

/* Human player zone */
.player-zone {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  padding: 10px;
  overflow: hidden;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(5, 46, 22, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.22);
}

.player-zone.active {
  border: 2px solid #facc15;
  background:
    linear-gradient(rgba(250, 204, 21, 0.09), rgba(250, 204, 21, 0.03)),
    rgba(5, 46, 22, 0.68);
  box-shadow:
    inset 0 0 0 3px rgba(250, 204, 21, 0.14),
    0 -3px 12px rgba(0, 0, 0, 0.18);
}

.player-control-row {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(82px, 112px) minmax(0, 1fr) minmax(176px, 260px);
  align-items: center;
  gap: 8px;
}

.human-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.human-info strong {
  color: #ffffff;
  font-size: 15px;
  font-weight: 1000;
  line-height: 1.1;
  white-space: nowrap;
}

.inline-turn-chip {
  width: fit-content;
  margin-top: 5px;
  padding: 3px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  background: #facc15;
  color: #052e16;
  border: 1px solid #fff7ad;
  font-size: 10px;
  font-weight: 1000;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.55);
}

.inline-turn-chip ion-icon {
  font-size: 13px;
}

.selection-feedback {
  min-width: 0;
  min-height: 42px;
  padding: 7px 11px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 13px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.selection-feedback strong {
  font-size: 13px;
  font-weight: 1000;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-feedback small {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-feedback.valid {
  border-color: rgba(74, 222, 128, 0.7);
  background: rgba(22, 101, 52, 0.52);
}

.selection-feedback.valid small {
  color: #bbf7d0;
}

.selection-feedback.invalid {
  border-color: rgba(248, 113, 113, 0.75);
  background: rgba(127, 29, 29, 0.46);
}

.selection-feedback.invalid small {
  color: #fecaca;
}

.selection-feedback.waiting {
  opacity: 0.82;
}

.table-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr 1.08fr;
  gap: 7px;
  align-items: center;
}

.play-btn,
.pass-btn {
  width: 100%;
  min-height: 40px;
  margin: 0;
  font-size: 13px;
  font-weight: 1000;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.play-btn {
  --background: #16a34a;
  --background-hover: #15803d;
  --background-activated: #166534;
  --background-focused: #15803d;
  --color: #ffffff;
  --border-radius: 13px;
  --box-shadow: 0 8px 18px rgba(34, 197, 94, 0.36);
}

.pass-btn {
  --background: #dc2626;
  --background-hover: #b91c1c;
  --background-activated: #991b1b;
  --background-focused: #b91c1c;
  --color: #ffffff;
  --border-radius: 13px;
  --box-shadow: 0 8px 18px rgba(220, 38, 38, 0.34);
}

.play-btn[disabled],
.pass-btn[disabled] {
  opacity: 0.45;
  --box-shadow: none;
}

.player-hand {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  height: calc(var(--card-w) * 1.42 + 44px);
  min-height: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 24px 24px 10px;
  scroll-padding-inline: 24px;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.player-hand::-webkit-scrollbar {
  height: 5px;
}

.player-hand::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.player-hand::-webkit-scrollbar-thumb {
  background: rgba(250, 204, 21, 0.55);
  border-radius: 999px;
}
.card-button {
  position: relative;
  z-index: 1;
  flex: 0 0 var(--card-w);
  width: var(--card-w);
  height: calc(var(--card-w) * 1.42);
  /* margin-left: var(--card-overlap); */
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  overflow: visible;
  touch-action: manipulation;
  transition:
    transform 0.14s ease,
    filter 0.14s ease,
    opacity 0.14s ease;
}

.card-button:first-child {
  margin-left: 0;
}

.card-button:last-child {
  margin-right: 18px;
}

.card-button:disabled {
  opacity: 0.7;
}

.card-button.selected {
  z-index: 30;
  transform: translateY(-15px) scale(1.035);
  filter: drop-shadow(0 0 6px rgba(253, 230, 138, 0.86));
}

.card-image {
  width: var(--card-w);
  height: auto;
  display: block;
  border-radius: 8px;
  background: aliceblue;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  user-select: none;
  pointer-events: none;
}

.player-zone.active .card-image {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(250, 204, 21, 0.18);
}

ion-button {
  font-weight: 900;
}

@keyframes topTurnPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.055);
  }

  100% {
    transform: scale(1);
  }
}
/* Phone landscape - larger mobile UI */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .table {
    --card-w: clamp(66px, 8.6vw, 76px);
    --card-overlap: -12px;
    --table-card-w: clamp(52px, 7vw, 62px);
    --player-zone-h: clamp(170px, 43dvh, 198px);

    grid-template-rows:
      40px
      58px
      minmax(92px, 1fr)
      var(--player-zone-h);
    gap: 5px;
    padding: 6px 8px;
  }

  .top-bar {
    gap: 6px;
    grid-template-columns: minmax(135px, 1fr) auto minmax(105px, 1fr);
  }

  .top-actions {
    gap: 6px;
  }

  .top-actions ion-button {
    height: 32px;
    font-size: 12px;
  }

  .game-title {
    min-width: 145px;
  }

  .game-title strong {
    font-size: 14px;
  }

  .turn-badge {
    padding: 5px 11px;
    font-size: 11px;
  }

  .difficulty-badge {
    padding: 7px 9px;
    font-size: 11px;
  }

  .opponents {
    gap: 8px;
  }

  .bot {
    width: min(100%, 146px);
    padding: 6px 8px;
    border-radius: 13px;
  }

  .player-name {
    min-height: 18px;
    gap: 4px;
    font-size: 12px;
  }

  .player-name ion-icon {
    font-size: 14px;
  }

  .player-status {
    margin-top: 3px;
    padding: 2px 7px;
    font-size: 10px;
  }

  .center {
    border-radius: 15px;
  }

  .table-area {
    gap: 6px;
    padding: 7px;
  }

  .table-meta {
    width: min(290px, 88%);
    padding: 6px 11px;
    border-radius: 12px;
  }

  .eyebrow {
    font-size: 9px;
  }

  .table-meta strong {
    font-size: 13px;
  }

  .table-meta small {
    font-size: 10px;
  }

  .table-card-image {
    margin: 2px;
    border-radius: 6px;
  }

  .empty-table strong {
    font-size: 14px;
  }

  .empty-table span {
    font-size: 11px;
  }

  .player-zone {
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 10px;
    padding: 14px;
    overflow: hidden;
    contain: paint;
    border-radius: 20px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
      rgba(5, 46, 22, 0.58);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.22);
  }

  .player-control-row {
    grid-template-columns: 78px minmax(0, 1fr) 182px;
    gap: 6px;
  }

  .human-info strong {
    font-size: 13px;
  }

  .inline-turn-chip {
    margin-top: 4px;
    padding: 4px 7px;
    font-size: 9px;
  }

  .inline-turn-chip ion-icon {
    font-size: 12px;
  }

  .selection-feedback {
    min-height: 40px;
    padding: 6px 8px;
    border-radius: 11px;
  }

  .selection-feedback strong {
    font-size: 12px;
  }

  .selection-feedback small {
    font-size: 10px;
  }

  .table-actions {
    gap: 6px;
  }

  .play-btn,
  .pass-btn {
    min-height: 38px;
    font-size: 12px;
  }

  .player-hand {
    height: calc(var(--card-w) * 1.42 + 20px);
    padding: 14px 9px 1px;
  }

  .card-button.selected {
    transform: translateY(-13px) scale(1.04);
  }

  .card-image {
    border-radius: 7px;
  }
}

/* Very small phones - still readable */
@media screen and (orientation: landscape) and (max-height: 380px) {
  .table {
    --card-w: clamp(60px, 8vw, 68px);
    --card-overlap: -11px;
    --table-card-w: 48px;
    --player-zone-h: clamp(150px, 41dvh, 168px);

    grid-template-rows:
      34px
      48px
      minmax(68px, 1fr)
      var(--player-zone-h);
    gap: 3px;
    padding: 4px 6px;
  }

  .top-actions ion-button {
    height: 29px;
    font-size: 11px;
  }

  .game-title strong {
    display: none;
  }

  .turn-badge {
    margin-top: 0;
    padding: 5px 10px;
    font-size: 11px;
  }

  .difficulty-badge {
    display: none;
  }

  .bot {
    width: min(100%, 124px);
    padding: 5px 7px;
  }

  .player-name {
    font-size: 11px;
  }

  .player-status {
    display: none;
  }

  .table-meta {
    display: none;
  }

  .table-area {
    grid-template-rows: 1fr;
  }

  .player-zone {
    gap: 5px;
    padding: 6px;
  }

  .player-control-row {
    grid-template-columns: 68px minmax(0, 1fr) 160px;
    gap: 5px;
  }

  .human-info .eyebrow {
    display: none;
  }

  .human-info strong {
    font-size: 12px;
  }

  .inline-turn-chip {
    font-size: 9px;
  }

  .selection-feedback {
    min-height: 35px;
    padding: 5px 7px;
  }

  .selection-feedback strong {
    font-size: 11px;
  }

  .selection-feedback small {
    display: none;
  }

  .play-btn,
  .pass-btn {
    min-height: 34px;
    font-size: 11px;
  }

  .player-hand {
    height: calc(var(--card-w) * 1.42 + 15px);
    padding: 10px 7px 0;
  }

  .card-button.selected {
    transform: translateY(-10px) scale(1.04);
  }
}

/* Narrow landscape phones */
@media screen and (orientation: landscape) and (max-width: 760px) {
  .top-bar {
    grid-template-columns: minmax(130px, 1fr) auto;
    grid-template-areas:
      "actions title"
      "difficulty title";
  }

  .top-actions {
    grid-area: actions;
  }

  .game-title {
    grid-area: title;
    justify-self: end;
  }

  .difficulty-badge {
    grid-area: difficulty;
    justify-self: start;
  }

  .player-control-row {
    grid-template-columns: 72px minmax(0, 1fr) 165px;
  }

  .table-actions ion-icon {
    display: none;
  }
}

/* Portrait fallback - bigger cards */
@media screen and (orientation: portrait) {
  ion-content.game::part(scroll) {
    overflow-y: auto;
  }

  .table {
    --card-w: clamp(72px, 18vw, 92px);
    --card-overlap: -14px;
    --table-card-w: clamp(58px, 14vw, 76px);
    --player-zone-h: auto;

    height: auto;
    min-height: 100dvh;
    grid-template-rows:
      auto
      auto
      minmax(240px, 1fr)
      auto;
    gap: 8px;
    padding: 8px;
    overflow: visible;
  }

  .top-bar {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title title"
      "actions difficulty";
    row-gap: 6px;
  }

  .game-title {
    grid-area: title;
    min-width: 0;
  }

  .game-title strong {
    color: #ffffff;
  }

  .top-actions {
    grid-area: actions;
  }

  .difficulty-badge {
    grid-area: difficulty;
  }

  .opponents {
    display: flex;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .bot {
    flex: 0 0 155px;
  }

  .player-zone {
    min-height: 290px;
    overflow: hidden;
  }

  .player-control-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .human-info {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .human-info .eyebrow {
    display: none;
  }

  .inline-turn-chip {
    margin-top: 0;
  }

  .selection-feedback {
    min-height: 48px;
  }

  .table-actions {
    grid-template-columns: 1fr 1fr;
  }

  .play-btn,
  .pass-btn {
    min-height: 48px;
    font-size: 14px;
  }

  .player-hand {
    height: calc(var(--card-w) * 1.42 + 30px);
    padding-top: 20px;
  }
}
</style>
