import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import SellerDashboard from './pages/seller/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import Topup from './pages/seller/Topup'
import Wallet from './pages/seller/Wallet'
import Transactions from './pages/seller/Transactions'
import Profile from './pages/seller/Profile'
import Withdrawals from './pages/admin/Withdrawals'
import TestAPI from './pages/admin/testAPI'
import Layanan from './pages/admin/Layanan'
import BeliCepat from './pages/admin/BeliCepat'
import PaymentPage from './pages/admin/PaymentPage'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const { dark } = useThemeStore()

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute role="seller" />}>
            <Route path="/dashboard" element={<SellerDashboard />} />
            <Route path="/topup" element={<Topup />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/withdrawals" element={<Withdrawals />} />
            <Route path="/admin/test-api" element={<TestAPI />} />
            <Route path="/admin/layanan" element={<Layanan />} />
            <Route path="/admin/beli-cepat" element={<BeliCepat />} />
            <Route path="/admin/payment/:transactionId" element={<PaymentPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
