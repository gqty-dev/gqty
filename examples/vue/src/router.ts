import { createRouter, createWebHistory, Router } from 'vue-router';

import Home from './components/Home.vue';
import Error from './components/Error.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/error', component: Error },
];

export const router: Router = createRouter({
  history: createWebHistory(),
  routes: routes,
});
