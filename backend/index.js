const express = require("express");
const cors = require("cors");
const path = require("path");

const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(cors({ origin: [process.env.CLIENT_URL,"http://localhost:5173"], credentials: true }));

// Import userRoutes
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// Use userRoutes middleware
app.use("/api", userRoutes);

// Use transactionRoutes middleware
app.use("/api", transactionRoutes);

// Use expenseRoutes middleware
app.use("/api", expenseRoutes);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
