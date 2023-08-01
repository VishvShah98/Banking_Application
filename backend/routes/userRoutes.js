const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();
const prisma = new PrismaClient();

// Secret key for signing JWT
const secretKey = process.env.SECRET_KEY;

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

router.post("/createUser", async (req, res) => {
  const { email, password, name, contactNumber } = req.body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        contactNumber,
        accounts: {
          create: [
            {
              accountType: "chequing",
              balance: 0,
            },
            {
              accountType: "savings",
              balance: 0,
            },
          ],
        },
      },
      include: {
        accounts: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user with the provided email exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, secretKey);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

router.get("/getUserData", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ error: "Error retrieving user data" });
  }
});

router.post("/editUserData", authenticateToken, async (req, res) => {
  const { field, value } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the specified field with the new value
    let updatedUser;
    switch (field) {
      case "name":
        updatedUser = await prisma.user.update({
          where: { email: req.user.email },
          data: { name: value },
        });
        break;
      case "email":
        updatedUser = await prisma.user.update({
          where: { email: req.user.email },
          data: { email: value },
        });

        // Generate a new JWT token with the updated email
        const newToken = jwt.sign({ email: value }, secretKey);

        res.status(200).json({
          message: "User data updated successfully",
          user: updatedUser,
          token: newToken,
        });
        return; // Return early to prevent the default response below
      case "password":
        const hashedPassword = await bcrypt.hash(value, 10);
        updatedUser = await prisma.user.update({
          where: { email: req.user.email },
          data: { password: hashedPassword },
        });
        break;
      case "contact number":
        updatedUser = await prisma.user.update({
          where: { email: req.user.email },
          data: { contactNumber: value },
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid field" });
    }

    res
      .status(200)
      .json({ message: "User data updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Error updating user data" });
  }
});

module.exports = router;
