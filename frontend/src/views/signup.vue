<template>
  <div class="login-body">
    <div class="login-component">
      <h1 class="login-header">
        Welcome to<br />
        <span class="bank-name">Yourbank</span>
      </h1>
      <form class="login-form" @submit.prevent="createAccount">
        <div class="form-group">
          <input
            v-model="name"
            type="text"
            id="name"
            required
            pattern="^[A-Za-z\s]+$"
            placeholder="Name"
          />
        </div>
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            id="email"
            required
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            placeholder="Email"
          />
        </div>
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            id="password"
            required
            pattern=".{8,}"
            placeholder="Password (min. 8 characters)"
          />
        </div>
        <div class="form-group">
          <input
            v-model="contact"
            type="text"
            id="contact"
            pattern="^[0-9]{10}$"
            required
            placeholder="Contact Number"
          />
        </div>

        <button type="submit">Create Account</button>
      </form>
      Already have an account? <router-link to="/">Login</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      contact: "",
    };
  },
  methods: {
    createAccount() {
      const userData = {
        name: this.name,
        email: this.email,
        password: this.password,
        contactNumber: this.contact,
      };
      fetch(`${import.meta.env.VITE_APP_API_URL}createUser`, {
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
        .then((createdUser) => {
          alert("User created successfully");
          this.$router.push("/");
        })
        .catch((error) => {
          console.log("Error:", error.message);
        });
    },
  },
};
</script>

<style scoped>
.login-body {
  height: 120vh;
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
input[type="password"],
input[type="email"] {
  width: 300px;
  padding: 20px;
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  transition: border-bottom-color 0.2s ease-in-out;
  font-size: medium;
}

input[type="text"]::placeholder,
input[type="password"]::placeholder,
input[type="email"]::placeholder {
  color: grey;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
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
