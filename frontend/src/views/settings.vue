<template>
  <div class="container">
    <Navbar />
    <div class="settings" v-if="!loading">
      <h2>Profile Settings</h2>
      <div class="user-info">
        <div class="info-row">
          <div class="info-left">
            <span class="label">Full Name:</span>
            <span class="value">{{ user.name }}</span>
          </div>
          <button class="edit-button" @click="openEditPopup('Name')">
            Edit
          </button>
        </div>
        <div class="info-row">
          <div class="info-left">
            <span class="label">Primary Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <button class="edit-button" @click="openEditPopup('Email')">
            Edit
          </button>
        </div>
        <div class="info-row">
          <div class="info-left">
            <span class="label">Secured Password:</span>
            <span class="value">{{ maskedPassword }}</span>
          </div>
          <button class="edit-button" @click="openEditPopup('Password')">
            Edit
          </button>
        </div>
        <div class="info-row">
          <div class="info-left">
            <span class="label">Mobile Number:</span>
            <span class="value">{{ user.contactNumber }}</span>
          </div>
          <button class="edit-button" @click="openEditPopup('Contact Number')">
            Edit
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <Loading />
    </div>
    <!-- Edit Modal -->
    <div v-if="showEditPopup" class="modal">
      <div class="modal-content">
        <h3>Modify {{ editedField }}</h3>
        <div class="input-field">
          <input
            v-model="editedValue"
            type="text"
            :placeholder="'Enter new ' + editedField"
            required
            :pattern="getValidationPattern(editedField)"
            :title="getValidationTitle(editedField)"
          />
          <!-- Add a custom error message for invalid input -->
          <div v-if="isInvalidInput" class="error-message">
            Invalid {{ editedField.toLowerCase() }}
          </div>
        </div>
        <div class="button-group">
          <button @click="saveEdit">Save</button>
          <button @click="cancelEdit">Dismiss</button>
        </div>
      </div>
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
      user: {
        name: "",
        email: "",
        password: "",
        contactNumber: "",
      },
      showEditPopup: false,
      editedField: "",
      editedValue: "",
      isInvalidInput: false,
      loading: true,
    };
  },
  methods: {
    openEditPopup(field) {
      this.showEditPopup = true;
      this.editedField = field.toLowerCase();
      this.editedValue = this.user[field];
      this.isInvalidInput = false; // Reset the invalid input flag when the popup opens
    },
    cancelEdit() {
      this.closeEditPopup();
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.editedField = "";
      this.editedValue = "";
      this.isInvalidInput = false; // Reset the invalid input flag when the popup closes
    },
    async saveEdit() {
      try {
        // Check if editedValue is not empty
        if (!this.editedValue.trim()) {
          this.isInvalidInput = true;
          return;
        }

        if (this.editedField === "email") {
          // Email validation: Basic check
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(this.editedValue.toLowerCase())) {
            this.isInvalidInput = true;
            return;
          }
        } else if (this.editedField === "name") {
          // Name validation: alphabets and spaces only
          const re = /^[A-Za-z\s]+$/;
          if (!re.test(this.editedValue)) {
            this.isInvalidInput = true;
            return;
          }
        } else if (this.editedField === "contact number") {
          // Contact number validation: 10 digits only
          const re = /^[0-9]{10}$/;
          if (!re.test(this.editedValue)) {
            this.isInvalidInput = true;
            return;
          }
        }

        await this.editUserData();
        this.closeEditPopup();
      } catch (error) {
        console.error("Error saving edit:", error);
      }
    },

    async getUserData() {
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
        this.user = data.user;
        this.loading = false; // Set loading to false once data is loaded
      } catch (error) {
        console.error("Error retrieving user data:", error);
        this.loading = false; // Set loading to false in case of an error
      }
    },

    async editUserData() {
      try {
        const token = this.$store.state.auth.token;
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}editUserData`,
          {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              field: this.editedField,
              value: this.editedValue,
            }),
          }
        );

        const data = await response.json();
        if (this.editedField.toLowerCase() === "email") {
          // Update the token with the new email
          this.$store.dispatch("updateToken", data.token);
        }
        this.user = data.user;
      } catch (error) {
        console.error("Error editing user data:", error);
      }
    },
    getValidationPattern(field) {
      // Return the regex pattern based on the field being edited
      if (field === "name") {
        return "^[A-Za-z\\s]+$"; // Allows alphabets and spaces only
      } else if (field === "email") {
        return "^[^\s@]+@[^\s@]+\.[^\s@]+$"; // Basic email validation pattern
      } else if (field === "contact number") {
        return "^[0-9]{10}$"; // Allows 10 digits only
      } else {
        return null; // No validation pattern for other fields
      }
    },
    getValidationTitle(field) {
      // Return the validation title based on the field being edited
      if (field === "name") {
        return "Alphabets and spaces only";
      } else if (field === "email") {
        return "Please enter a valid email address";
      } else if (field === "contact number") {
        return "Please enter a 10-digit number";
      } else {
        return null; // No validation title for other fields
      }
    },
    validateEditedValue(field, value) {
      // Perform additional validation if needed
      // Implement custom validation logic for each field if required
      if (field === "email") {
        return this.validateEmail(value);
      } else if (field === "contact number") {
        return this.validateContactNumber(value);
      } else {
        return true; // No additional validation for other fields
      }
    },
  },
  created() {
    this.getUserData();
  },
  computed: {
    maskedPassword() {
      //replace all characters with asterisks and limit to 8 characters
      return this.user.password.replace(/./g, "*").slice(0, 8);
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
  background-size: cover;
}
.settings {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  padding: 20px;
  width: 600px;
  margin: 40px auto;
  text-align: center;
}

.settings h2 {
  margin-bottom: 20px;
}

.settings .user-info {
  margin-top: 20px;
}

.settings .info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.settings .info-left {
  display: flex;
  align-items: center;
}

.settings .label {
  font-weight: bold;
  margin-right: 10px;
  color: #333;
}

.settings .value {
  color: #555;
}

.settings .edit-button {
  background-color: #6771e5;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 7px 13px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

.settings .edit-button:hover {
  background-color: #5c63c2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  text-align: center;
}

.modal-content h3 {
  font-size: 30px;
  margin-bottom: 20px;
}

.modal-content .input-field {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.modal-content input {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  font-size: 18px;
}

.modal-content .button-group {
  display: flex;
  justify-content: space-evenly;
}

.modal-content button {
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

.modal-content button:first-child {
  background-color: #34c38f;
  color: #ffffff;
  width: 100%;
}

.modal-content button:first-child:hover {
  background-color: #2d9e77;
}

.modal-content button:last-child {
  background-color: #f46a6a;
  color: #ffffff;
  width: 100%;
}

.modal-content button:last-child:hover {
  background-color: #e04f4f;
}

.error-message {
  color: red;
  margin-top: 5px;
}
</style>
