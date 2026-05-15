import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { CheckCircle, Inbox } from 'lucide-react'

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.patch(`/withdraw/${id}/approve`)
      toast.success('Penarikan disetujui!')
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w))
      )
    } catch {
      toast.error('Gagal menyetujui penarikan')
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Kelola Penarikan Saldo</h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Memuat...</div>
          ) : withdrawals.length === 0 ? (
            <div className="p-10 text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle size={40} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-400 dark:text-gray-500">Tidak ada permintaan penarikan</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      {['Seller', 'Bank', 'Rekening', 'Nominal', 'Status', 'Aksi'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{w.user_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{w.bank_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{w.bank_account}</td>
                        <td className="px-6 py-4 text-sm font-semibold dark:text-gray-200">{formatRupiah(w.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            w.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {w.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(w.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800">
                {withdrawals.map((w) => (
                  <div key={w.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{w.user_id}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        w.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{w.bank_name} · {w.bank_account}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatRupiah(w.amount)}</p>
                      {w.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(w.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
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
