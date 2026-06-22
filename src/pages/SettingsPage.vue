<template>
  <ion-page>
    <ion-content class="settings">
      <div class="page">
        <h1>Settings</h1>

        <ion-card class="settings-card">
          <ion-card-content>
            <ion-item class="setting-item">
              <ion-select
                label="Bot Difficulty"
                label-placement="stacked"
                v-model="difficulty"
                @ionChange="save"
              >
                <ion-select-option value="easy">Easy</ion-select-option>
                <ion-select-option value="medium">Medium</ion-select-option>
                <ion-select-option value="hard">Hard</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-button
          class="settings-btn"
          expand="block"
          color="danger"
          @click="reset"
        >
          Reset Data
        </ion-button>

        <ion-button
          class="settings-btn"
          expand="block"
          fill="outline"
          router-link="/home"
        >
          Back Home
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
} from "@ionic/vue";
import type { Difficulty } from "../types/game";
import {
  getDifficulty,
  resetAllData,
  setDifficulty,
} from "../services/storage";

const difficulty = ref<Difficulty>(getDifficulty());

function save() {
  setDifficulty(difficulty.value);
}

function reset() {
  if (confirm("Reset ranking and saved game?")) {
    resetAllData();
  }
}
</script>

<style scoped>
.settings {
  --background: radial-gradient(circle at top, #7c2d12, #020617 75%);
  color: white;
}

.page {
  min-height: 100dvh;
  max-width: 520px;
  margin: auto;
  padding: 32px 20px;
}

h1 {
  text-align: center;
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 24px;
}

.settings-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
  margin-bottom: 18px;
}

.setting-item {
  --background: transparent;
  --color: white;
  border-radius: 16px;
}
.settings-btn {
  min-height: 42px;
  height: 42px;
  font-size: 14px;
  font-weight: 700;
  --border-radius: 14px;
  margin-top: 10px;
}
</style>
