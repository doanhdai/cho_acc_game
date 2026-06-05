import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import { Spinner, formatMoney, formatDate, StatusBadge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCopy, FiList, FiDollarSign, FiArrowLeft, FiInbox, FiCreditCard, 
  FiKey, FiLock, FiMail, FiMessageSquare, FiExternalLink, FiShield,
  FiPlus, FiEye, FiCalendar, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { GiJoystick } from 'react-icons/gi';
import toast from 'react-hot-toast';

export function HistoryPage() {
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
    DEPOSIT: [<FiDollarSign />, 'Nạp thủ công', 'badge-success'], 
    NAP_AUTO: [<FiDollarSign />, 'Nạp tự động (VietQR)', 'badge-success'], 
    REFUND: [<FiArrowLeft />, 'Hoàn tiền', 'badge-success'],
    MIDDLEMAN_DEPOSIT: [<FiLock />, 'Tạm khóa ví (Mua acc)', 'badge-danger'],
    MIDDLEMAN_RELEASE: [<FiDollarSign />, 'Nhận tiền bán acc (Escrow)', 'badge-success'],
    LISTING_FEE: [<FiList />, 'Phí treo bài', 'badge-warning']
  };
  
  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '40px 0', background: 'var(--bg-body)' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiList style={{ color: 'var(--primary)' }} /> Lịch Sử Giao Dịch & Ví Tiền
        </h1>
        <div className="tabs" style={{ marginBottom: 28 }}>
          <button className={`tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>Lịch Sử Biến Động Số Dư ({data.transactions.length})</button>
          <button className={`tab ${tab === 'deposits' ? 'active' : ''}`} onClick={() => setTab('deposits')}>Lịch Sử Nạp Tiền ({data.deposits.length})</button>
        </div>

        {tab === 'transactions' && (
          data.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><FiInbox /></div>
              <p>Chưa có biến động số dư nào</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Loại giao dịch</th><th>Mô tả chi tiết</th><th>Số tiền</th><th>Số dư trước</th><th>Số dư sau</th><th>Thời gian</th></tr></thead>
                  <tbody>
                    {data.transactions.map(t => {
                      const [icon, label, cls] = typeLabel[t.type] || [<FiDollarSign />, t.type, ''];
                      const isCredit = ['DEPOSIT', 'REFUND', 'MIDDLEMAN_RELEASE', 'NAP_AUTO'].includes(t.type);
                      return (
                        <tr key={t.id}>
                          <td><span className={`badge ${cls}`} style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>{icon} {label}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.description}</td>
                          <td style={{ fontWeight: 800, color: isCredit ? 'var(--success)' : 'var(--danger)' }}>{isCredit ? '+' : '-'}{formatMoney(t.amount)}</td>
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
             <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
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
                          <td style={{ fontWeight: 800, color: 'var(--gold)' }}>{formatMoney(d.amount)}</td>
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
