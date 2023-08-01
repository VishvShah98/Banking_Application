const state = {
  token: null,
  pendingTransactions: [], // added this line
};

const mutations = {
  setToken(state, token) {
    state.token = token;
    localStorage.setItem("token", token); // Store the token in local storage
  },
  clearToken(state) {
    state.token = null;
    localStorage.removeItem("token"); // Remove the token from local storage
  },
  setPendingTransactions(state, transactions) { // added this mutation
    state.pendingTransactions = transactions;
  },
};

const actions = {
  async fetchPendingTransactions({ commit, state }) { // added this action
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/chequingAccount/pendingTransactions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: state.token,
          },
        }
      );
      const data = await response.json();
      commit("setPendingTransactions", data);
    } catch (error) {
      console.error("Error:", error);
    }
  },
  login({ commit }, token) {
    commit("setToken", token);
  },
  logout({ commit }) {
    commit("clearToken");
  },
  initializeAuth({ commit }) {
    const token = localStorage.getItem("token");
    if (token) {
      commit("setToken", token);
    } else {
      commit("clearToken"); // Clear the token from state if it doesn't exist in local storage
    }
  },
  updateToken({ commit }, newToken) {
    commit("setToken", newToken);
  },
};

const getters = {
  isAuthenticated(state) {
    return state.token !== null;
  },
  pendingTransactionsCount(state) { // added this getter
    return state.pendingTransactions.length;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
