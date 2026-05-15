import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { Inbox, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_name: '', bank_account: '' })

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, historyRes] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/wallet/history'),
        ])
        setBalance(walletRes.data.balance || 0)
        setHistory(historyRes.data)
      } catch {
        toast.error('Gagal memuat wallet')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleWithdraw = async (e) => {
    e.preventDefault()
    try {
      await api.post('/withdraw/request', {
        ...withdrawForm,
        amount: Number(withdrawForm.amount),
      })
      toast.success('Permintaan penarikan berhasil dikirim!')
      setShowWithdraw(false)
      setWithdrawForm({ amount: '', bank_name: '', bank_account: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan penarikan')
    }
  }

  const inputClass = 'w-full border border-gray-200 dark:border-blue-900/40 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-blue-950/40 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30'
  const labelClass = 'text-sm font-medium text-gray-700 dark:text-blue-200 mb-1 block'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Wallet Saya</h1>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <p className="text-blue-200 text-sm mb-2">Saldo Tersedia</p>
          <p className="text-3xl md:text-4xl font-bold mb-6">
            {loading ? '...' : formatRupiah(balance)}
          </p>
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="bg-white text-blue-600 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            Tarik Saldo
          </button>
        </div>

        {showWithdraw && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-5 md:p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Form Penarikan Saldo</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label htmlFor="withdraw-amount" className={labelClass}>Jumlah Penarikan</label>
                <input
                  id="withdraw-amount"
                  name="amount"
                  type="number"
                  placeholder="Minimal Rp 50.000"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="withdraw-bank" className={labelClass}>Nama Bank</label>
                <select
                  id="withdraw-bank"
                  name="bank_name"
                  value={withdrawForm.bank_name}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Pilih Bank</option>
                  {['BCA', 'BNI', 'BRI', 'Mandiri', 'BSI', 'DANA', 'OVO', 'GoPay'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="withdraw-account" className={labelClass}>Nomor Rekening / Akun</label>
                <input
                  id="withdraw-account"
                  name="bank_account"
                  type="text"
                  placeholder="Masukkan nomor rekening"
                  value={withdrawForm.bank_account}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_account: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Ajukan Penarikan
                </button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 border border-gray-200 dark:border-blue-900/40 text-gray-700 dark:text-blue-200 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-blue-900/30">
            <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Saldo</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 dark:text-blue-300/50">Memuat...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center">
              <div className="flex justify-center mb-3">
                <Inbox size={40} className="text-gray-300 dark:text-blue-900/60" />
              </div>
              <p className="text-gray-400 dark:text-blue-300/50">Belum ada riwayat saldo</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-blue-900/20">
              {history.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-5 md:px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${log.type === 'credit' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      {log.type === 'credit'
                        ? <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
                        : <ArrowDownLeft size={16} className="text-red-500 dark:text-red-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{log.description}</p>
                      <p className="text-xs text-gray-400 dark:text-blue-300/50">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <p className={`font-semibold text-sm shrink-0 ml-3 ${log.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {log.type === 'credit' ? '+' : '-'}{formatRupiah(log.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
