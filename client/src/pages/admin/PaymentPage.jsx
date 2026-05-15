import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { CheckCircle2, XCircle, Loader2, Copy, Clock, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(num) || 0)

const formatCountdown = (ms) => {
  if (ms <= 0) return '00:00'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/40',
  },
  settled: {
    label: 'Pembayaran Berhasil',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/40',
  },
  failed: {
    label: 'Pembayaran Gagal',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/40',
  },
}

export default function PaymentPage() {
  const { transactionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(state?.transaction || null)
  const [payment, setPayment] = useState(state?.payment || null)
  const [status, setStatus] = useState(state?.transaction?.status || 'pending')
  const [countdown, setCountdown] = useState(0)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)

  const order = state?.order || {}

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/payment/status/${transactionId}`)
      const txn = res.data.transaction
      setTransaction(txn)
      setStatus(txn.status)
      if (txn.status !== 'pending') {
        clearInterval(pollRef.current)
      }
    } catch {
    }
  }

  useEffect(() => {
    if (!transaction && transactionId) fetchStatus()
  }, [])

  useEffect(() => {
    if (status !== 'pending') return
    pollRef.current = setInterval(fetchStatus, 5000)
    return () => clearInterval(pollRef.current)
  }, [status, transactionId])

  useEffect(() => {
    if (!payment?.expired_at) return
    const update = () => {
      const diff = new Date(payment.expired_at).getTime() - Date.now()
      setCountdown(Math.max(0, diff))
      if (diff <= 0) {
        clearInterval(countdownRef.current)
        clearInterval(pollRef.current)
        fetchStatus()
      }
    }
    update()
    countdownRef.current = setInterval(update, 1000)
    return () => clearInterval(countdownRef.current)
  }, [payment?.expired_at])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Disalin!')
  }

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const isQris = ['qris', 'gopay', 'shopeepay'].includes(payment?.payment_type)
  const isGopay = payment?.payment_type === 'gopay'
  const isShopeepay = payment?.payment_type === 'shopeepay'

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/beli-cepat')}
            className="p-2 rounded-xl border border-gray-200 dark:border-blue-900/40 text-gray-500 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Halaman Pembayaran</h1>
            <p className="text-xs text-gray-400 dark:text-blue-300/50 font-mono mt-0.5 truncate max-w-xs">{transactionId}</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${statusCfg.bg}`}>
          {status === 'pending' && <Loader2 size={18} className={`animate-spin shrink-0 ${statusCfg.color}`} />}
          {status === 'settled' && <CheckCircle2 size={18} className={`shrink-0 ${statusCfg.color}`} />}
          {status === 'failed' && <XCircle size={18} className={`shrink-0 ${statusCfg.color}`} />}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${statusCfg.color}`}>{statusCfg.label}</p>
            {status === 'pending' && payment?.expired_at && (
              <p className="text-xs text-gray-500 dark:text-blue-300/50 mt-0.5 flex items-center gap-1">
                <Clock size={11} />
                Berakhir dalam <span className="font-mono font-semibold ml-1">{formatCountdown(countdown)}</span>
              </p>
            )}
          </div>
          {status === 'pending' && (
            <button onClick={fetchStatus} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        {/* Detail Pesanan */}
        <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-blue-900/30">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Detail Pesanan</h2>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            {order.phone && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Nomor Tujuan</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{order.phone}</span>
              </div>
            )}
            {order.operator && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Operator</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{order.operator}</span>
              </div>
            )}
            {order.product && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Produk</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[55%]">{order.product}</span>
              </div>
            )}
            {order.harga_arie != null && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Harga Pulsa</span>
                <span className="text-gray-700 dark:text-gray-300">{formatRupiah(order.harga_arie)}</span>
              </div>
            )}
            {payment?.payment_type && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Metode</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 uppercase">{payment.payment_type.replace(/_/g, ' ')}</span>
              </div>
            )}
            {order.fee != null && (
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-blue-300/50">Fee</span>
                <span className="text-gray-500 dark:text-blue-300/60">{formatRupiah(transaction.fee)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-blue-900/30 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 dark:text-blue-300/60">Total Bayar</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatRupiah(payment?.total_payment || order.amount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* VA Number */}
        {payment?.va_number && !isQris && status === 'pending' && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Nomor Virtual Account</h2>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-blue-950/40 rounded-xl px-4 py-3">
              <span className="flex-1 text-xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-widest">
                {payment.va_number}
              </span>
              <button
                onClick={() => copyToClipboard(payment.va_number)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-blue-300/50">
              Transfer tepat sesuai nominal. Pembayaran dikonfirmasi otomatis.
            </p>
          </div>
        )}

        {/* QRIS */}
        {isQris && payment?.qr_string && status === 'pending' && !isGopay && !isShopeepay && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">QR Code Pembayaran</h2>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payment.qr_string)}`}
                alt="QRIS"
                className="w-56 h-56 rounded-xl border border-gray-200 dark:border-blue-900/30"
              />
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-blue-300/50">
              Scan QR Code menggunakan aplikasi e-wallet atau mobile banking.
            </p>
          </div>
        )}

        {/* GoPay / ShopeePay deeplink */}
        {(isGopay || isShopeepay) && payment?.deeplink_url && status === 'pending' && (
          <div className="bg-white dark:bg-[#0d1526] rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Bayar via {isGopay ? 'GoPay' : 'ShopeePay'}
            </h2>
            <a
              href={payment.deeplink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            >
              Buka Aplikasi {isGopay ? 'GoPay' : 'ShopeePay'}
            </a>
            <p className="text-xs text-center text-gray-400 dark:text-blue-300/50">
              Klik tombol di atas untuk membuka aplikasi dan menyelesaikan pembayaran.
            </p>
          </div>
        )}

        {/* Settled */}
        {status === 'settled' && (
          <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-900/40 p-5 text-center space-y-2">
            <CheckCircle2 size={32} className="text-green-500 mx-auto" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Pembayaran diterima!</p>
            <p className="text-xs text-green-600 dark:text-green-500">
              Pulsa {order.product} akan segera dikirim ke {order.phone}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/admin/beli-cepat')}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          {status === 'pending' ? 'Kembali' : 'Beli Lagi'}
        </button>
      </div>
    </Layout>
  )
}
