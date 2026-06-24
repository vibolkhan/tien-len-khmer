<template>
  <ion-page class="ranking-page">
    <ion-content class="ranking" fullscreen>
      <div class="page">
        <h1>ចំណាត់ថ្នាក់</h1>

        <ion-card class="rank-card">
          <ion-card-content>
            <div class="stat big">
              <span>{{ ranking.totalGames }}</span>
              <p>ហ្គេមសរុប</p>
            </div>

            <div class="stats-row">
              <div class="stat">
                <span>{{ ranking.totalPoints }}</span>
                <p>ពិន្ទុរបស់អ្នក</p>
              </div>

              <div class="stat">
                <span>{{ ranking.totalWins }}</span>
                <p>លេខ ១</p>
              </div>
            </div>

            <div class="score-list">
              <div
                v-for="player in players"
                :key="player.id"
                class="score-row"
              >
                <span>{{ player.name }}</span>
                <strong>
                  {{ formatScore(ranking.playerScores[player.id] ?? 0) }}
                </strong>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card v-if="onlineRanking" class="rank-card online-rank-card">
          <ion-card-content>
            <div class="online-heading">
              <div>
                <strong>Online Room {{ onlineRanking.roomCode }}</strong>
                <p>{{ onlineRanking.gamesPlayed }} rounds played</p>
              </div>
              <span>Live series</span>
            </div>

            <div class="score-list">
              <div
                v-for="(player, index) in onlinePlayers"
                :key="player.id"
                class="score-row"
              >
                <span>#{{ index + 1 }} {{ player.name }}</span>
                <strong>{{ formatScore(onlineRanking.playerScores[player.id] ?? 0) }}</strong>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-button class="ranking-btn" expand="block" router-link="/home">
          ត្រឡប់ទៅទំព័រដើម
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
} from "@ionic/vue";
import { getRanking, loadOnlineRoomRanking } from "../services/storage";

const ranking = getRanking();
const onlineRanking = loadOnlineRoomRanking();
const onlinePlayers = onlineRanking
  ? [...onlineRanking.players].sort(
      (a, b) =>
        (onlineRanking.playerScores[b.id] ?? 0) -
          (onlineRanking.playerScores[a.id] ?? 0) ||
        a.joinedAt.localeCompare(b.joinedAt),
    )
  : [];

const players = [
  { id: "human", name: "អ្នក" },
  { id: "bot1", name: "បត ១" },
  { id: "bot2", name: "បត ២" },
  { id: "bot3", name: "បត ៣" },
];

function formatScore(score: number) {
  return `${score > 0 ? "+" : ""}${score} ពិន្ទុ`;
}
</script>

<style scoped>
.ranking-page {
  width: 100%;
  height: 100%;
}

.ranking {
  --background: radial-gradient(circle at top, #1e40af, #020617 75%);
  --overflow: auto;
  color: white;
  width: 100%;
  height: 100%;
}

.ranking::part(scroll) {
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
}

.page {
  width: 100%;
  min-height: 100%;
  max-width: 520px;
  padding: 16px 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;

  text-align: center;
}

h1 {
  font-size: 26px;
  font-weight: 900;
  margin: 0 0 12px;
  line-height: 1.1;
  flex-shrink: 0;
}

.rank-card {
  width: 100%;
  margin: 0 0 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35);

  flex-shrink: 0;
  overflow: visible;
}

ion-card-content {
  padding: 12px;
}

.stat span {
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.stat p {
  margin: 3px 0 0;
  opacity: 0.8;
  font-size: 12px;
}

.big span {
  font-size: 36px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.score-list {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.34);

  font-size: 13px;
}

.score-row span {
  font-weight: 800;
}

.score-row strong {
  color: #fde68a;
}

.ranking-btn {
  width: 100%;
  height: 38px;
  min-height: 38px;
  margin: 0;

  font-size: 14px;
  font-weight: 700;

  --border-radius: 14px;

  flex-shrink: 0;
}

.online-rank-card {
  margin-top: 0;
}

.online-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.online-heading p {
  margin: 3px 0 0;
  opacity: 0.75;
  font-size: 12px;
}

.online-heading > span {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.24);
  color: #bbf7d0;
  font-size: 11px;
  font-weight: 900;
}

@media screen and (max-height: 640px) {
  .page {
    padding: 12px 16px;
  }

  h1 {
    font-size: 22px;
    margin-bottom: 8px;
  }

  ion-card-content {
    padding: 10px;
  }

  .big span {
    font-size: 30px;
  }

  .stat span {
    font-size: 20px;
  }

  .stat p {
    font-size: 11px;
  }

  .stats-row,
  .score-list {
    margin-top: 8px;
  }

  .score-row {
    padding: 5px 8px;
    font-size: 12px;
  }

  .ranking-btn {
    height: 36px;
    min-height: 36px;
  }
}
</style>