<template>
  <div class="login-body">
    <div class="login-component">
      <h1 class="login-header">
        Welcome to<br />
        <span class="bank-name">Yourbank</span>
      </h1>
      <form class="login-form" @submit.prevent="signIn">
        <div class="form-group">
          <input
            v-model="email"
            type="text"
            id="email"
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            required
            placeholder="Email"
          />
        </div>

        <div class="form-group">
          <input
            v-model="password"
            type="password"
            id="password"
            pattern=".{8,}"
            required
            placeholder="Password"
          />
        </div>

        <button type="submit">Sign In</button>
      </form>
      Don't have an account? <router-link to="/signup">Sign Up</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    signIn() {
      const userData = {
        email: this.email,
        password: this.password,
      };

      fetch(`${import.meta.env.VITE_APP_API_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((err) => {
              alert(err.error);
              throw new Error(err.error);
            });
          }
        })
        .then((data) => {
          // Store the token in Vuex store
          this.$store.dispatch("login", data.token);
          // Implement your logic to navigate to Home.vue here
          this.$router.push("/home");
        })
        .catch((error) => {
          console.error("Error signing in:", error);
          // Handle the error and display appropriate feedback to the user
        });
    },
  },
};
</script>

<style scoped>
.login-body {
  height: 100vh;
  background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Set the parent container as relative to position the video absolutely */
}
.bank-name {
  color: red;
  font-size: 50px;
}
.login-component {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  margin: 40px auto;
  padding: 50px;
  max-width: 400px;
  text-align: center;
  font-size: large;
}

.login-header {
  font-size: 30px;
  font-weight: bold;
}

.login-form {
  margin: 50px 0 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  margin-bottom: 20px;
  text-align: center;
}

label {
  display: block;
}

input[type="text"],
input[type="password"] {
  width: 300px;
  padding: 20px;
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  transition: border-bottom-color 0.2s ease-in-out;
  font-size: medium;
}

input[type="text"]::placeholder,
input[type="password"]::placeholder {
  color: grey;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-bottom-color: red;
}

button[type="submit"] {
  margin-top: 50px;
  width: 300px;
  padding: 20px;
  background-color: red;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: medium;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

button[type="submit"]:hover {
  background-color: darkred;
}
</style>
