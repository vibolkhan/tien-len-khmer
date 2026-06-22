import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../pages/HomePage.vue';
import GamePage from '../pages/GamePage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import RankingPage from '../pages/RankingPage.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: HomePage },
  { path: '/game', component: GamePage },
  { path: '/settings', component: SettingsPage },
  { path: '/ranking', component: RankingPage },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
