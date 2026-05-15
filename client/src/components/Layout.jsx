import { useState } from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'
import { Menu } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#060b18]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen md:ml-[288px]">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0a0f1e] border-b border-gray-200 dark:border-blue-900/30 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-500 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-gray-900 dark:text-white">PulsaKu</span>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <BottomBar />
    </div>
  )
}
