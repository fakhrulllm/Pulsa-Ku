import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Users, ClipboardList, Banknote, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Monitor semua aktivitas platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {[
            { label: 'Total Seller', value: '—', icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Total Transaksi', value: '—', icon: ClipboardList, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Pending Withdraw', value: '—', icon: Banknote, bg: 'bg-orange-50 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${s.bg} rounded-lg`}>
                    <Icon size={16} className={s.color} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <Link
            to="/admin/withdrawals"
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-500 transition-colors"
          >
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl w-fit mb-3">
              <Banknote size={22} className="text-orange-600 dark:text-orange-400" />
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Kelola Penarikan</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Approve atau tolak request penarikan saldo seller</p>
          </Link>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl w-fit mb-3">
              <BarChart3 size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Laporan</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Coming soon...</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
