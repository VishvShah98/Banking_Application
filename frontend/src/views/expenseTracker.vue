<template>
  <div class="container1">
    <Navbar />
    <div class="container" v-if="!loading">
      <h2 class="header">Expense Tracker</h2>
      <div class="main-content">
        <!-- Form to add an expense -->
        <form @submit.prevent="createExpense" class="expense-form">
          <label for="expense-name" class="expense-input">Expense Name:</label>
          <input
            id="expense-name"
            v-model="expense.name"
            placeholder="Expense name"
            class="expense-input"
            pattern="^[A-Za-z\s]+$"
            required
          />

          <label for="expense-amount" class="expense-input">Amount:</label>
          <input
            id="expense-amount"
            v-model="expense.amount"
            type="number"
            placeholder="Expense amount"
            class="expense-input"
            min="1"
            max="5000"
            required
          />

          <button type="submit" class="create-btn">Create Expense</button>
        </form>
        <div class="total-expense" v-if="expenses.length === 0">
          Start adding expenses to track your spending
        </div>
        <div class="total-expense" v-if="expenses.length > 0">
          <strong>Total Expense:</strong> ${{ totalExpense }}
        </div>
        <div class="content-area">
          <!-- List of expenses -->
          <div class="expense-list-box" v-if="expenses.length > 0">
            <h3 class="expense-list-header">List of Expenses</h3>
            <ul class="expense-list" v-show="expenses.length > 0">
              <li
                v-for="(expense, index) in expenses"
                :key="expense.id"
                class="expense-item"
              >
                {{ expense.name }}: &ensp; ${{ expense.amount }}
                <button @click="deleteExpense(expense.id)" class="delete-btn">
                  Delete
                </button>
              </li>
            </ul>
          </div>
          <!-- Pie chart -->
          <div class="chart-container">
            <canvas ref="expenseChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <Loading />
      <div class="chart-container-hidden">
        <canvas ref="expenseChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../components/navbar.vue";
import Chart from "chart.js/auto";
import Loading from "../components/loading.vue";

export default {
  components: { Navbar, Loading },
  data() {
    return {
      expenses: [],
      expense: {
        name: "",
        amount: 0,
      },
      chart: null,
      loading: true,
    };
  },
  computed: {
    totalExpense() {
      return this.expenses.reduce(
        (total, expense) => total + expense.amount,
        0
      );
    },
  },
  watch: {
    expenses: {
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      deep: true,
    },
  },
  async created() {
    await this.fetchExpenses();
  },
  methods: {
    async fetchExpenses() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/expenses`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        const data = await response.json();
        this.expenses = data;
        this.loading = false;
      } catch (error) {
        console.log(error);
        alert("An error occurred. Please try again.");
        this.loading = true;
      }
    },

    async createExpense() {
      try {
        if (!this.expense.name || !this.expense.amount) {
          alert("Please fill in all the fields.");
          return;
        }
        const token = this.$store.state.auth.token;
        await fetch(`${import.meta.env.VITE_APP_API_URL}/createExpense`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(this.expense),
        });
        this.expense.name = "";
        this.expense.amount = 0;
        await this.fetchExpenses();
      } catch (error) {
        console.log(error);
        alert("An error occurred. Please try again.");
      }
    },
    async deleteExpense(id) {
      try {
        const token = this.$store.state.auth.token;
        await fetch(`${import.meta.env.VITE_APP_API_URL}/deleteExpense/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        await this.fetchExpenses();
      } catch (error) {
        console.log(error);
        alert("An error occurred. Please try again.");
      }
    },
    renderChart() {
      const ctx = this.$refs.expenseChart.getContext("2d");
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: this.expenses.map((expense) => expense.name),
          datasets: [
            {
              data: this.expenses.map((expense) => expense.amount),
              backgroundColor: this.expenses.map(() => this.getRandomColor()),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },

    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
};
</script>

<style scoped>
.main-content {
  background: #fff;
  padding: 20px;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.container1 {
  margin: 0;
  padding: 0;
  height: 125vh;
  width: 100%;
  background-color: #f9f9f9;
  background-image: linear-gradient(to bottom, #ffd8d8, #ddddff);
  background-size: cover;
}
.container {
  margin: 40px auto;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background: #f9f9f9;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 700;
}

.expense-form {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.form-label {
  font-weight: bold;
}

.expense-input {
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-family: "Roboto", sans-serif;
}

.create-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  margin-left: 0.5rem;
  cursor: pointer;
  font-family: "Roboto", sans-serif;
  transition: background-color 0.3s ease;
  font-weight: bold;
}

.create-btn {
  background-color: #4caf50;
  color: white;
}

.create-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #da190b;
}

.content-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.expense-list-box {
  width: 45%;
  background: #f7f7f7;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* This makes sure that the border radius applies to children as well */
}

.expense-list-header {
  background-color: #333;
  color: #fff;
  padding: 10px;
  font-family: "Roboto", sans-serif;
  text-align: center;
  margin-bottom: 0;
}

.expense-list {
  list-style-type: none;
  padding: 0;
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 0;
}
/* Hide the scrollbar for webkit-based browsers */
.expense-list::-webkit-scrollbar {
  width: 0.5em;
}

.expense-list::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-family: "Roboto", sans-serif;
}

.expense-item:last-child {
  border-bottom: none;
}
.chart-container {
  width: 45%;
  height: 400px;
}

.chart-container-hidden {
  width: 45%;
  height: 400px;
  display: none;
}

.total-expense {
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  color: #333;
  font-size: 1.2rem;
  background-color: #f9f9f9;
  border-radius: 5px;
  border-color: black;
  border: 1px solid black;
  font-weight: bold;
}
</style>
