import Layout from '../../components/Layout'
import { useAuthStore } from '../../store/authStore'
import { UserCog } from 'lucide-react'

export default function Profile() {
  const { user } = useAuthStore()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Edit Profil</h1>

        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-400 dark:text-blue-300/60 capitalize">{user?.role}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm">
            <UserCog size={16} />
            <span>Fitur edit profil segera hadir</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
