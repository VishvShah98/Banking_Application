<template>
  <div class="loading-container">
    <div class="loading-message">
      <span class="loading-content">
        <span style="margin-right: 10px">Loading</span>
        <img src="../assets/loading.gif" alt="Loading gif" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 87vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

/* Style the loading message */
.loading-message {
  padding: 10px;
  font-size: 20px;
}

.loading-content {
  display: flex;
  align-items: center;
}
</style>
