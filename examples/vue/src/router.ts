import {
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';

import Home from './components/Home.vue';
import Error from './components/Error.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/home', component: Home },
  { path: '/error', component: Error },
];

export const router: Router = createRouter({
  history: createWebHistory(),
  routes: routes,
});
