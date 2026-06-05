import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { Spinner } from './components/common';

import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import TopDepositPage from './pages/public/TopDepositPage';
import { LoginPage, RegisterPage } from './pages/public/AuthPage';

import AccountDetailPage from './pages/user/AccountDetailPage';
import DepositPage from './pages/user/DepositPage';
import { HistoryPage } from './pages/user/HistoryPage';
import MyAccountsPage from './pages/user/MyAccountsPage';
import ProfilePage from './pages/user/ProfilePage';
import SellPage from './pages/user/SellPage';
import OrderRoomPage from './pages/user/OrderRoomPage';

import {
  AdminDashboard, AdminAccounts, AdminSkins, AdminOrders, AdminOrderRoom,
  AdminDeposits, AdminHistory, AdminRevenue,
  AdminUsers, AdminCategories, AdminLayout, AdminSettings
} from './pages/admin/AdminPages';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
      <Route path="/top-deposit" element={<MainLayout><TopDepositPage /></MainLayout>} />
      <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
      <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />

      {/* Account Details (Optional Auth for censoring) */}
      <Route path="/accounts/:id" element={<MainLayout><AccountDetailPage /></MainLayout>} />

      {/* User Dashboard Pages */}
      <Route path="/deposit" element={<PrivateRoute><MainLayout><DepositPage /></MainLayout></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><MainLayout><HistoryPage /></MainLayout></PrivateRoute>} />
      <Route path="/my-accounts" element={<PrivateRoute><MainLayout><MyAccountsPage /></MainLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
      <Route path="/sell" element={<PrivateRoute><MainLayout><SellPage /></MainLayout></PrivateRoute>} />
      <Route path="/orders/middleman/:id" element={<PrivateRoute><MainLayout><OrderRoomPage /></MainLayout></PrivateRoute>} />

      {/* Admin Dashboard Pages */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/accounts" element={<AdminRoute><AdminLayout><AdminAccounts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
      <Route path="/admin/skins" element={<AdminRoute><AdminLayout><AdminSkins /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders/:id" element={<AdminRoute><AdminLayout><AdminOrderRoom /></AdminLayout></AdminRoute>} />
      <Route path="/admin/deposits" element={<AdminRoute><AdminLayout><AdminDeposits /></AdminLayout></AdminRoute>} />
      <Route path="/admin/history" element={<AdminRoute><AdminLayout><AdminHistory /></AdminLayout></AdminRoute>} />
      <Route path="/admin/revenue" element={<AdminRoute><AdminLayout><AdminRevenue /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--bg-card2)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
