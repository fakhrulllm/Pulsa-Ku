import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { RefreshCw, Search } from 'lucide-react'

const statusClass = (status) => {
  const s = String(status ?? '').toLowerCase().trim()
  if (s === 'normal' || s === 'aktif' || s === 'active') return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
  return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
}

const statusLabel = (status) => {
  const s = String(status ?? '').toLowerCase().trim()
  if (s === 'normal' || s === 'aktif' || s === 'active') return 'Aktif'
  return 'Tidak Aktif'
}

export default function Layanan() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchLayanan = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/apiarie/layanan')
      const all = res.data.data || []
      const pulsa = all.filter((item) =>
        String(item.tipe ?? item.type ?? item.kategori ?? '').toLowerCase() === 'pulsa'
      )
      setData(pulsa)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLayanan() }, [])

  const filtered = useMemo(() => {
    if (!search) return data
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(num) || 0)

  const COLUMNS = [
    { key: 'sid', label: 'SID' },
    { key: 'operator', label: 'Provider' },
    { key: 'layanan', label: 'Layanan' },
    { key: 'harga', label: 'Harga' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Layanan Pulsa</h1>
            <p className="text-sm text-gray-500 dark:text-blue-300/60 mt-0.5">Daftar produk pulsa dari ariepulsa.com</p>
          </div>
          <button
            onClick={fetchLayanan}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-blue-900/40 text-gray-600 dark:text-blue-200 hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-blue-300/50">
            {loading ? 'Memuat...' : `${filtered.length} produk${search ? ` dari ${data.length} total` : ''}`}
          </p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-300/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 dark:border-blue-900/40 rounded-xl bg-white dark:bg-[#0d1526] text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
          {error ? (
            <div className="p-10 text-center text-red-500 dark:text-red-400 text-sm">{error}</div>
          ) : loading ? (
            <div className="p-10 text-center text-gray-400 dark:text-blue-300/50 text-sm">Memuat data layanan...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 dark:text-blue-300/50 text-sm">Tidak ada produk pulsa ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-blue-950/40 border-b border-gray-100 dark:border-blue-900/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-blue-300/60 uppercase tracking-wide w-10">#</th>
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-blue-300/60 uppercase tracking-wide whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-blue-900/20">
                  {filtered.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-3 text-gray-400 dark:text-blue-300/40 text-xs">{i + 1}</td>
                      {COLUMNS.map((col) => {
                        const val = item[col.key]
                        const isPrice = col.key === 'harga'
                        const isStatus = col.key === 'status'
                        return (
                          <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                            {isStatus ? (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(val)}`}>
                                {statusLabel(val)}
                              </span>
                            ) : isPrice ? (
                              <span className="font-semibold text-gray-900 dark:text-gray-200">{formatRupiah(val)}</span>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-200">{val ?? '-'}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
