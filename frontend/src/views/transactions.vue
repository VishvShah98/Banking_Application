<template>
  <div class="container">
    <Navbar />
    <div class="transactions" v-if="!loading">
      <h2 style="margin-bottom: 10px;">Transaction History</h2>
      <div class="transaction-list">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-date">
            {{ formatDate(transaction.timestamp) }}
          </div>
          <div class="transaction-details">
            <span
              :class="[
                'transaction-amount',
                transaction.transactionType.toLowerCase(),
              ]"
            >
              {{ formatCurrency(transaction.amount) }}
            </span>
            <div class="transaction-info">
              <span class="transaction-type">
                {{ transaction.transactionType.toLowerCase() }}
              </span>
              <span
                v-if="
                  ['sent', 'received'].includes(
                    transaction.transactionType.toLowerCase()
                  )
                "
                class="counterpart-name"
              >
                to/from: {{ transaction.counterpartName }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="transactions.length === 0" class="no-transactions">
          No transactions found.
        </div>
      </div>
    </div>
    <div v-else>
      <Loading />
    </div>
  </div>
</template>

<script>
import Navbar from "../components/navbar.vue";
import Loading from "../components/loading.vue";

export default {
  components: {
    Navbar,
    Loading,
  },
  data() {
    return {
      transactions: [],
      loading: true,
    };
  },
  methods: {
    formatCurrency(value) {
      return `$${Number(value).toFixed(2)}`;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
  async created() {
    const token = this.$store.state.auth.token; // get the token from Vuex store
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/transactionHistory`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    this.transactions = await response.json();
    this.loading = false;
  },
};
</script>

<style scoped>
.container {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
  background-color: #f9f9f9;
  background-image: linear-gradient(to bottom, #ffd8d8, #ddddff);
  background-size: cover;
}
.transactions {
  max-width: 800px;
  max-height: 500px;
  margin: 40px auto;
  padding: 2em;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}

.transaction-list {
  padding: 1em 0;
  max-height: 400px; /* You can adjust this value based on your need */
  overflow-y: auto; /* Show scroll bar when content overflows */
}
/* Hide the scrollbar for webkit-based browsers */
.transaction-list::-webkit-scrollbar {
  width: 0.5em;
}

.transaction-list::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.transaction-item {
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 2em;
  margin-bottom: 1em;
  padding: 1em;
  background-color: #fff;
  border-radius: 8px;
  border: 1.5px solid black;
}

.transaction-date,
.transaction-details,
.counterpart-name {
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-amount {
  font-weight: bold;
  font-size: 1.2em;
}

.transaction-type {
  font-size: 1em;
  text-transform: capitalize;
}

.sent {
  color: lightcoral;
}

.received,
.deposit {
  color: rgb(50, 207, 50);
}

.withdraw {
  color: orange;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.transaction-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
}

.counterpart-name {
  font-size: 0.8em;
  font-style: italic;
  color: #888;
}

.no-transactions {
  margin-top: 2em;
  font-style: italic;
  color: #888;
}
</style>
