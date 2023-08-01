import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import { createStore } from "vuex";
import auth from "../store/auth";

const routes = [
  {
    path: "/",
    component: () => import("./views/login.vue"),
  },
  {
    path: "/signup",
    component: () => import("./views/signup.vue"),
  },
  {
    path: "/home",
    component: () => import("./views/home.vue"),
    meta: { requiresAuth: true }, // Add meta field for authentication
  },
  {
    path: "/transactions",
    component: () => import("./views/transactions.vue"),
    meta: { requiresAuth: true }, // Add meta field for authentication
  },
  {
    path: "/transfer",
    component: () => import("./views/transfer.vue"),
    meta: { requiresAuth: true }, // Add meta field for authentication
  },
  {
    path: "/settings",
    component: () => import("./views/settings.vue"),
    meta: { requiresAuth: true }, // Add meta field for authentication
  },
  {
    path: "/expenseTracker",
    component: () => import("./views/expenseTracker.vue"),
    meta: { requiresAuth: true }, // Add meta field for authentication
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Navigation guard to check if route requires authentication
router.beforeEach((to, from, next) => {
  const token = store.state.auth.token;
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !token) {
    next("/");
  } else {
    next();
  }
});

const store = createStore({
  modules: {
    auth,
  },
});
store.dispatch("initializeAuth");
const app = createApp(App);
app.use(router);
app.use(store);

// Dispatch the initializeAuth action after the app is created
app.mount("#app");
