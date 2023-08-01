<template>
  <nav class="navbar">
    <div class="navbar-left">
      <router-link to="/home" class="bank-name">Yourbank</router-link>
    </div>
    <div class="navbar-right">
      <router-link
        to="/transfer"
        class="navbar-link"
        active-class="active-link"
        exact
      >
        Move Money
        <span
          v-if="showNotification && pendingTransactionsCount > 0"
          class="notification-circle"
        >
          {{ pendingTransactionsCount }}
        </span>
      </router-link>
      <router-link
        to="/transactions"
        class="navbar-link"
        active-class="active-link"
        exact
      >
        Transaction History
      </router-link>
      <router-link
        to="/expenseTracker"
        class="navbar-link"
        active-class="active-link"
        exact
      >
        Expense Tracker
      </router-link>
      <router-link
        to="/settings"
        class="navbar-link"
        active-class="active-link"
        exact
      >
        Settings
      </router-link>
      <a class="logout-button" @click="logout">Logout</a>
    </div>
  </nav>
</template>

<script>
export default {
  created() {
    this.$store.dispatch("fetchPendingTransactions");
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.$router.beforeEach(this.authenticateUser);
  },
  computed: {
    pendingTransactionsCount() {
      return this.$store.getters.pendingTransactionsCount;
    },
  },
  data() {
    return {
      showNotification: true,
    };
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/");
    },
    isAuthenticated() {
      const token = this.$store.state.auth.token;
      return token !== null;
    },
    authenticateUser(to, from, next) {
      const token = this.$store.state.auth.token;
      if (to.path === "/" || to.path === "/signup") {
        next();
      } else {
        const authenticated = this.isAuthenticated();
        if (!authenticated) {
          this.logout();
          next("/");
        } else {
          next();
        }
      }
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: red;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  flex-wrap: wrap;
  z-index: 999;
  height: 7vh;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 1);
}

.navbar-left {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
}

.bank-name {
  font-weight: bold;
  font-size: 30px;
  text-decoration: none;
  color: white;
}

.navbar-right {
  display: flex;
  align-items: center;
  font-weight: bold;
  justify-content: space-around;
  width: 100%;
  flex-wrap: wrap;
}

.navbar-link {
  color: white;
  margin-left: 40px;
  text-decoration: none;
  position: relative;
}

.navbar-link:hover {
  text-decoration: underline;
}

.navbar-link.active-link {
  text-decoration: underline;
}

.notification-circle {
  position: absolute;
  top: -10px;
  right: -22px;
  width: 20px;
  height: 20px;
  background-color: white;
  color: red;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 0.8em;
  font-weight: bold;
}

.logout-button {
  background-color: white;
  color: red;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 40px;
  text-decoration: none;
}

@media (min-width: 768px) {
  .navbar-left {
    width: auto;
    justify-content: flex-start;
  }
  .navbar-right {
    width: auto;
    justify-content: flex-end;
    flex-wrap: nowrap;
  }
  .navbar-link {
    margin-left: 40px;
  }
}
</style>
