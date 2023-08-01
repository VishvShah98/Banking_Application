<template>
  <div class="container">
    <navbar />
    <div class="main-content" v-if="!loading">
      <div class="account-balance">
        <h2 class="account">
          Chequing Account Balance:
          <span class="number">${{ chequingBalance.toFixed(2) }}</span>
        </h2>
        <br />
        <h2 class="account">
          Savings Account Balance:
          <span class="number">${{ savingsBalance.toFixed(2) }}</span>
        </h2>
        <div class="transaction-buttons">
          <button class="withdraw-button" @click="withdraw">
            Make a Withdrawal
          </button>
          <button class="deposit-button" @click="deposit">
            Make a Deposit
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <Loading />
    </div>

    <!-- Deposit Popup -->
    <div v-if="showDepositPopup" class="popup">
      <div class="popup-content">
        <h2>Deposit Amount</h2>
        <div class="input-field">
          <input type="number" min="1" max="10000" v-model="depositAmount" />
        </div>
        <div class="button-group">
          <button @click="confirmDeposit">Confirm Deposit</button>
          <button @click="closeDepositPopup">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Withdrawal Popup -->
    <div v-if="showWithdrawalPopup" class="popup">
      <div class="popup-content">
        <h2>Withdrawal Amount</h2>
        <div class="input-field">
          <input type="number" min="1" max="2000" v-model="withdrawalAmount" />
        </div>
        <div class="button-group">
          <button @click="confirmWithdrawal">Confirm Withdrawal</button>
          <button @click="closeWithdrawalPopup">Cancel</button>
        </div>
      </div>
    </div>
    <div v-if="depositSuccess" class="success-message">Deposit Successful!</div>
    <div v-if="withdrawalSuccess" class="success-message">
      Withdrawal Successful!
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
      chequingBalance: 0,
      savingsBalance: 0,
      showDepositPopup: false,
      showWithdrawalPopup: false,
      depositAmount: 0,
      withdrawalAmount: 0,
      depositSuccess: false,
      withdrawalSuccess: false,
      loading: true,
    };
  },
  methods: {
    async deposit() {
      this.showDepositPopup = true;
    },
    closeDepositPopup() {
      this.showDepositPopup = false;
    },
    async confirmDeposit() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}chequingAccount/transaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              type: "deposit",
              amount: this.depositAmount,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.message === "Deposit successful") {
          this.chequingBalance = data.chequingAccount.balance;
          this.depositSuccess = true;
          setTimeout(() => {
            this.depositSuccess = false;
          }, 3000);
        } else {
          alert(`Deposit failed: ${data.error}`);
        }
      } catch (error) {
        console.error("Error performing deposit:", error);
      }

      this.closeDepositPopup();
    },

    closeWithdrawalPopup() {
      this.showWithdrawalPopup = false;
    },
    async withdraw() {
      this.showWithdrawalPopup = true;
    },
    async confirmWithdrawal() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}chequingAccount/transaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              type: "withdraw",
              amount: this.withdrawalAmount,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.message === "Withdrawal successful") {
          this.chequingBalance = data.chequingAccount.balance;
          this.withdrawalSuccess = true;
          setTimeout(() => {
            this.withdrawalSuccess = false;
          }, 3000);
        } else {
          alert(`Withdrawal failed: ${data.error}`);
        }
      } catch (error) {
        console.error("Error performing withdrawal:", error);
      }

      this.closeWithdrawalPopup();
    },
    async getAccountBalances() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}getUserData`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );

        const data = await response.json();
        this.chequingBalance = data.user.accounts.find(
          (account) => account.accountType === "chequing"
        ).balance;
        this.savingsBalance = data.user.accounts.find(
          (account) => account.accountType === "savings"
        ).balance;
        this.loading = false; // Set loading to false once data is loaded
      } catch (error) {
        console.error("Error retrieving account balances:", error);
        this.loading = false; // Set loading to false in case of an error
      }
    },
  },
  created() {
    this.getAccountBalances();
  },
};
</script>

<style scoped>
.container {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
  background-color: rgb(255, 246, 228);
  background-image: linear-gradient(to bottom, #ffd8d8, #ddddff);
  background-size: cover;
}
img {
  max-width: 100%;
  height: auto;
}

.main-content {
  padding: 20px;
}

.account-balance {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  margin: 40px auto;
  padding: 40px;
  width: 600px;
  text-align: center;
  color: #333;
  transition: 0.3s;
}

.account {
  margin-bottom: 10px;
}

.transaction-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.withdraw-button,
.deposit-button {
  background-color: #6771e5;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.withdraw-button:hover,
.deposit-button:hover {
  background-color: #5c63c2;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
}

.popup-content h2 {
  font-size: 30px;
  margin-bottom: 20px;
  color: #333;
}

.popup-content .input-field {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.popup-content input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dde1e7;
  border-radius: 5px;
}

.popup-content .button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.popup-content button {
  font-size: 16px;
  padding: 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.popup-content button:first-child {
  background-color: #34c38f;
  color: #ffffff;
  width: 100%;
}

.popup-content button:first-child:hover {
  background-color: #2d9e77;
}

.popup-content button:last-child {
  background-color: #f46a6a;
  color: #ffffff;
  width: 100%;
}

.popup-content button:last-child:hover {
  background-color: #e04f4f;
}

.success-message {
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 20px;
  background-color: rgba(76, 175, 80, 0.9); /* slightly transparent green */
  color: white;
  font-size: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
  transition: opacity 0.5s ease-in-out;
  opacity: 0;
  animation: fadeIn 0.5s 1s forwards;
}

.number {
  font-weight: lighter;
  color: #333;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
