const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

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

router.post(
  "/chequingAccount/transaction",
  authenticateToken,
  async (req, res) => {
    const { type, amount } = req.body;
    if (amount < 0) {
      return res.status(400).json({ error: "Amount cannot be negative" });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has a chequing account
      const chequingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          accountType: "chequing",
        },
      });

      if (!chequingAccount) {
        return res.status(404).json({ error: "Chequing account not found" });
      }

      if (type === "deposit") {
        if (amount > 10000) {
          return res
            .status(400)
            .json({ error: "Deposit amount cannot exceed 10000" });
        }

        // Group account update and transaction creation in a Prisma transaction
        const [updatedChequingAccount, transaction] = await prisma.$transaction(
          [
            prisma.account.update({
              where: { id: chequingAccount.id },
              data: { balance: chequingAccount.balance + amount },
            }),
            prisma.transaction.create({
              data: {
                accountId: chequingAccount.id,
                amount: amount,
                transactionType: "DEPOSIT",
              },
            }),
          ]
        );

        res.status(200).json({
          message: "Deposit successful",
          chequingAccount: updatedChequingAccount,
        });
      } else if (type === "withdraw") {
        if (amount > 2000) {
          return res
            .status(400)
            .json({ error: "Withdrawal amount cannot exceed 2000" });
        }
        if (amount > chequingAccount.balance) {
          return res.status(400).json({ error: "Insufficient funds" });
        }

        // Group account update and transaction creation in a Prisma transaction
        const [updatedChequingAccount, transaction] = await prisma.$transaction(
          [
            prisma.account.update({
              where: { id: chequingAccount.id },
              data: { balance: chequingAccount.balance - amount },
            }),
            prisma.transaction.create({
              data: {
                accountId: chequingAccount.id,
                amount: amount,
                transactionType: "WITHDRAW",
              },
            }),
          ]
        );

        res.status(200).json({
          message: "Withdrawal successful",
          chequingAccount: updatedChequingAccount,
        });
      } else {
        return res.status(400).json({ error: "Invalid transaction type" });
      }
    } catch (error) {
      console.error("Error performing transaction:", error);
      res.status(500).json({ error: "Error performing transaction" });
    }
  }
);

router.post("/internalTransfer", authenticateToken, async (req, res) => {
  const { sourceType, targetType, amount } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has a source account
    const sourceAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: sourceType,
      },
    });

    if (!sourceAccount) {
      return res.status(404).json({ error: `${sourceType} account not found` });
    }

    // Check if the user has a target account
    const targetAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: targetType,
      },
    });

    if (!targetAccount) {
      return res.status(404).json({ error: `${targetType} account not found` });
    }

    // Check if the transfer amount exceeds the available balance in source account
    if (amount > sourceAccount.balance) {
      return res
        .status(400)
        .json({ error: "Insufficient balance in source account" });
    }
    console.log(
      sourceAccount.balance,
      targetAccount.balance,
      sourceAccount.accountType,
      targetAccount.accountType,
      sourceType,
      targetType,
      amount
    );
    // Update the source and target account balances
    const updatedSourceAccount = await prisma.account.update({
      where: { id: sourceAccount.id },
      data: {
        balance: sourceAccount.balance - amount,
      },
    });

    const updatedTargetAccount = await prisma.account.update({
      where: { id: targetAccount.id },
      data: {
        balance: targetAccount.balance + amount,
      },
    });

    res.status(200).json({
      message: "Transfer successful",
      sourceAccount: updatedSourceAccount,
      targetAccount: updatedTargetAccount,
    });
  } catch (error) {
    console.error("Error performing transaction:", error);
    res.status(500).json({ error: "Error performing transaction" });
  }
});

// Send money route
router.post(
  "/chequingAccount/sendMoney",
  authenticateToken,
  async (req, res) => {
    const { receiverEmail, amount } = req.body;

    const sender = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const senderChequingAccount = await prisma.account.findFirst({
      where: {
        userId: sender.id,
        accountType: "chequing",
      },
    });

    if (!senderChequingAccount || senderChequingAccount.balance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const pendingTransaction = await prisma.pendingTransaction.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount: amount,
        timestamp: new Date(),
      },
    });

    res.status(200).json({
      message: "Transaction initiated successfully",
      pendingTransaction: pendingTransaction,
    });
  }
);

// Get all pending transactions for a user
router.get(
  "/chequingAccount/pendingTransactions",
  authenticateToken,
  async (req, res) => {
    const receiver = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    const pendingTransactions = await prisma.pendingTransaction.findMany({
      where: {
        receiverId: receiver.id,
      },
      include: {
        sender: true, // This will include the sender's data in the response
      },
    });

    // map over pendingTransactions to replace senderId with senderName
    const transactionsWithSenderName = pendingTransactions.map(
      (transaction) => {
        return {
          ...transaction,
          sender: transaction.sender.name, // Assuming 'name' is the field name in the User model
        };
      }
    );

    res.status(200).json(transactionsWithSenderName);
  }
);

// Accept a transaction
router.post(
  "/chequingAccount/acceptTransaction",
  authenticateToken,
  async (req, res) => {
    const { pendingTransactionId } = req.body;

    const receiver = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const pendingTransaction = await prisma.pendingTransaction.findUnique({
      where: {
        id: pendingTransactionId,
      },
    });

    if (!pendingTransaction || pendingTransaction.receiverId !== receiver.id) {
      return res.status(400).json({ error: "Invalid transaction" });
    }

    const senderChequingAccount = await prisma.account.findFirst({
      where: {
        userId: pendingTransaction.senderId,
        accountType: "chequing",
      },
    });

    const receiverChequingAccount = await prisma.account.findFirst({
      where: {
        userId: receiver.id,
        accountType: "chequing",
      },
    });

    // Update the sender and receiver's chequing account balance
    const transaction = await prisma.$transaction([
      prisma.account.update({
        where: { id: senderChequingAccount.id },
        data: {
          balance: senderChequingAccount.balance - pendingTransaction.amount,
        },
      }),
      prisma.account.update({
        where: { id: receiverChequingAccount.id },
        data: {
          balance: receiverChequingAccount.balance + pendingTransaction.amount,
        },
      }),
      // Add a new Transaction to the Transaction model for the sender
      prisma.transaction.create({
        data: {
          senderId: senderChequingAccount.userId,
          receiverId: receiverChequingAccount.userId,
          accountId: senderChequingAccount.id,
          amount: pendingTransaction.amount,
          transactionType: "SENT",
        },
      }),
      // Add a new Transaction to the Transaction model for the receiver
      prisma.transaction.create({
        data: {
          senderId: senderChequingAccount.userId,
          receiverId: receiverChequingAccount.userId,
          accountId: receiverChequingAccount.id,
          amount: pendingTransaction.amount,
          transactionType: "RECEIVED",
        },
      }),
    ]);

    // Delete the pending transaction
    await prisma.pendingTransaction.delete({
      where: {
        id: pendingTransactionId,
      },
    });

    res.status(200).json({
      message: "Transaction accepted successfully",
      transaction: transaction,
    });
  }
);

// Decline a transaction
router.post(
  "/chequingAccount/declineTransaction",
  authenticateToken,
  async (req, res) => {
    const { pendingTransactionId } = req.body;

    const receiver = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const pendingTransaction = await prisma.pendingTransaction.findUnique({
      where: {
        id: pendingTransactionId,
      },
    });

    if (!pendingTransaction || pendingTransaction.receiverId !== receiver.id) {
      return res.status(400).json({ error: "Invalid transaction" });
    }

    // Delete the pending transaction
    await prisma.pendingTransaction.delete({
      where: {
        id: pendingTransactionId,
      },
    });

    res.status(200).json({
      message: "Transaction declined successfully",
    });
  }
);

router.get("/transactionHistory", authenticateToken, async (req, res) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch user's chequing account
    const chequingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: "chequing",
      },
    });

    if (!chequingAccount) {
      return res.status(404).json({ error: "Chequing account not found" });
    }

    // Fetch the transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: chequingAccount.id,
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Format the transactions
    const formattedTransactions = transactions.map((transaction) => {
      let counterpartName;
      switch (transaction.transactionType) {
        case "SENT":
          counterpartName = transaction.receiver
            ? transaction.receiver.name
            : "Unknown";
          break;
        case "RECEIVED":
          counterpartName = transaction.sender
            ? transaction.sender.name
            : "Unknown";
          break;
        case "DEPOSIT":
        case "WITHDRAW":
          counterpartName = transaction.transactionType;
          break;
        default:
          counterpartName = "Unknown";
      }

      return {
        id: transaction.id,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        transactionType: transaction.transactionType,
        counterpartName: counterpartName,
      };
    });

    // Send the transactions back as a response
    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

module.exports = router;
