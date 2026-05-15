import { useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { Play, Trash2, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react'

const INTERNAL_ENDPOINTS = [
  { label: 'Ping Server', method: 'GET', url: '/apiarie/ping', group: 'Debug' },
  { label: 'GET /auth/me', method: 'GET', url: '/auth/me', group: 'Auth' },
  { label: 'GET /wallet/balance', method: 'GET', url: '/wallet/balance', group: 'Wallet' },
  { label: 'GET /wallet/history', method: 'GET', url: '/wallet/history', group: 'Wallet' },
  { label: 'GET /transactions', method: 'GET', url: '/transactions', group: 'Transaksi' },
]

const PULSA_ACTIONS = [
  { label: 'Daftar Layanan', action: 'layanan', desc: 'Ambil semua produk tersedia' },
  { label: 'Cek Saldo', action: 'saldo', desc: 'Cek saldo deposit' },
  { label: 'Cek Status Transaksi', action: 'status', desc: 'Butuh param: id_trx' },
]

function methodBadge(method) {
  const map = {
    GET: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    POST: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    PATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  }
  return map[method] || 'bg-gray-100 dark:bg-blue-900/20 text-gray-600 dark:text-blue-300'
}

export default function TestAPI() {
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(null)
  const [customAction, setCustomAction] = useState('layanan')
  const [extraParams, setExtraParams] = useState('')

  const addLog = (entry) => setLogs((prev) => [entry, ...prev])

  const runInternal = async (ep) => {
    setRunning(ep.url)
    const start = Date.now()
    try {
      const res = await api({ method: ep.method, url: ep.url })
      addLog({
        id: Date.now(), label: ep.label, method: ep.method, url: ep.url,
        status: res.status, ok: true, ms: Date.now() - start,
        data: res.data, time: new Date().toLocaleTimeString('id-ID'),
      })
    } catch (err) {
      addLog({
        id: Date.now(), label: ep.label, method: ep.method, url: ep.url,
        status: err.response?.status ?? 0, ok: false, ms: Date.now() - start,
        data: err.response?.data ?? { message: err.message },
        time: new Date().toLocaleTimeString('id-ID'),
      })
    }
    setRunning(null)
  }

  const runPulsa = async (action, extra = {}) => {
    const key = `pulsa:${action}`
    setRunning(key)
    const start = Date.now()
    try {
      const params = { action, ...extra }
      const res = await api.get('/apiarie/pulsa', { params })
      addLog({
        id: Date.now(), label: `Pulsa API: ${action}`, method: 'GET',
        url: `ariepulsa.com?action=${action}`,
        status: res.status, ok: true, ms: Date.now() - start,
        data: res.data, time: new Date().toLocaleTimeString('id-ID'),
      })
    } catch (err) {
      addLog({
        id: Date.now(), label: `Pulsa API: ${action}`, method: 'GET',
        url: `ariepulsa.com?action=${action}`,
        status: err.response?.status ?? 0, ok: false, ms: Date.now() - start,
        data: err.response?.data ?? { message: err.message },
        time: new Date().toLocaleTimeString('id-ID'),
      })
    }
    setRunning(null)
  }

  const runCustomPulsa = () => {
    let extra = {}
    if (extraParams.trim()) {
      try {
        extra = Object.fromEntries(
          extraParams.split('&').map((p) => p.split('=').map((s) => s.trim()))
        )
      } catch {
        extra = {}
      }
    }
    runPulsa(customAction, extra)
  }

  const runAll = async () => {
    for (const ep of INTERNAL_ENDPOINTS) await runInternal(ep)
    for (const a of PULSA_ACTIONS) await runPulsa(a.action)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Test API</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-blue-900/40 text-gray-600 dark:text-blue-200 hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Trash2 size={14} />
              Clear Log
            </button>
            <button
              onClick={runAll}
              disabled={!!running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: endpoint panels */}
          <div className="space-y-4">
            {/* Internal API */}
            <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Internal API</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-blue-900/20">
                {INTERNAL_ENDPOINTS.map((ep) => (
                  <div key={ep.url} className="flex items-center justify-between px-5 py-3 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${methodBadge(ep.method)}`}>{ep.method}</span>
                        <span className="text-xs text-gray-400 dark:text-blue-300/50">{ep.group}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{ep.url}</p>
                    </div>
                    <button
                      onClick={() => runInternal(ep)}
                      disabled={!!running}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {running === ep.url ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      Test
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pulsa API */}
            <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pulsa API (ariepulsa.com)</h2>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-blue-900/20">
                {PULSA_ACTIONS.map((a) => (
                  <div key={a.action} className="flex items-center justify-between px-5 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{a.label}</p>
                      <p className="text-xs text-gray-400 dark:text-blue-300/50">{a.desc}</p>
                    </div>
                    <button
                      onClick={() => runPulsa(a.action)}
                      disabled={!!running}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                    >
                      {running === `pulsa:${a.action}` ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      Test
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom action */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-blue-900/30 space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-blue-300/60 uppercase tracking-wide">Custom Request</p>
                <div className="flex gap-2">
                  <input
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    placeholder="action"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-blue-900/40 rounded-lg bg-gray-50 dark:bg-blue-950/40 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={runCustomPulsa}
                    disabled={!!running || !customAction}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                  >
                    {running === `pulsa:${customAction}` ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    Run
                  </button>
                </div>
                <input
                  value={extraParams}
                  onChange={(e) => setExtraParams(e.target.value)}
                  placeholder="Extra params: key=value&key2=value2"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-blue-900/40 rounded-lg bg-gray-50 dark:bg-blue-950/40 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right: log panel */}
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Log</h2>
              <span className="text-xs text-gray-400 dark:text-blue-300/50">{logs.length} entri</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-blue-300/40 text-sm">
                  Belum ada log. Jalankan test dulu.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-blue-900/20">
                  {logs.map((log) => (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {log.ok
                          ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          : <XCircle size={14} className="text-red-500 shrink-0" />
                        }
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${methodBadge(log.method)}`}>{log.method}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate flex-1">{log.url}</span>
                        <span className={`text-xs font-semibold shrink-0 ${log.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {log.status}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-blue-300/40 shrink-0">{log.ms}ms</span>
                      </div>
                      <pre className="text-[11px] text-gray-500 dark:text-blue-300/50 bg-gray-50 dark:bg-blue-950/40 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-48">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                      <p className="text-[10px] text-gray-400 dark:text-blue-300/30 mt-1">{log.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
