<template>
  <ion-page>
    <ion-content class="home">
      <div class="home-bg">
        <div class="hero">
          <div class="card-stack">
            <span>♠</span><span>♥</span><span>♣</span><span>♦</span>
          </div>

          <h1>Tiến Lên<br />Miền Bắc</h1>
          <p>Offline card battle against 3 bots</p>

          <div class="menu">
            <ion-button expand="block" size="large" @click="newGame">
              New Game
            </ion-button>

            <ion-button
              expand="block"
              size="large"
              fill="outline"
              :disabled="!hasSavedGame"
              @click="continueGame"
            >
              Continue Game
            </ion-button>

            <div class="grid-buttons">
              <ion-button fill="outline" router-link="/ranking">
                Ranking
              </ion-button>
              <ion-button fill="outline" router-link="/settings">
                Settings
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from "@ionic/vue";
import { useRouter } from "vue-router";
import { createNewGame } from "../services/gameEngine";
import { getDifficulty, loadGame, saveGame } from "../services/storage";

const router = useRouter();
const hasSavedGame = !!loadGame();

function newGame() {
  saveGame(createNewGame(getDifficulty()));
  router.push("/game");
}

function continueGame() {
  router.push("/game");
}
</script>
<style scoped>
.home {
  --background: radial-gradient(circle at top, #166534, #052e16 70%);
  --overflow: hidden;
  color: white;
  width: 100%;
  height: 100%;
}

.home::part(scroll) {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

.home-bg {
  width: 100%;
  height: 100%;
  min-height: 100%;
  max-height: 100%;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: max(12px, env(safe-area-inset-top))
    max(14px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom))
    max(14px, env(safe-area-inset-left));

  overflow: hidden;
}

.hero {
  width: min(92vw, 560px);
  max-height: 100%;
  box-sizing: border-box;

  text-align: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;

  padding: clamp(14px, 3.5vh, 30px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);

  display: flex;
  flex-direction: column;
  justify-content: center;

  overflow: hidden;
}

.card-stack {
  display: flex;
  justify-content: center;
  gap: clamp(6px, 2vw, 10px);
  font-size: clamp(20px, 4.5vh, 34px);
  margin-bottom: clamp(6px, 1.5vh, 14px);
  flex-shrink: 0;
}

.card-stack span {
  width: clamp(34px, 8vh, 54px);
  height: clamp(46px, 11vh, 72px);
  background: white;
  color: #111827;
  border-radius: 10px;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

h1 {
  font-size: clamp(26px, 7vh, 46px);
  line-height: 1.05;
  margin: clamp(4px, 1vh, 10px) 0;
  font-weight: 900;
  flex-shrink: 0;
}

p {
  opacity: 0.85;
  margin: 0 0 clamp(10px, 2.5vh, 24px);
  flex-shrink: 0;
}

.menu {
  display: grid;
  gap: clamp(8px, 1.8vh, 12px);
  flex-shrink: 0;
}

.grid-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(8px, 1.8vh, 12px);
}

ion-button {
  min-height: clamp(40px, 7vh, 52px);
}

@media screen and (max-height: 640px) {
  .hero {
    padding: 14px;
    border-radius: 22px;
  }

  .card-stack span {
    width: 34px;
    height: 46px;
  }

  h1 {
    font-size: 28px;
  }

  p {
    font-size: 14px;
    margin-bottom: 10px;
  }

  ion-button {
    min-height: 40px;
  }
}

@media screen and (orientation: landscape) and (max-height: 430px) {
  .hero {
    width: min(88vw, 760px);
    max-height: 100%;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    align-items: center;
    gap: 14px;
  }

  .card-stack {
    grid-column: 1;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  h1,
  p {
    grid-column: 1;
  }

  .menu {
    grid-column: 2;
  }
}
</style>