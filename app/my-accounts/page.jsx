'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userAPI, default as api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatMoney, formatDate, Spinner } from '@/components/common';
import toast from 'react-hot-toast';
import { 
  FiEye, FiCalendar, FiPlus, FiInbox, 
  FiEdit, FiTrash2, FiEyeOff, FiCheck, FiShoppingBag, FiInfo
} from 'react-icons/fi';
import { GiJoystick } from 'react-icons/gi';

export default function MyAccountsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchListings = () => {
    setLoading(true);
    userAPI.getMyAccounts()
      .then(res => {
        const rawListings = res.data.listings || [];
        const sorted = [...rawListings].sort((a, b) => b.id - a.id);
        setListings(sorted);
      })
      .catch(err => {
        toast.error('Lỗi khi tải danh sách tin đăng');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/accounts/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tin đăng này không?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Xoá tin đăng thành công');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xoá tin đăng');
    }
  };

  if (loading) return <Spinner />;

  const statuses = [
    { key: 'ALL', label: 'Tất cả', count: listings.length },
    { key: 'SHOWING', label: 'Đang hiển thị', count: listings.filter(l => l.status === 'SHOWING').length, color: 'var(--success)' },
    { key: 'PENDING_APPROVAL', label: 'Chờ duyệt', count: listings.filter(l => l.status === 'PENDING_APPROVAL').length, color: 'var(--gold)' },
    { key: 'REJECTED', label: 'Bị từ chối', count: listings.filter(l => l.status === 'REJECTED').length, color: 'var(--danger)' },
    { key: 'SOLD', label: 'Đã bán', count: listings.filter(l => l.status === 'SOLD').length, color: 'var(--primary)' },
    { key: 'HIDDEN', label: 'Đã ẩn', count: listings.filter(l => l.status === 'HIDDEN').length, color: 'var(--text-muted)' }
  ];

  const filteredListings = activeTab === 'ALL' 
    ? listings 
    : listings.filter(l => l.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHOWING':
        return <span className="badge badge-success" style={{ fontSize: 11, padding: '4px 10px' }}>Đang hiển thị</span>;
      case 'PENDING_APPROVAL':
        return <span className="badge badge-warning" style={{ fontSize: 11, padding: '4px 10px' }}>Chờ duyệt</span>;
      case 'REJECTED':
        return <span className="badge badge-danger" style={{ fontSize: 11, padding: '4px 10px' }}>Bị từ chối</span>;
      case 'SOLD':
        return <span className="badge badge-primary" style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>Đã bán</span>;
      case 'HIDDEN':
        return <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Đã ẩn</span>;
      case 'EXPIRED':
        return <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Hết hạn</span>;
      case 'PENDING_PAYMENT':
        return <span className="badge badge-danger" style={{ fontSize: 11, padding: '4px 10px' }}>Cần thanh toán</span>;
      case 'DRAFT':
        return <span className="badge" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Tin nháp</span>;
      default:
        return <span className="badge" style={{ fontSize: 11, padding: '4px 10px' }}>{status}</span>;
    }
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 1140 }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontSize: 28, fontWeight: 800 }}>
              <GiJoystick style={{ color: 'var(--primary)' }} /> Quản Lý Tin Đăng
            </h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Xem trạng thái, sửa đổi, ẩn hoặc đánh dấu đã bán đối với các tin đăng của bạn.
            </p>
          </div>
          <Link href="/sell" className="btn btn-primary" style={{ gap: 8, borderRadius: 'var(--radius)', padding: '10px 18px', fontWeight: 600 }}>
            <FiPlus /> Đăng Tin Mới
          </Link>
        </div>

        {/* Tab List */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          paddingBottom: 8, 
          marginBottom: 28,
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'thin'
        }}>
          {statuses.map(s => {
            const isActive = activeTab === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveTab(s.key)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 'var(--radius) var(--radius) 0 0'
                }}
              >
                {s.label}
                <span style={{
                  fontSize: 11,
                  background: isActive ? 'var(--primary)' : 'var(--bg-input)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: 50,
                  fontWeight: 700
                }}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Info Alert on Fee Logic */}
        <div className="card" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          padding: '12px 18px', 
          marginBottom: 24, 
          background: 'rgba(59,130,246,0.06)', 
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 'var(--radius)'
        }}>
          <FiInfo size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>Thông tin phí đăng bài:</strong> Phí đăng bài sẽ trừ trực tiếp vào số dư ví của bạn. Trong trường hợp admin <strong>từ chối duyệt</strong> tin đăng, số tiền phí này sẽ được <strong>hoàn trả 100%</strong> vào tài khoản của bạn.
          </p>
        </div>

        {/* Listings Container */}
        {filteredListings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 48, marginBottom: 12, color: 'var(--text-muted)' }}><FiInbox /></div>
            <p style={{ margin: '0 0 16px 0', fontSize: 14 }}>Không tìm thấy tin đăng nào trong mục này.</p>
            <Link href="/sell" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8, margin: '0 auto', borderRadius: 'var(--radius)' }}>
              <FiPlus /> Đăng bán tài khoản ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredListings.map(acc => {
              const parsedImages = acc.images ? (Array.isArray(acc.images) ? acc.images : JSON.parse(acc.images)) : [];
              const coverImg = parsedImages.length > 0 ? parsedImages[0] : '/image.png';

              return (
                <div 
                  key={acc.id} 
                  className="card" 
                  style={{ 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '20px', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    {/* Left Info Column */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 280 }}>
                      <div style={{ width: 100, height: 75, flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={coverImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>ID: #{acc.id}</span>
                          <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px' }}>{acc.category_name}</span>
                          {getStatusBadge(acc.status)}
                        </div>

                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{acc.title}</h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiEye size={13} /> {acc.view_count || 0} lượt xem</span>
                          {acc.created_at && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={13} /> {formatDate(acc.created_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions Column */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 24, 
                      justifyContent: 'space-between', 
                      minWidth: 320, 
                      flexWrap: 'wrap' 
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Giá bán</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary)' }}>{formatMoney(acc.price)}</div>
                      </div>
                      
                      {/* Action buttons list */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {/* Detail link */}
                        <Link 
                          href={`/accounts/${acc.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12 }}
                        >
                          Xem chi tiết
                        </Link>

                        {/* Edit listing */}
                        {(acc.status === 'SHOWING' || acc.status === 'PENDING_APPROVAL' || acc.status === 'REJECTED' || acc.status === 'HIDDEN') && (
                          <button
                            onClick={() => router.push(`/sell?edit=${acc.id}`)}
                            className="btn btn-outline btn-sm"
                            style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12, borderColor: 'var(--gold)', color: 'var(--gold)' }}
                          >
                            <FiEdit size={13} /> Sửa
                          </button>
                        )}

                        {/* Toggle visibility (Hide/Show) */}
                        {acc.status === 'SHOWING' && (
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'HIDDEN')}
                            className="btn btn-outline btn-sm"
                            style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12 }}
                          >
                            <FiEyeOff size={13} /> Ẩn tin
                          </button>
                        )}
                        {acc.status === 'HIDDEN' && (
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'SHOWING')}
                            className="btn btn-outline btn-sm"
                            style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12, borderColor: 'var(--success)', color: 'var(--success)' }}
                          >
                            <FiEye size={13} /> Hiện tin
                          </button>
                        )}

                        {/* Mark as sold */}
                        {acc.status === 'SHOWING' && (
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'SOLD')}
                            className="btn btn-primary btn-sm"
                            style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12 }}
                          >
                            <FiCheck size={13} /> Đã bán
                          </button>
                        )}

                        {/* Delete listing */}
                        {(acc.status === 'PENDING_APPROVAL' || acc.status === 'REJECTED' || acc.status === 'SOLD' || acc.status === 'HIDDEN') && (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="btn btn-outline btn-sm"
                            style={{ gap: 6, borderRadius: 'var(--radius)', height: 36, padding: '0 12px', fontSize: 12, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          >
                            <FiTrash2 size={13} /> Xoá
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
