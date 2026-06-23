<template>
  <ion-page>
    <ion-content class="lobby" fullscreen>
      <main class="lobby-shell">
        <section class="lobby-panel">
          <div class="lobby-header">
            <ion-button fill="clear" size="small" router-link="/home">Home</ion-button>
            <span class="room-pill">Room {{ roomCode }}</span>
          </div>

          <h1>Online Lobby</h1>
          <p class="subtitle">Share the room code with 3 friends. The game starts when all 4 seats are filled.</p>

          <div class="code-row">
            <strong>{{ roomCode }}</strong>
            <ion-button fill="outline" size="small" @click="copyRoomCode">Copy</ion-button>
          </div>

          <div class="seats" aria-label="Online lobby players">
            <div v-for="seat in seatList" :key="seat.label" class="seat" :class="{ filled: seat.player }">
              <span>{{ seat.label }}</span>
              <strong>{{ seat.player?.name ?? 'Waiting...' }}</strong>
            </div>
          </div>

          <p class="status">{{ statusText }}</p>

          <ion-button expand="block" class="start-btn" :disabled="!canStart" @click="startGame">
            Start 4 Player Game
          </ion-button>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { IonButton, IonContent, IonPage } from "@ionic/vue";
import { useRouter } from "vue-router";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { OnlineLobbyPlayer, OnlineSession } from "../types/game";
import { createOnlineGame } from "../services/gameEngine";
import {
  clearOnlineSession,
  loadOnlineSession,
  saveOnlineGame,
} from "../services/storage";
import { getDifficulty } from "../services/storage";
import {
  broadcastLobbyState,
  broadcastStartGame,
  closeRealtimeChannel,
  isRealtimeConfigured,
  openLobbyChannel,
} from "../services/online";

const router = useRouter();
const session = ref<OnlineSession | null>(null);
const players = ref<OnlineLobbyPlayer[]>([]);
const statusText = ref("Connecting...");
let channel: RealtimeChannel | null = null;

const roomCode = computed(() => session.value?.roomCode ?? "");
const canStart = computed(() => Boolean(session.value?.isHost) && players.value.length === 4);
const seatList = computed(() =>
  Array.from({ length: 4 }, (_, index) => ({
    label: `Seat ${index + 1}`,
    player: players.value[index] ?? null,
  })),
);

onMounted(async () => {
  session.value = loadOnlineSession();

  if (!session.value || !isRealtimeConfigured()) {
    statusText.value = "Online play needs Supabase Realtime configuration.";
    clearOnlineSession();
    router.replace("/home");
    return;
  }

  if (session.value.isHost) {
    players.value = [
      {
        id: session.value.playerId,
        name: session.value.playerName,
        joinedAt: new Date().toISOString(),
      },
    ];
  }

  try {
    channel = await openLobbyChannel(session.value, {
      onLobbyState: (state) => {
        if (state.roomCode !== session.value?.roomCode) return;
        players.value = state.players;
        statusText.value = state.started ? "Game is starting..." : `${state.players.length}/4 players joined.`;
      },
      onJoinRequest: async (player) => {
        if (!session.value?.isHost || !channel) return;
        const exists = players.value.some((item) => item.id === player.id);
        if (!exists && players.value.length < 4) {
          players.value = [...players.value, player];
        }
        await publishLobbyState(false);
      },
      onStartGame: (onlineGame) => {
        saveOnlineGame(onlineGame);
        router.push("/game?mode=online");
      },
    });

    statusText.value = session.value.isHost ? "Waiting for players..." : "Joining room...";

    if (session.value.isHost) {
      await publishLobbyState(false);
    }
  } catch (error) {
    statusText.value = error instanceof Error ? error.message : "Could not connect to online lobby.";
  }
});

onBeforeUnmount(() => {
  void closeRealtimeChannel(channel);
});

async function publishLobbyState(started: boolean) {
  if (!channel || !session.value) return;

  await broadcastLobbyState(channel, {
    roomCode: session.value.roomCode,
    players: players.value,
    hostId: session.value.playerId,
    started,
  });
}

async function startGame() {
  if (!channel || !session.value || players.value.length !== 4) return;

  const onlineGame = createOnlineGame(players.value, getDifficulty(), session.value.roomCode);
  saveOnlineGame(onlineGame);
  await publishLobbyState(true);
  await broadcastStartGame(channel, onlineGame);
  router.push("/game?mode=online");
}

async function copyRoomCode() {
  await navigator.clipboard?.writeText(roomCode.value);
  statusText.value = "Room code copied.";
}
</script>

<style scoped>
.lobby {
  --background: radial-gradient(circle at top, #166534 0%, #052e16 72%);
  color: #ffffff;
}

.lobby-shell {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
}

.lobby-panel {
  width: min(100%, 520px);
  padding: clamp(18px, 4vw, 30px);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(14px);
}

.lobby-header,
.code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.room-pill {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.35);
  font-size: 12px;
  font-weight: 900;
}

h1 {
  margin: 18px 0 8px;
  font-size: clamp(32px, 9vw, 48px);
  line-height: 1;
}

.subtitle,
.status {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.35;
}

.code-row {
  margin: 18px 0;
  padding: 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.code-row strong {
  font-size: 24px;
  letter-spacing: 0.14em;
}

.seats {
  display: grid;
  gap: 10px;
}

.seat {
  min-height: 58px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px dashed rgba(255, 255, 255, 0.24);
}

.seat.filled {
  border-style: solid;
  background: rgba(22, 163, 74, 0.28);
}

.seat span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.seat strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.start-btn {
  margin-top: 16px;
  height: 52px;
  font-weight: 900;
  --border-radius: 16px;
  --background: #ffffff;
  --color: #14532d;
}
</style>
