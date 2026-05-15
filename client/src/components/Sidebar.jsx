import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ShoppingCart, History, Wallet, Users, LogOut, Zap, X, Sun, Moon, UserCog, FlaskConical, LayoutList, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

export default function Sidebar({ open, setOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()

  const sellerMenu = [
    { icon: Home, label: 'Dashboard', to: '/dashboard' },
    { icon: ShoppingCart, label: 'Beli Pulsa', to: '/topup' },
    { icon: History, label: 'Riwayat', to: '/transactions' },
    { icon: Wallet, label: 'Saldo', to: '/wallet' },
    { icon: UserCog, label: 'Edit Profil', to: '/profile' },
  ]

  const adminMenu = [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'Penarikan', to: '/admin/withdrawals' },
    { icon: ShoppingBag, label: 'Beli Cepat', to: '/admin/beli-cepat' },
    { icon: LayoutList, label: 'Layanan', to: '/admin/layanan' },
    { icon: FlaskConical, label: 'Test API', to: '/admin/test-api' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenu : sellerMenu

  const handleLogout = () => {
    logout()
    toast.success('Logout berhasil')
    navigate('/login')
  }

  const close = () => setOpen?.(false)

  const sidebarBg = dark ? 'bg-[#0a0f1e] border-blue-900/40' : 'bg-white border-gray-200'
  const logoBorder = dark ? 'border-blue-900/50' : 'border-gray-100'
  const logoText = dark ? 'text-white' : 'text-gray-900'
  const logoSub = dark ? 'text-blue-300' : 'text-gray-400'
  const linkActive = 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
  const linkInactive = dark
    ? 'text-blue-200 hover:bg-blue-900/40 hover:text-white'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  const footerBorder = dark ? 'border-blue-900/50' : 'border-gray-100'
  const userName = dark ? 'text-white' : 'text-gray-900'
  const userRole = dark ? 'text-blue-300' : 'text-gray-400'
  const toggleBtn = dark
    ? 'text-blue-200 hover:bg-blue-900/40 hover:text-white'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  const closeBtn = dark
    ? 'text-blue-300 hover:text-white hover:bg-blue-900/40'
    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
  const logoutBtn = dark
    ? 'text-blue-300 hover:text-red-400 hover:bg-red-900/20'
    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'

  const sidebarInner = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                isActive ? linkActive : linkInactive
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t ${footerBorder} space-y-1 shrink-0`}>
        <button
          onClick={toggle}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${toggleBtn}`}
        >
          {dark
            ? <Sun size={17} className="text-yellow-400 shrink-0" />
            : <Moon size={17} className="shrink-0" />
          }
          <span>{dark ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${userName}`}>{user?.name}</p>
            <p className={`text-xs capitalize ${userRole}`}>{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${logoutBtn}`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )

  const logoBar = (showClose = false) => (
    <div className={`p-5 border-b ${logoBorder} shrink-0`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className={`text-base font-bold ${logoText}`}>PulsaKu</h1>
            <p className={`text-xs ${logoSub}`}>Jual Beli Pulsa</p>
          </div>
        </div>
        {showClose && (
          <button onClick={close} className={`p-1.5 rounded-lg transition-colors ${closeBtn}`}>
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop floating sidebar */}
      <aside className={`hidden md:flex w-64 flex-col fixed left-4 top-4 bottom-4 z-30 rounded-2xl shadow-xl border ${sidebarBg} transition-colors duration-200`}>
        {logoBar(false)}
        {sidebarInner}
      </aside>

      {/* Mobile overlay */}
      <div
        onClick={close}
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile floating drawer */}
      <aside
        className={`md:hidden fixed top-4 left-4 bottom-4 w-64 z-50 flex flex-col rounded-2xl shadow-2xl shadow-black/50 border transition-transform duration-300 ease-in-out ${sidebarBg} ${
          open ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
        }`}
      >
        {logoBar(true)}
        <div className="flex flex-col flex-1 overflow-hidden">
          {sidebarInner}
        </div>
      </aside>
    </>
  )
}
