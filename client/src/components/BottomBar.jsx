import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingCart, History, Wallet, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function BottomBar() {
  const location = useLocation()
  const { user } = useAuthStore()

  if (user?.role === 'admin') return null

  const menuItems = [
    { icon: Home, label: 'Home', to: '/dashboard' },
    { icon: ShoppingCart, label: 'Beli', to: '/topup' },
    { icon: History, label: 'Riwayat', to: '/transactions' },
    { icon: Wallet, label: 'Saldo', to: '/wallet' },
  ]

  const left = menuItems.slice(0, 2)
  const right = menuItems.slice(2)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-3">
      <div className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-blue-900/40 rounded-2xl shadow-xl shadow-black/20 flex items-center px-2 py-1">

        {left.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-blue-300/60'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}

        <div className="flex-shrink-0 mx-1">
          <Link
            to="/topup"
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 transition-colors"
            aria-label="Deposit"
          >
            <Plus size={22} className="text-white" />
          </Link>
        </div>

        {right.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-blue-300/60'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}

      </div>
    </nav>
  )
}
