import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../pages/HomePage.vue';
import GamePage from '../pages/GamePage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import RankingPage from '../pages/RankingPage.vue';
import OnlineLobbyPage from '../pages/OnlineLobbyPage.vue';
import RulesPage from '../pages/RulesPage.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: HomePage },
  { path: '/game', component: GamePage },
  { path: '/lobby/:roomCode', component: OnlineLobbyPage },
  { path: '/settings', component: SettingsPage },
  { path: '/ranking', component: RankingPage },
  { path: '/rules', component: RulesPage },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
