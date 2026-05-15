import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { Inbox } from 'lucide-react'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  const statusColor = (status) => {
    if (status === 'success') return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
    if (status === 'pending') return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
    return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
  }

  useEffect(() => {
    api.get('/transactions')
      .then((res) => setTransactions(res.data))
      .catch(() => toast.error('Gagal memuat transaksi'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Riwayat Transaksi</h1>

        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 dark:text-blue-300/50">Memuat...</div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="flex justify-center mb-3">
                <Inbox size={40} className="text-gray-300 dark:text-blue-900/60" />
              </div>
              <p className="text-gray-400 dark:text-blue-300/50">Belum ada transaksi</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-blue-950/40 border-b border-gray-100 dark:border-blue-900/30">
                    <tr>
                      {['No. HP', 'Produk', 'Nominal', 'Status', 'Tanggal'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-blue-300/60 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-blue-900/20">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{tx.phone_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-blue-300/60">{tx.product_code}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-200">{formatRupiah(tx.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-blue-300/60">
                          {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-gray-100 dark:divide-blue-900/20">
                {transactions.map((tx) => (
                  <div key={tx.id} className="px-4 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{tx.phone_number}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-blue-300/50">{tx.product_code} · {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{formatRupiah(tx.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
