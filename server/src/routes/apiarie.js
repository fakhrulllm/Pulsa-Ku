const router = require("express").Router();
const auth = require("../middleware/auth");

const PULSA_API_URL = "https://ariepulsa.com/api/pulsa";
const PROFILE_API_URL = "https://ariepulsa.com/api/profile";
const PULSA_API_KEY = "7AEX6xOOOxKQDZW964VeMfdcrikga39o";

const callPulsaAPI = async (action, extraParams = {}) => {
  const params = new URLSearchParams({ api_key: PULSA_API_KEY, action });
  Object.entries(extraParams).forEach(([k, v]) => {
    if (k && v) params.append(k, v);
  });

  const url = PULSA_API_URL;
  const start = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { status: res.status, data, ms: Date.now() - start, url };
};

router.get("/ping", auth, (req, res) => {
  res.json({ ok: true, user: req.user, time: new Date().toISOString() });
});

router.get("/pulsa", auth, async (req, res) => {
  const { action = "layanan", ...rest } = req.query;
  try {
    const result = await callPulsaAPI(action, rest);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

router.post("/pulsa", auth, async (req, res) => {
  const { action, ...rest } = req.body;
  if (!action) return res.status(400).json({ message: "action wajib diisi" });
  try {
    const result = await callPulsaAPI(action, rest);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

router.get("/layanan", auth, async (req, res) => {
  try {
    const result = await callPulsaAPI("layanan");
    const list = result.data?.data ?? result.data?.layanan ?? result.data ?? [];
    res.json({ ok: true, data: Array.isArray(list) ? list : Object.values(list) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/beli", auth, async (req, res) => {
  const { tujuan, layanan, ref_id } = req.body;
  if (!tujuan || !layanan) {
    return res.status(400).json({ message: "tujuan dan layanan wajib diisi" });
  }
  const refId = ref_id || "ADM-" + Date.now();
  try {
    const result = await callPulsaAPI("pemesanan", { layanan, target: tujuan, ref_id: refId });
    res.json({ ok: true, ref_id: refId, data: result.data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/saldo", auth, async (req, res) => {
  try {
    const params = new URLSearchParams({ api_key: PULSA_API_KEY, action: "profile" });
    const response = await fetch(PROFILE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await response.json();
    const saldo = Number(data?.data?.saldo_ppob ?? 0);
    res.json({ ok: true, saldo, raw: data.data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
