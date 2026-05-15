import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { Phone, Zap, Loader2, X, CreditCard, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const PREFIX_MAP = [
  { prefix: ['0811','0812','0813','0821','0822','0823','0851','0852','0853'], operator: 'Telkomsel', sid_prefix: 'TSEL' },
  { prefix: ['0814','0815','0816','0855','0856','0857','0858'], operator: 'Indosat', sid_prefix: 'ISAT' },
  { prefix: ['0817','0818','0819','0859','0877','0878'], operator: 'XL', sid_prefix: 'XL' },
  { prefix: ['0831','0832','0833','0838'], operator: 'Axis', sid_prefix: 'AXIS' },
  { prefix: ['0881','0882','0883','0884','0885','0886','0887','0888','0889'], operator: 'Smartfren', sid_prefix: 'SMART' },
  { prefix: ['0895','0896','0897','0898','0899'], operator: 'Three', sid_prefix: 'THREE' },
]

const PAYMENT_METHODS = [
  { code: 'qris',         label: 'QRIS',        desc: 'Bayar via QR Code',       feeType: 'pct' },
  { code: 'gopay',        label: 'GoPay',        desc: 'Bayar via GoPay',         feeType: 'pct' },
  { code: 'shopeepay',    label: 'ShopeePay',    desc: 'Bayar via ShopeePay',     feeType: 'pct' },
  { code: 'bni_va',       label: 'BNI VA',       desc: 'Virtual Account BNI',     feeType: 'flat' },
  { code: 'bri_va',       label: 'BRI VA',       desc: 'Virtual Account BRI',     feeType: 'flat' },
  { code: 'permata_va',   label: 'Permata VA',   desc: 'Virtual Account Permata', feeType: 'flat' },
  { code: 'cimb_niaga_va',label: 'CIMB VA',      desc: 'Virtual Account CIMB',    feeType: 'flat' },
]

const calcFee = (amount, feeType) => {
  if (feeType === 'pct') return Math.ceil(amount * 0.007) + 400
  return 6500
}

const calcTotal = (amount, feeType) => amount + calcFee(amount, feeType)

function detectOperator(phone) {
  const cleaned = phone.replace(/\D/g, '')
  const normalized = cleaned.startsWith('62') ? '0' + cleaned.slice(2) : cleaned
  for (const entry of PREFIX_MAP) {
    if (entry.prefix.some((p) => normalized.startsWith(p))) {
      return { operator: entry.operator, sid_prefix: entry.sid_prefix, normalized }
    }
  }
  return { operator: null, sid_prefix: null, normalized }
}

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(num) || 0)

const OPERATOR_COLORS = {
  Telkomsel: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  Indosat:   'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  XL:        'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  Axis:      'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  Smartfren: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
  Three:     'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
}

export default function BeliCepat() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [detected, setDetected] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [activeCategory, setActiveCategory] = useState('pulsa')
  const [selected, setSelected] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [buying, setBuying] = useState(false)
  const [buyingStep, setBuyingStep] = useState('')
  const [showModal, setShowModal] = useState(false)
  const debounceRef = useRef(null)

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await api.get('/apiarie/layanan')
      setProducts(res.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const cleaned = phone.replace(/\D/g, '')
      const normalized = cleaned.startsWith('62') ? '0' + cleaned.slice(2) : cleaned
      if (normalized.length >= 10) {
        setDetected(detectOperator(phone))
        setSelected(null)
        setPaymentMethod(null)
        setActiveCategory('pulsa')
      } else {
        setDetected(null)
        setSelected(null)
        setPaymentMethod(null)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [phone])

  const operatorProducts = useMemo(() => {
    if (!detected?.sid_prefix || !products.length) return []
    return products.filter((p) => {
      const sid = String(p.sid ?? '').toUpperCase()
      const op  = String(p.operator ?? '').toUpperCase()
      const prefix = detected.sid_prefix.toUpperCase()
      const opUpper = detected.operator?.toUpperCase() ?? ''
      const statusOk = ['normal', 'aktif', 'active'].includes(String(p.status ?? '').toLowerCase())
      return statusOk && (sid.startsWith(prefix) || op === opUpper || op.startsWith(opUpper))
    })
  }, [products, detected])

  const categories = useMemo(() => {
    const seen = new Set()
    operatorProducts.forEach((p) => {
      const cat = String(p.tipe ?? p.type ?? p.kategori ?? '').toLowerCase().trim()
      if (cat) seen.add(cat)
    })
    return Array.from(seen)
  }, [operatorProducts])

  const filteredProducts = useMemo(() => {
    return operatorProducts
      .filter((p) => String(p.tipe ?? p.type ?? p.kategori ?? '').toLowerCase().trim() === activeCategory)
      .sort((a, b) => Number(a.harga) - Number(b.harga))
  }, [operatorProducts, activeCategory])

  const handleConfirm = async () => {
    if (!selected || !paymentMethod || !detected?.normalized) return
    setBuying(true)
    setBuyingStep('Memproses')
    try {
      const saldoRes = await api.get('/apiarie/saldo')
      const saldo = Number(saldoRes.data?.saldo ?? 0)
      if (saldo < Number(selected.harga)) {
        toast.error(`Saldo API Pulsa tidak mencukupi. Saldo: ${formatRupiah(saldo)}, dibutuhkan: ${formatRupiah(selected.harga)}`)
        setShowModal(false)
        setBuying(false)
        setBuyingStep('')
        return
      }
    } catch {
      toast.error('Gagal mengecek saldo API')
      setShowModal(false)
      setBuying(false)
      setBuyingStep('')
      return
    }

    setBuyingStep('Membuat pembayaran...')
    const method = PAYMENT_METHODS.find((m) => m.code === paymentMethod)
    const totalAmount = calcTotal(Number(selected.harga), method.feeType)
    try {
      const reference = 'PULSA-' + Date.now()
      const res = await api.post('/payment/create', {
        amount: totalAmount,
        payment_type: paymentMethod,
        customer_name: detected.normalized,
        description: `Pulsa ${detected.operator || ''} ${selected.layanan} → ${detected.normalized}`,
        reference,
      })
      setShowModal(false)
      navigate(`/admin/payment/${res.data.transaction.id}`, {
        state: {
          transaction: res.data.transaction,
          payment: res.data.payment,
          order: {
            phone: detected.normalized,
            operator: detected.operator,
            product: selected.layanan,
            harga_arie: Number(selected.harga),
            fee: calcFee(Number(selected.harga), method.feeType),
            amount: totalAmount,
          },
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      setShowModal(false)
    } finally {
      setBuying(false)
      setBuyingStep('')
    }
  }

  const openModal = () => { if (selected && paymentMethod) setShowModal(true) }
  const closeModal = () => { if (!buying) setShowModal(false) }

  const operatorColor = detected?.operator
    ? (OPERATOR_COLORS[detected.operator] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')
    : ''
  const selectedMethod = PAYMENT_METHODS.find((m) => m.code === paymentMethod)
  const totalBayar = selected && selectedMethod
    ? calcTotal(Number(selected.harga), selectedMethod.feeType)
    : 0
  const feeAmount = selected && selectedMethod
    ? calcFee(Number(selected.harga), selectedMethod.feeType)
    : 0

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Beli Cepat</h1>
        </div>

        {/* Input Nomor */}
        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Tujuan</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-300/50" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-blue-900/40 rounded-xl bg-white dark:bg-[#0a0f1e] text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {detected && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-blue-300/60">Operator terdeteksi:</span>
              {detected.operator
                ? <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${operatorColor}`}>{detected.operator}</span>
                : <span className="text-xs text-red-500 dark:text-red-400">Tidak dikenali</span>
              }
            </div>
          )}
        </div>

        {/* Produk dari Arie */}
        {detected?.operator && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Produk {detected.operator}</h2>
              <button
                onClick={fetchProducts}
                disabled={loadingProducts}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-blue-300/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={loadingProducts ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {!loadingProducts && categories.length > 0 && (
              <div className="flex gap-1.5 px-4 pt-3 pb-1 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelected(null); setPaymentMethod(null) }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-blue-900/20 text-gray-600 dark:text-blue-300 hover:bg-gray-200 dark:hover:bg-blue-900/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {loadingProducts ? (
              <div className="p-8 text-center text-gray-400 dark:text-blue-300/50 text-sm flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Memuat produk...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-blue-300/50 text-sm">
                Tidak ada produk aktif untuk {detected.operator}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
                {filteredProducts.map((p) => {
                  const isActive = selected?.sid === p.sid
                  return (
                    <button
                      key={p.sid}
                      onClick={() => { setSelected(isActive ? null : p); setPaymentMethod(null) }}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                          : 'border-gray-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-blue-900/10'
                      }`}
                    >
                      <p className="text-xs text-gray-500 dark:text-blue-300/60 font-mono">{p.sid}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 leading-tight">{p.layanan}</p>
                      <p className={`text-sm font-bold mt-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {formatRupiah(p.harga)}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Metode Pembayaran */}
        {selected && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30 flex items-center gap-2">
              <CreditCard size={14} className="text-gray-400 dark:text-blue-300/50" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Metode Pembayaran</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-4">
              {PAYMENT_METHODS.map((m) => {
                const isActive = paymentMethod === m.code
                const fee = calcFee(Number(selected.harga), m.feeType)
                const total = Number(selected.harga) + fee
                return (
                  <button
                    key={m.code}
                    onClick={() => setPaymentMethod(isActive ? null : m.code)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                        : 'border-gray-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-blue-900/10'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-blue-300/50 mt-0.5">{m.desc}</p>
                    <p className="text-xs text-gray-400 dark:text-blue-300/40 mt-1">Fee: {formatRupiah(fee)}</p>
                    <p className={`text-sm font-bold mt-1.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {formatRupiah(total)}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="px-4 pb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-blue-300/50">Dipilih</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{selected.layanan}</p>
                <p className="text-xs text-gray-400 dark:text-blue-300/50 mt-0.5">{detected?.normalized}</p>
              </div>
              <button
                onClick={openModal}
                disabled={!paymentMethod}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Zap size={14} />
                Beli Sekarang
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi */}
      {showModal && selected && detected && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1526] rounded-2xl shadow-2xl border border-gray-100 dark:border-blue-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-blue-900/30">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Konfirmasi Pesanan</h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-blue-900/30 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="bg-gray-50 dark:bg-blue-950/40 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Nomor Tujuan</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{detected.normalized}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Operator</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${operatorColor}`}>{detected.operator}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Produk</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[55%]">{selected.layanan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Harga Pulsa</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatRupiah(selected.harga)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Metode Bayar</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedMethod.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-blue-300/50">Fee</span>
                  <span className="text-xs text-gray-500 dark:text-blue-300/60">{formatRupiah(feeAmount)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-blue-900/30 pt-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-blue-300/60">Total Bayar</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatRupiah(totalBayar)}</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={closeModal}
                disabled={buying}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-blue-900/40 text-sm font-medium text-gray-600 dark:text-blue-200 hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={buying}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {buying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {buying ? buyingStep : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
