<template>
  <div class="container">
    <Navbar />
    <div v-if="!loading">
      <div v-if="transactions.length > 0" class="transfer transaction-container">
        <h2 class="section-title">Accept Money</h2>
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction"
        >
          <span class="transaction-details">
            Sender: {{ transaction.sender }}
          </span>
          <span class="transaction-details">
            Amount: ${{ transaction.amount }}
          </span>
          <div class="transaction-actions">
            <button
              class="accept-button action-button"
              @click="acceptTransaction(transaction.id)"
            >
              Accept
            </button>
            <button
              class="decline-button action-button"
              @click="declineTransaction(transaction.id)"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
      <div class="transfer">
        <h2 class="section-title">Transfer Money</h2>
        <div class="transfer-options">
          <button class="option-button" @click="openInternalTransferPopup">
            Transfer Between Accounts
          </button>
          <button class="option-button" @click="openExternalTransferPopup">
            Transfer to Another Person
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <Loading />
    </div>
    <!-- Internal Transfer Popup -->
    <div v-if="showInternalTransferPopup" class="popup">
      <div class="popup-content">
        <h3>Internal Transfer</h3>
        <form @submit.prevent="transferBetweenAccounts" class="form">
          <div class="form-group">
            <label for="fromAccount">From Account:</label>
            <select
              v-model="fromAccount"
              id="fromAccount"
              required
              class="form-input"
            >
              <option value="savings">Savings</option>
              <option value="chequing">Chequing</option>
            </select>
          </div>
          <div class="form-group">
            <label for="toAccount">To Account:</label>
            <select
              v-model="toAccount"
              id="toAccount"
              required
              class="form-input"
            >
              <option value="savings">Savings</option>
              <option value="chequing">Chequing</option>
            </select>
          </div>
          <div class="form-group">
            <label for="transferAmount">Transfer Amount:</label>
            <input
              v-model="transferAmount"
              type="number"
              id="transferAmount"
              required
              class="form-input"
            />
          </div>
          <button type="submit" class="submit-button">Transfer</button>
          <button @click="closePopup" class="cancel-button">Cancel</button>
        </form>
      </div>
    </div>
    <!-- External Transfer Popup -->
    <div v-if="showExternalTransferPopup" class="popup">
      <div class="popup-content">
        <h3>External Transfer</h3>
        <form @submit.prevent="transferToAnotherPerson" class="form">
          <div class="form-group">
            <label for="receiverEmail">Receiver's Email:</label>
            <input
              v-model="receiverEmail"
              type="email"
              id="receiverEmail"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="transferAmount">Transfer Amount:</label>
            <input
              v-model="transferAmount"
              type="number"
              id="transferAmount"
              required
              class="form-input"
            />
          </div>
          <button type="submit" class="submit-button">Transfer</button>
          <button @click="closePopup" class="cancel-button">Cancel</button>
        </form>
      </div>
    </div>
    <div v-if="transferSuccess" class="success-message">
      Transfer Successful!
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
      transactions: [{ id: 0, sender: "", amount: "" }],
      showInternalTransferPopup: false,
      showExternalTransferPopup: false,
      fromAccount: "",
      toAccount: "",
      transferAmount: null,
      receiverEmail: "",
      transferSuccess: false,
      loading: true,
    };
  },
  async mounted() {
    await this.getPendingTransactions();
  },
  methods: {
    async performInternalTransfer() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}internalTransfer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              sourceType: this.fromAccount.toLowerCase(),
              targetType: this.toAccount.toLowerCase(),
              amount: this.transferAmount,
            }),
          }
        );
        const data = await response.json();
        if (data.message === "Transfer successful") {
          this.transferSuccess = true;
          setTimeout(() => {
            this.transferSuccess = false;
          }, 3000);
        } else {
          alert(data.error);
          this.transferSuccess = false;
        }
      } catch (error) {
        // console.error("Error:", error);
        alert("Error: " + error);
        this.transferSuccess = false;
      }
    },
    async getPendingTransactions() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/chequingAccount/pendingTransactions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        const data = await response.json();
        this.transactions = data;
        this.loading = false;
      } catch (error) {
        console.error("Error:", error);
        this.loading = true;
      }
    },
    async performExternalTransfer() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/chequingAccount/sendMoney`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              receiverEmail: this.receiverEmail,
              amount: this.transferAmount,
            }),
          }
        );
        const data = await response.json();
        console.log(data);
        if (data.message === "Transaction initiated successfully") {
          this.transferSuccess = true;
          setTimeout(() => {
            this.transferSuccess = false;
          }, 3000);
        } else {
          alert(data.error);
          this.transferSuccess = false;
        }
      } catch (error) {
        console.error("Error:", error);
        this.transferSuccess = false;
      }
    },
    async acceptTransaction(transactionId) {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/chequingAccount/acceptTransaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              pendingTransactionId: transactionId,
            }),
          }
        );
        const data = await response.json();
        console.log(data);
        // Refresh the list of pending transactions
        await this.getPendingTransactions();
        await this.$store.dispatch("fetchPendingTransactions");
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async declineTransaction(transactionId) {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/chequingAccount/declineTransaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              pendingTransactionId: transactionId,
            }),
          }
        );
        const data = await response.json();
        console.log(data);
        // Refresh the list of pending transactions
        await this.getPendingTransactions();
        await this.$store.dispatch("fetchPendingTransactions");
      } catch (error) {
        console.error("Error:", error);
      }
    },
    openInternalTransferPopup() {
      this.showInternalTransferPopup = true;
    },
    openExternalTransferPopup() {
      this.showExternalTransferPopup = true;
    },
    transferBetweenAccounts() {
      // Implement internal transfer logic here
      // Use this.fromAccount, this.toAccount, and this.transferAmount for the transfer details
      // Reset the form and close the popup
      // Check if fromAccount and toAccount are different
      if (this.fromAccount === this.toAccount) {
        alert("The source and destination accounts cannot be the same.");
        return;
      }

      // Check if the transfer amount is positive
      if (this.transferAmount <= 0) {
        alert("Please enter a positive transfer amount.");
        return;
      }
      this.performInternalTransfer();
      this.closePopup();
    },
    transferToAnotherPerson() {
      if (this.transferAmount <= 0) {
        alert("Please enter a positive transfer amount.");
        return;
      }
      this.performExternalTransfer();
      this.closePopup();
    },
    closePopup() {
      // Close the popup and reset the form
      this.showInternalTransferPopup = false;
      this.showExternalTransferPopup = false;
      this.fromAccount = "";
      this.toAccount = "";
      this.transferAmount = null;
      this.receiverEmail = "";
    },
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
  background-size: cover;}
.section-title {
  color: black;
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
}

.transfer {
  background-color: white;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 30px;
  margin: 60px auto;
  max-width: 600px;
}

.transaction-container {
  max-height: 250px; /* Set the desired maximum height for the scrollable area */
  overflow-y: auto; /* Enable vertical scrolling when content overflows the container */
}

.transaction {
  border: 1px solid black;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-details {
  color: black;
  font-size: 18px;
}

.transaction-actions {
  text-align: right;
}

.action-button {
  font-size: 14px;
  padding: 10px;
  margin-left: 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.accept-button {
  background-color: #34c38f;
  color: #ffffff;
}

.accept-button:hover {
  background-color: #2d9e77;
}

.decline-button {
  background-color: #f46a6a;
  color: #ffffff;
}

.decline-button:hover {
  background-color: #e04f4f;
}

.transfer-options {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.option-button {
  background-color: #6771e5;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.option-button:hover {
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
  text-align: center;
}

.popup-content {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
}

.form {
  margin-top: 20px;
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dde1e7;
  border-radius: 5px;
}

.submit-button,
.cancel-button {
  font-size: 16px;
  padding: 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.submit-button {
  background-color: #34c38f;
  color: #ffffff;
  width: 100%;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #2d9e77;
}

.cancel-button {
  background-color: #f46a6a;
  color: #ffffff;
  width: 100%;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
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

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
