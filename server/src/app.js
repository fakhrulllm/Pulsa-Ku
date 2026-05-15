const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const topupRoutes = require("./routes/topup");
const walletRoutes = require("./routes/wallet");
const transactionRoutes = require("./routes/transaction");
const withdrawRoutes = require("./routes/withdraw");
const testRoutes = require("./routes/apiarie");
const paymentRoutes = require("./routes/payment");

const app = express();

// ✅ Manual CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ❌ Helmet dinonaktifkan dulu (penyebab 403)
// app.use(helmet());

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/topup", topupRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/apiarie", testRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
