'use client';
import React, { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { Spinner, formatMoney, formatDate, StatusBadge } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link'; import { useRouter } from 'next/navigation';
import { 
  FiCopy, FiList, FiDollarSign, FiArrowLeft, FiInbox, FiCreditCard, 
  FiKey, FiLock, FiMail, FiMessageSquare, FiExternalLink, FiShield,
  FiPlus, FiEye, FiCalendar, FiCheckCircle, FiClock, FiTag
} from 'react-icons/fi';
import { GiJoystick } from 'react-icons/gi';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [data, setData] = useState({ transactions: [], deposits: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('transactions');

  useEffect(() => {
    Promise.all([
      userAPI.getHistory({ limit: 50 }),
      userAPI.getDeposits()
    ]).then(([historyRes, depositsRes]) => {
      setData({
        transactions: historyRes.data.data,
        deposits: depositsRes.data.data
      });
    }).catch(err => {
      toast.error('Lỗi tải dữ liệu ví');
    }).finally(() => setLoading(false));
  }, []);

  const typeLabel = { 
    DEPOSIT: [<FiDollarSign size={14} />, 'Nạp thủ công', 'badge-success'], 
    NAP_AUTO: [<FiDollarSign size={14} />, 'Nạp tự động (VietQR)', 'badge-success'], 
    REFUND: [<FiArrowLeft size={14} />, 'Hoàn tiền', 'badge-success'],
    MIDDLEMAN_DEPOSIT: [<FiLock size={14} />, 'Tạm khóa ví (Mua acc)', 'badge-danger'],
    MIDDLEMAN_RELEASE: [<FiDollarSign size={14} />, 'Nhận tiền bán acc (Escrow)', 'badge-success'],
    LISTING_FEE: [<FiList size={14} />, 'Phí treo bài', 'badge-warning'],
    POST_FEE: [<FiTag size={14} />, 'Phí đăng tin', 'badge-warning']
  };
  
  if (loading) return <Spinner />;

  return (
    <div className="page-container" style={{ background: 'var(--bg-body)' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiList style={{ color: 'var(--primary)' }} /> Lịch Sử Giao Dịch & Ví Tiền
        </h1>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          <button 
            onClick={() => setTab('transactions')}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border)',
              borderBottom: tab === 'transactions' ? '3px solid var(--danger)' : '1px solid var(--border)',
              background: tab === 'transactions' ? 'var(--bg-card)' : 'var(--bg-input)',
              color: tab === 'transactions' ? 'var(--danger)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: 'none'
            }}
          >
            Lịch Sử Biến Động Số Dư ({data.transactions.length})
          </button>
          <button 
            onClick={() => setTab('deposits')}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border)',
              borderBottom: tab === 'deposits' ? '3px solid var(--danger)' : '1px solid var(--border)',
              background: tab === 'deposits' ? 'var(--bg-card)' : 'var(--bg-input)',
              color: tab === 'deposits' ? 'var(--danger)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: 'none'
            }}
          >
            Lịch Sử Nạp Tiền ({data.deposits.length})
          </button>
        </div>

        {tab === 'transactions' && (
          data.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><FiInbox /></div>
              <p>Chưa có biến động số dư nào</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Loại giao dịch</th><th>Mô tả chi tiết</th><th>Số tiền</th><th>Số dư trước</th><th>Số dư sau</th><th>Thời gian</th></tr></thead>
                  <tbody>
                    {data.transactions.map(t => {
                      const [icon, label, cls] = typeLabel[t.type] || [<FiDollarSign size={14} />, t.type, ''];
                      const isCredit = ['DEPOSIT', 'REFUND', 'MIDDLEMAN_RELEASE', 'NAP_AUTO'].includes(t.type);
                      return (
                        <tr key={t.id}>
                          <td><span className={`badge ${cls}`} style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>{icon} {label}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.description}</td>
                          <td style={{ fontWeight: 600, color: isCredit ? 'var(--success)' : 'var(--danger)' }}>{isCredit ? '+' : '-'}{formatMoney(t.amount)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatMoney(t.balance_before)}</td>
                          <td style={{ fontWeight: 700 }}>{formatMoney(t.balance_after)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(t.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {tab === 'deposits' && (
          data.deposits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><FiCreditCard /></div>
              <p>Chưa có lịch sử nạp tiền nào</p>
            </div>
          ) : (
             <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Mã giao dịch</th><th>Hình thức nạp</th><th>Số tiền</th><th>Trạng thái</th><th>Ghi chú</th><th>Thời gian</th></tr></thead>
                  <tbody>
                    {data.deposits.map(d => {
                      return (
                        <tr key={d.id}>
                          <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{d.transaction_ref || `#NP${d.id}`}</td>
                          <td style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 800 }}>
                             {d.method === 'VietQR' ? <span style={{color: 'var(--primary)'}}>VietQR Auto</span> : d.method === 'momo' ? <span style={{color: '#ec4899'}}>MOMO</span> : 'CHUYỂN KHOẢN'}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{formatMoney(d.amount)}</td>
                          <td><StatusBadge status={d.status} /></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{d.note || '-'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(d.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
