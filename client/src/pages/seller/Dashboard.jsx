import { useEffect, useState } from 'react'
import { Wallet, ShoppingBag, TrendingUp, Users, User } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { id: 'telkomsel', name: 'Telkomsel', color: 'bg-red-500' },
  { id: 'indosat', name: 'Indosat', color: 'bg-yellow-500' },
  { id: 'xl', name: 'XL', color: 'bg-blue-500' },
  { id: 'tri', name: 'Tri', color: 'bg-purple-500' },
  { id: 'smartfren', name: 'Smartfren', color: 'bg-pink-500' },
  { id: 'axis', name: 'Axis', color: 'bg-indigo-500' },
]

const DENOMINATIONS = [
  { value: 5000, price: 5500 },
  { value: 10000, price: 10500 },
  { value: 20000, price: 20500 },
  { value: 25000, price: 25500 },
  { value: 50000, price: 51000 },
  { value: 100000, price: 101500 },
]

const RECENT_TRANSACTIONS = [
  { id: 1, phone: '0812-3456-7890', provider: 'Telkomsel', amount: 'Rp 50.000', time: '5 menit lalu', status: 'success' },
  { id: 2, phone: '0857-8901-2345', provider: 'Indosat', amount: 'Rp 25.000', time: '15 menit lalu', status: 'success' },
  { id: 3, phone: '0878-9012-3456', provider: 'XL', amount: 'Rp 100.000', time: '30 menit lalu', status: 'pending' },
  { id: 4, phone: '0895-6789-0123', provider: 'Tri', amount: 'Rp 10.000', time: '1 jam lalu', status: 'failed' },
  { id: 5, phone: '0813-4567-8901', provider: 'Telkomsel', amount: 'Rp 20.000', time: '2 jam lalu', status: 'success' },
]

const statusConfig = {
  success: { label: 'Berhasil', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  pending: { label: 'Proses', class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  failed: { label: 'Gagal', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
}

export default function SellerDashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedDenom, setSelectedDenom] = useState(null)

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletRes = await api.get('/wallet/balance')
        setBalance(walletRes.data.balance || 0)
      } catch {
        toast.error('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTambahKeranjang = () => {
    if (!phone) return toast.error('Masukkan nomor HP dulu')
    if (!selectedProvider) return toast.error('Pilih provider dulu')
    if (!selectedDenom) return toast.error('Pilih nominal dulu')
    toast.success(`${selectedProvider} ${formatRupiah(selectedDenom.value)} ke ${phone} ditambahkan!`)
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Penjualan</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Selamat datang kembali, {user?.name}!</p>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
              <User size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-blue-300/60 mb-0.5">Halo,</p>
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center shrink-0">
              <Wallet size={22} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-blue-300/60 mb-0.5">Saldo Anda</p>
              <h2 className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : formatRupiah(balance)}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-5 md:p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">BELI CEPAT</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1.5">Nomor Telepon</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-blue-900/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-blue-950/40 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1.5">Pilih Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p.name)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${selectedProvider === p.name
                      ? `${p.color} text-white ring-2 ring-offset-1 dark:ring-offset-[#0d1526] ring-blue-400`
                      : `${p.color} text-white opacity-60 hover:opacity-100`
                      }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-blue-200 mb-1.5">Pilih Nominal</label>
              <div className="grid grid-cols-2 gap-2">
                {DENOMINATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDenom(d)}
                    className={`py-2 px-3 rounded-lg text-left transition-all border-2 ${selectedDenom?.value === d.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-blue-900/40 hover:border-blue-300 dark:bg-blue-950/20'
                      }`}
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-200">{formatRupiah(d.value)}</p>
                    <p className="text-xs text-gray-400 dark:text-blue-300/50">{formatRupiah(d.price)}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleTambahKeranjang}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Tambah ke Keranjang
            </button>
          </div>
          </div>

          {/* Pengumuman */}
          <div className="bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-5 flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Pengumuman</h3>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {[
                { title: 'Maintenance Sistem', desc: 'Sistem akan maintenance pada 15 Mei 2026 pukul 00.00–02.00 WIB.', date: '10 Mei 2026', type: 'warning' },
                { title: 'Promo Ramadan', desc: 'Dapatkan cashback 5% untuk setiap transaksi pulsa di atas Rp 50.000.', date: '8 Mei 2026', type: 'info' },
                { title: 'Fitur Baru: Topup DANA', desc: 'Kini tersedia metode pembayaran via DANA untuk topup saldo.', date: '5 Mei 2026', type: 'success' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border text-sm ${
                  item.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                    : item.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                    : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'
                }`}>
                  <p className={`font-semibold mb-0.5 ${
                    item.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400'
                    : item.type === 'success' ? 'text-green-700 dark:text-green-400'
                    : 'text-blue-700 dark:text-blue-400'
                  }`}>{item.title}</p>
                  <p className="text-gray-600 dark:text-blue-300/60 text-xs leading-relaxed">{item.desc}</p>
                  <p className="text-gray-400 dark:text-blue-300/40 text-xs mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-5">
          <StatCard title="Transaksi Hari Ini" value="156" changeType="positive" icon={ShoppingBag} iconClass="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" />
          <StatCard title="Pendapatan" value="Rp 8,3 Jt" changeType="positive" icon={TrendingUp} iconClass="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" />
        </div>

        {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Top E-Money</h3>
                <span className="text-xs text-gray-400">7 Hari Terakhir</span>
              </div>
              <div className="space-y-4">
                {TOP_EMONEY.map((emoney, index) => (
                  <div key={emoney.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">{index + 1}</div>
                    <div className={`w-9 h-9 rounded-xl ${emoney.color} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-xs">{emoney.name.substring(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{emoney.name}</p>
                      <p className="text-xs text-gray-400">{emoney.transactions.toLocaleString('id-ID')} transaksi</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">{emoney.revenue}</p>
                      <div className={`flex items-center justify-end gap-1 text-xs ${emoney.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {emoney.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span>{Math.abs(emoney.change)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</span>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Rp 54.310.000</span>
              </div>
            </div>

          
        </div> */}

        <div className="bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-5 md:p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Transaksi Terbaru</h3>
          <div className="space-y-1">
            {RECENT_TRANSACTIONS.map((tx) => {
              const status = statusConfig[tx.status]
              const providerColor = PROVIDERS.find(p => p.name === tx.provider)?.color || 'bg-gray-400'
              return (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-blue-900/20 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${providerColor} flex items-center justify-center shrink-0`}>
                      <span className="text-xs font-bold text-white">{tx.provider.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.phone}</p>
                      <p className="text-xs text-gray-400 dark:text-blue-300/50 truncate">{tx.provider} · {tx.amount}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-gray-400 dark:text-blue-300/50 mb-1 hidden sm:block">{tx.time}</p>
                    <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </Layout>
  )
}
