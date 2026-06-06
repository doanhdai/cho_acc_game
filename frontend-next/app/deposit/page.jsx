'use client';

import React, { useState } from 'react';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatMoney } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiInfo, FiDollarSign } from 'react-icons/fi';

export default function DepositPageClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ amount: '', method: 'vietqr', transaction_ref: '', note: '' });
  const [loading, setLoading] = useState(false);

  const quickAmounts = [20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

  const formatNumber = (num) => {
    if (!num) return '';
    const str = num.toString().replace(/\D/g, '');
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setForm({ ...form, amount: rawVal });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;
    if (!form.amount || parseInt(form.amount) < 10000) { 
      toast.error('Số tiền tối thiểu 10,000đ'); 
      return; 
    }
    setLoading(true);
    try {
      const res = await userAPI.createDeposit(form);
      if (res.data.success && res.data.checkoutUrl) {
        toast.success('Đang chuyển hướng đến cổng thanh toán PayOS...');
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error(res.data.message || 'Lỗi khi tạo mã thanh toán');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-page" style={{ padding: '60px 0', background: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Maintenance Modal Overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
        <div style={{ background: 'var(--bg-card)', padding: '36px 32px', borderRadius: 'var(--radius-lg)', maxWidth: 420, width: '90%', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <FiInfo size={54} style={{ color: 'var(--primary)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Tạm Ngừng Nạp Tiền</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Hệ thống nạp tiền tự động hiện đang được bảo trì để nâng cấp trải nghiệm. Bạn chưa thể nạp tiền vào lúc này. Xin lỗi vì sự bất tiện!
          </p>
          <button onClick={() => router.push('/')} style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}>
            Về Trang Chủ
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 540, width: '100%', padding: '0 16px' }}>
        <div className="card" style={{ padding: '32px 28px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              <FiDollarSign style={{ color: 'var(--primary)' }} /> Nạp Tiền Tài Khoản
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
              Cổng thanh toán tự động VietQR (PayOS) - Duyệt 24/7 trong 1-3 giây
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 4, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span>Số dư hiện tại:</span>
            <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 16 }}>{formatMoney(user?.balance)}</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                Chọn hoặc nhập số tiền cần nạp (đ)
              </label>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input className="form-control" type="text" value={formatNumber(form.amount)} onChange={handleAmountChange} placeholder="Nhập số tiền (VNĐ)"
                  style={{ fontSize: 20, fontWeight: 700, padding: '12px 16px 12px 36px', borderRadius: 4, height: 'auto', color: 'var(--gold)', background: 'var(--bg-input)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>đ</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {quickAmounts.map(a => (
                  <button key={a} type="button" onClick={() => setForm({...form, amount: a})}
                    style={{ background: form.amount === a ? 'var(--primary)' : 'var(--bg-input)', border: '1px solid var(--border)', color: form.amount === a ? '#fff' : 'var(--text-secondary)', padding: '10px 4px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12, transition: 'all 0.15s ease' }}
                  >
                    {a.toLocaleString().replace(/,/g, '.')}đ
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', padding: 14, borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--text-primary)' }}>
                <FiInfo style={{ color: 'var(--primary)' }} /> Hướng dẫn nhanh:
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Nhập số tiền mong muốn (Tối thiểu 10.000đ).</li>
                <li>Hệ thống sẽ tạo mã QR động tích hợp sẵn thông tin chuyển khoản.</li>
                <li>Thực hiện quét mã chuyển khoản thành công, tài khoản sẽ được cộng tiền tự động lập tức.</li>
              </ul>
            </div>

            <button type="submit" disabled={loading || !form.amount}
              style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {loading ? 'Đang tạo QR thanh toán...' : 'Tiến hành thanh toán ngay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
