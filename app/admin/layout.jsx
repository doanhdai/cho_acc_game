'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/common';
import { AdminLayout } from '@/components/admin/AdminPages';

export default function AdminRootLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) return <Spinner />;
  if (!user || user.role !== 'admin') return null;

  return <AdminLayout>{children}</AdminLayout>;
}
