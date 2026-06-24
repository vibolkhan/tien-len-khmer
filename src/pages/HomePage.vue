<template>
  <ion-page :class="{ 'immersive-mode': isImmersiveMode }">
    <ion-content class="home" fullscreen>
      <div class="home-bg">
        <div class="hero">
          <div class="card-stack" aria-hidden="true">
            <span class="black">♠</span>
            <span class="red">♥</span>
            <span class="black">♣</span>
            <span class="red">♦</span>
          </div>

          <h1>ទៀនឡេន<br />ខ្មែរ</h1>
          <p class="subtitle">លេងបៀក្រៅអ៊ីនធឺណិតជាមួយបត ៣ នាក់</p>

          <div class="menu">
            <ion-button expand="block" class="main-btn" @click="newGame">
              ហ្គេមថ្មី
            </ion-button>

            <ion-button expand="block" class="outline-btn" fill="outline" @click="createOnlineLobby">
              Create Online Lobby
            </ion-button>

            <ion-button expand="block" class="outline-btn" fill="outline" @click="joinOnlineLobby">
              Join Online Lobby
            </ion-button>

            <ion-button
              expand="block"
              class="outline-btn"
              fill="outline"
              @click="enterFullscreen"
            >
              <ion-icon slot="start" :icon="expandOutline" aria-hidden="true" />
              ពេញអេក្រង់
            </ion-button>

            <ion-button
              expand="block"
              class="outline-btn"
              fill="outline"
              :disabled="!hasSavedGame"
              @click="continueGame"
            >
              បន្តហ្គេម
            </ion-button>

            <div class="grid-buttons">
              <ion-button fill="outline" class="small-btn" router-link="/ranking">
                ចំណាត់ថ្នាក់
              </ion-button>

              <ion-button fill="outline" class="small-btn" router-link="/settings">
                ការកំណត់
              </ion-button>

              <ion-button fill="outline" class="small-btn" router-link="/rules">
                ច្បាប់
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  alertController,
} from "@ionic/vue";
import { expandOutline } from "ionicons/icons";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createNewGame } from "../services/gameEngine";
import {
  clearOnlineSession,
  getDifficulty,
  loadGame,
  saveGame,
  saveOnlineSession,
} from "../services/storage";
import {
  createPlayerId,
  createRoomCode,
  isRealtimeConfigured,
  normalizeRoomCode,
} from "../services/online";

const router = useRouter();
const hasSavedGame = !!loadGame();
const isImmersiveMode = ref(false);

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

function newGame() {
  saveGame(createNewGame(getDifficulty()));
  router.push("/game");
}

function continueGame() {
  router.push("/game");
}

function createOnlineLobby() {
  if (!ensureRealtimeReady()) return;

  const playerName = prompt("Your online display name", "Player 1")?.trim();
  if (!playerName) return;

  const roomCode = createRoomCode();
  clearOnlineSession();
  saveOnlineSession({
    roomCode,
    playerId: createPlayerId(),
    playerName,
    isHost: true,
  });
  router.push(`/lobby/${roomCode}`);
}

function joinOnlineLobby() {
  if (!ensureRealtimeReady()) return;

  const playerName = prompt("Your online display name", "Player")?.trim();
  if (!playerName) return;

  const roomCode = normalizeRoomCode(prompt("Room code") ?? "");
  if (!roomCode) return;

  clearOnlineSession();
  saveOnlineSession({
    roomCode,
    playerId: createPlayerId(),
    playerName,
    isHost: false,
  });
  router.push(`/lobby/${roomCode}`);
}

function ensureRealtimeReady() {
  if (isRealtimeConfigured()) return true;

  alert("Online play needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.");
  return false;
}

async function enterFullscreen() {
  const element = document.documentElement as FullscreenElement;

  if (document.fullscreenElement) {
    return;
  }

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return;
    }

    if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
      return;
    }
  } catch (error) {
    console.warn("Fullscreen is not supported on this device/browser.", error);
  }

  // iPhone Safari does not provide the Fullscreen API for normal page
  // elements. Fill the available viewport and explain how to remove Safari's
  // browser chrome completely.
  isImmersiveMode.value = true;
  requestAnimationFrame(() => window.scrollTo({ top: 1, behavior: "smooth" }));

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    (navigator as StandaloneNavigator).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  if (isIos && !isStandalone) {
    const alert = await alertController.create({
      header: "Full screen on iPhone",
      message:
        "Safari does not allow websites to enter true full screen. Tap Share, choose Add to Home Screen, then open the game from its Home Screen icon.",
      buttons: ["OK"],
    });
    await alert.present();
  }
}
</script>

<style scoped>
.home {
  --background: radial-gradient(circle at top, #15803d 0%, #052e16 72%);
  --overflow: auto;
  color: white;
}

.immersive-mode {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  z-index: 9999;
  background: #052e16;
}

.immersive-mode .home-bg {
  min-height: 100dvh;
}

.home::part(scroll) {
  min-height: 100%;
  overflow-y: auto;
}

.home-bg {
  width: 100%;
  min-height: 100dvh;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  padding:
    max(14px, env(safe-area-inset-top))
    max(14px, env(safe-area-inset-right))
    max(14px, env(safe-area-inset-bottom))
    max(14px, env(safe-area-inset-left));
}

.hero {
  width: min(100%, 520px);
  box-sizing: border-box;

  text-align: center;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 26px;

  padding: clamp(18px, 4vw, 32px);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(14px);

  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.card-stack {
  display: flex;
  justify-content: center;
  gap: clamp(7px, 2vw, 12px);
  margin-bottom: clamp(10px, 2.4vh, 18px);
}

.card-stack span {
  width: clamp(36px, 11vw, 56px);
  height: clamp(50px, 15vw, 76px);

  background: #ffffff;
  border-radius: 12px;

  display: grid;
  place-items: center;

  font-size: clamp(22px, 6vw, 34px);
  font-weight: 900;

  box-shadow: 0 9px 20px rgba(0, 0, 0, 0.32);
}

.card-stack .black {
  color: #111827;
}

.card-stack .red {
  color: #dc2626;
}

h1 {
  font-size: clamp(32px, 10vw, 52px);
  line-height: 1.02;
  margin: 0;
  font-weight: 950;
  letter-spacing: -0.04em;
}

.subtitle {
  opacity: 0.88;
  margin: 10px 0 18px;
  font-size: clamp(14px, 3.8vw, 17px);
}

.menu {
  display: grid;
  gap: 11px;
}

.grid-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}

ion-button {
  margin: 0;
  text-transform: none;
  font-weight: 800;
  letter-spacing: 0;
  --border-radius: 16px;
}

.main-btn,
.outline-btn {
  height: clamp(46px, 12vw, 56px);
  font-size: clamp(15px, 4vw, 17px);
}

.small-btn {
  height: clamp(42px, 11vw, 50px);
  font-size: clamp(14px, 3.7vw, 16px);
}

.main-btn {
  --background: #ffffff;
  --background-hover: #f3f4f6;
  --background-activated: #e5e7eb;
  --color: #14532d;
}

.outline-btn,
.small-btn {
  --color: #ffffff;
  --border-color: rgba(255, 255, 255, 0.75);
  --background-hover: rgba(255, 255, 255, 0.12);
  --background-activated: rgba(255, 255, 255, 0.2);
}

/* Small phones */
@media screen and (max-width: 380px) {
  .home-bg {
    align-items: flex-start;
    padding: 10px;
  }

  .hero {
    border-radius: 22px;
    padding: 14px;
  }

  .card-stack {
    margin-bottom: 8px;
  }

  .card-stack span {
    width: 34px;
    height: 46px;
    font-size: 21px;
    border-radius: 10px;
  }

  h1 {
    font-size: 30px;
  }

  .subtitle {
    font-size: 13px;
    margin: 8px 0 12px;
  }

  .menu,
  .grid-buttons {
    gap: 8px;
  }

  .main-btn,
  .outline-btn {
    height: 42px;
    font-size: 14px;
  }

  .small-btn {
    height: 40px;
    font-size: 13px;
  }
}

/* Short mobile screens */
@media screen and (max-height: 650px) {
  .home-bg {
    align-items: flex-start;
    padding-top: max(10px, env(safe-area-inset-top));
    padding-bottom: max(10px, env(safe-area-inset-bottom));
  }

  .hero {
    padding: 14px;
  }

  .card-stack {
    margin-bottom: 8px;
  }

  .card-stack span {
    width: 34px;
    height: 46px;
    font-size: 21px;
  }

  h1 {
    font-size: 30px;
  }

  .subtitle {
    margin: 8px 0 12px;
    font-size: 13px;
  }

  .menu,
  .grid-buttons {
    gap: 8px;
  }

  .main-btn,
  .outline-btn,
  .small-btn {
    height: 40px;
    font-size: 13px;
  }
}

/* Very short landscape phones */
@media screen and (orientation: landscape) and (max-height: 430px) {
  .home-bg {
    align-items: flex-start;
    padding: 10px;
  }

  .hero {
    width: min(100%, 760px);
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .card-stack {
    grid-column: 1;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  h1,
  .subtitle {
    grid-column: 1;
  }

  h1 {
    font-size: 28px;
  }

  .subtitle {
    margin: 6px 0 0;
  }

  .menu {
    grid-column: 2;
  }
}
</style>