export default function StatCard({ title, value, change, changeType, icon: Icon, iconClass }) {
  return (
    <div className="bg-white dark:bg-[#0d1526] rounded-xl shadow-sm border border-gray-100 dark:border-blue-900/30 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-gray-500 dark:text-blue-300/60 text-xs md:text-sm font-medium leading-tight">{title}</h3>
        <div className={`p-2 md:p-2.5 rounded-xl shrink-0 ${iconClass}`}>
          <Icon size={16} className="md:w-5 md:h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
        {change && (
          <p className={`text-xs font-medium ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change} dari bulan lalu
          </p>
        )}
      </div>
    </div>
  )
}
