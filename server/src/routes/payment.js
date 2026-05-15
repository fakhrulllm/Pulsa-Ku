const router = require("express").Router();
const auth = require("../middleware/auth");

const LOUVIN_BASE = "https://api.louvin.dev";

const louvinHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key": process.env.LOUVIN_API_KEY,
});

router.post("/create", auth, async (req, res) => {
  const { amount, payment_type, customer_name, customer_email, description, reference } = req.body;
  if (!amount || !payment_type) {
    return res.status(400).json({ message: "amount dan payment_type wajib diisi" });
  }
  try {
    const body = { amount: Number(amount), payment_type };
    if (customer_name) body.customer_name = customer_name;
    if (customer_email) body.customer_email = customer_email;
    if (description) body.description = description;
    if (reference) body.reference = reference;

    const response = await fetch(`${LOUVIN_BASE}/create-transaction`, {
      method: "POST",
      headers: louvinHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.error || "Gagal membuat transaksi" });
    }
    res.status(201).json({ ok: true, transaction: data.transaction, payment: data.payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/status/:transactionId", auth, async (req, res) => {
  const { transactionId } = req.params;
  try {
    const response = await fetch(`${LOUVIN_BASE}/check-status?id=${transactionId}`, {
      headers: louvinHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.error || "Gagal cek status" });
    }
    res.json({ ok: true, transaction: data.transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;