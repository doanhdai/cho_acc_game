'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { adminAPI, orderAPI, accountAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner, formatMoney, formatDate, StatusBadge, Pagination } from '@/components/common';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { FiGrid, FiShoppingBag, FiBox, FiCreditCard, FiClock, FiTrendingUp, FiUsers, FiDollarSign, FiDownload, FiMonitor, FiAward, FiBarChart2, FiPlus, FiCheck, FiX, FiList, FiEdit2, FiTrash2, FiCalendar, FiFileText, FiTag, FiMessageSquare, FiSend, FiLock, FiUnlock, FiAlertTriangle, FiLayers, FiSettings, FiUploadCloud, FiEye, FiEyeOff, FiRefreshCw, FiKey } from 'react-icons/fi';

const formatNumberString = (val) => {
  if (val === null || val === undefined) return '';
  const clean = val.toString().replace(/\D/g, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

function AdminSidebar() {
  const pathname = usePathname();
  const links = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
    { to: '/admin/accounts', icon: <FiShoppingBag />, label: 'QL Acc Game' },
    { to: '/admin/categories', icon: <FiLayers />, label: 'Danh Mục Game' },
    { to: '/admin/skins', icon: <FiTag />, label: 'Cấu Hình Skin' },
    { to: '/admin/orders', icon: <FiClock />, label: 'Phòng Giao Dịch' },
    { to: '/admin/history', icon: <FiList />, label: 'Lịch Sử Ví' },
    { to: '/admin/revenue', icon: <FiTrendingUp />, label: 'Doanh Thu' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Quản Lý Users' },
    { to: '/admin/settings', icon: <FiSettings />, label: 'Cấu Hình Hệ Thống' },
  ];

  const isActive = (to, exact) => exact ? pathname === to : pathname.startsWith(to);

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--bg-card)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: '1px solid var(--border)',
      boxShadow: '2px 0 12px rgba(0,0,0,0.06)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0
          }}>A</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-primary)', letterSpacing: 0.5 }}>AdminPortal</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>Bản điều khiển</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map(l => {
          const active = isActive(l.to, l.exact);
          return (
            <Link key={l.to} href={l.to} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              background: active ? 'var(--primary-glow)' : 'transparent',
              fontWeight: active ? 700 : 500,
              fontSize: 13.5,
              textDecoration: 'none',
              transition: 'all 0.15s',
              position: 'relative'
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-dark)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <span style={{ fontSize: 16, color: active ? 'var(--primary)' : 'var(--text-muted)' }}>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8,
          color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <FiGrid size={15} /> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminAPI.getRevenue().then(res => setData(res.data.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;

  const stats = [
    { icon: <FiDollarSign size={22} />, label: 'Tổng Doanh Thu', value: formatMoney(data.totalRevenue), sub: `Escrow: ${formatMoney(data.orderRevenue)}`, color: '#f59e0b', bg: '#fef3c7' },
    { icon: <FiDownload size={22} />, label: 'Tổng Tiền Nạp', value: formatMoney(data.totalDeposits), sub: `Chờ duyệt: ${data.pendingDeposits.count} yêu cầu`, color: '#10b981', bg: '#d1fae5' },
    { icon: <FiUsers size={22} />, label: 'Tổng Users', value: data.totalUsers, sub: 'Thành viên đã đăng ký', color: '#6c63ff', bg: '#ede9fe' },
    { icon: <FiBox size={22} />, label: 'Tổng Acc', value: data.totalAccounts.total, sub: `Còn bán: ${data.totalAccounts.available} acc`, color: '#3b82f6', bg: '#dbeafe' },
  ];
  const chartData = (data.monthly || []).reverse().map(m => ({ month: m.month, revenue: parseFloat(m.revenue) || 0, orders: m.orders }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiBarChart2 style={{ color: 'var(--primary)' }} /> Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.2, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Chart + Top Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Chart */}
        {chartData.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, margin: 0 }}>
                <FiTrendingUp style={{ color: 'var(--primary)' }} /> Doanh Thu Theo Tháng
              </h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Xu hướng năm {new Date().getFullYear()}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-8} tickFormatter={v => {
                  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace('.0', '')}M`;
                  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
                  return v;
                }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow)',
                    fontSize: 13
                  }}
                  formatter={(value) => [formatMoney(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#dashboardGrad)" strokeWidth={3} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Users */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <FiAward style={{ color: '#f59e0b' }} /> Top Nạp Nhiều Nhất
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.topUsers?.slice(0, 8).map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 'var(--radius)', background: i < 3 ? ['rgba(255,215,0,0.08)', 'rgba(192,192,192,0.08)', 'rgba(205,127,50,0.08)'][i] : 'transparent' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < 3 ? '#000' : 'var(--text-muted)', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || u.username}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>{formatMoney(u.total_deposited)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getFirstImage = (imgStr) => {
  if (!imgStr) return null;
  try {
    const arr = Array.isArray(imgStr) ? imgStr : JSON.parse(imgStr);
    return arr.length > 0 ? arr[0] : null;
  } catch(e) { return null; }
};

export function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', username: '', password: '', email_acc: '', email_pass: '', server: '', level: '', rank_level: '', champions_count: '', skins_count: '', security_status: 'TRANG_THONG_THIN', price: '', original_price: '', images: [] });
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    adminAPI.getAccounts({ 
      page, 
      limit: 20, 
      status: statusFilter || undefined, 
      category: catFilter || undefined, 
      search: search || undefined 
    })
      .then(res => {
        setAccounts(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    load(); 
  }, [page, statusFilter, catFilter, search]);

  useEffect(() => {
    accountAPI.getCategories().then(r => setCategories(r.data.data));
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ category_id: '', title: '', description: '', username: '', password: '', email_acc: '', email_pass: '', server: '', level: '', rank_level: '', champions_count: '', skins_count: '', security_status: 'TRANG_THONG_THIN', price: '', original_price: '', images: [] });
    setShowForm(true);
  };

  const handleEdit = (acc) => {
    let parsedImages = [];
    try {
      parsedImages = acc.images ? (Array.isArray(acc.images) ? acc.images : JSON.parse(acc.images)) : [];
    } catch (e) {
      console.error(e);
    }
    setEditItem(acc);
    setForm({
      category_id: acc.category_id || '',
      title: acc.title || '',
      description: acc.description || '',
      username: acc.username || '',
      password: acc.password || '',
      email_acc: acc.email_acc || '',
      email_pass: acc.email_pass || '',
      server: acc.server || '',
      level: acc.level !== null && acc.level !== undefined ? acc.level : '',
      rank_level: acc.rank_level || '',
      champions_count: acc.champions_count !== null && acc.champions_count !== undefined ? acc.champions_count : '',
      skins_count: acc.skins_count !== null && acc.skins_count !== undefined ? acc.skins_count : '',
      security_status: acc.security_status || 'TRANG_THONG_THIN',
      price: acc.price ? formatNumberString(acc.price) : '',
      original_price: acc.original_price ? formatNumberString(acc.original_price) : '',
      images: parsedImages
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { 
        ...form, 
        level: form.level ? parseInt(form.level) : null,
        champions_count: form.champions_count ? parseInt(form.champions_count) : 0,
        skins_count: form.skins_count ? parseInt(form.skins_count) : 0,
        price: parseInt(form.price.toString().replace(/\./g, '')) || 0, 
        original_price: form.original_price ? (parseInt(form.original_price.toString().replace(/\./g, '')) || null) : null 
      };
      if (editItem) {
        await adminAPI.updateAccount(editItem.id, payload);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await adminAPI.createAccount(payload);
        toast.success('Thêm tài khoản thành công');
      }
      setShowForm(false);
      setEditItem(null);
      load();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Lỗi'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleStatusChange = async (id, status) => {
    await adminAPI.updateAccount(id, { status });
    toast.success('Cập nhật trạng thái'); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await adminAPI.deleteAccount(id);
      toast.success('Đã xóa tài khoản');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa tài khoản');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><FiMonitor style={{ color: 'var(--primary)' }} /> Quản Lý Acc Game</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm Acc Mới</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <FiMonitor style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm tên acc, người bán..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          <option value="SHOWING">Đang bán</option>
          <option value="PENDING_APPROVAL">Chờ duyệt</option>
          <option value="HIDDEN">Đã ẩn</option>
          <option value="SOLD">Đã bán</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: 140 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả game</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{total} kết quả</span>
      </div>
      {loading ? <Spinner /> : (
        <>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th style={{ width: 60 }}>Ảnh</th><th>Tên Acc</th><th>Game</th><th>Người bán</th><th>Giá</th><th>Trạng Thái</th><th>Hành Động</th></tr></thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{acc.id}</td>
                      <td>
                        {getFirstImage(acc.images) ? (
                           <img src={getFirstImage(acc.images)} alt="Acc" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                        ) : (
                           <div style={{ width: 48, height: 36, background: 'var(--bg-input)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)' }}>-</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{acc.title}</td>
                      <td><span className="badge badge-primary">{acc.category_name}</span></td>
                      <td style={{ fontSize: 13 }}>{acc.seller_name}</td>
                      <td className="price">{formatMoney(acc.price)}</td>
                      <td><StatusBadge status={acc.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(acc)} title="Sửa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}><FiEdit2 size={14} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(acc.id)} title="Xóa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}><FiTrash2 size={14} /></button>
                          {acc.status === 'SHOWING' && <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => handleStatusChange(acc.id, 'HIDDEN')} title="Ẩn tin"><FiEyeOff size={14} /></button>}
                          {acc.status === 'HIDDEN' && <button className="btn btn-sm btn-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => handleStatusChange(acc.id, 'SHOWING')} title="Hiện tin"><FiEye size={14} /></button>}
                          {acc.status === 'PENDING_APPROVAL' && (
                            <>
                              <button className="btn btn-sm btn-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => handleStatusChange(acc.id, 'SHOWING')} title="Duyệt đăng tin"><FiCheck size={14} /></button>
                              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => handleStatusChange(acc.id, 'REJECTED')} title="Từ chối đăng tin"><FiX size={14} /></button>
                            </>
                          )}
                          {acc.status === 'REJECTED' && (
                            <button className="btn btn-sm btn-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => handleStatusChange(acc.id, 'SHOWING')} title="Duyệt lại"><FiRefreshCw size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editItem ? <><FiEdit2 /> Cập Nhật Acc Game</> : <><FiPlus /> Thêm Acc Mới</>}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Tiêu đề *</label>
                  <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Game *</label>
                  <select className="form-control" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                    <option value="">Chọn game</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rank</label>
                  <input className="form-control" value={form.rank_level} onChange={e => setForm({...form, rank_level: e.target.value})} placeholder="Cao Thủ" />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá bán (đ) *</label>
                  <input className="form-control" type="text" value={form.price} onChange={e => setForm({...form, price: formatNumberString(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá gốc (đ)</label>
                  <input className="form-control" type="text" value={form.original_price} onChange={e => setForm({...form, original_price: formatNumberString(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tướng</label>
                  <input className="form-control" type="number" value={form.champions_count} onChange={e => setForm({...form, champions_count: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số skin</label>
                  <input className="form-control" type="number" value={form.skins_count} onChange={e => setForm({...form, skins_count: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">URL Ảnh (mỗi dòng 1 URL)</label>
                  <textarea className="form-control" rows={2} value={Array.isArray(form.images) ? form.images.join('\n') : ''} onChange={e => setForm({...form, images: e.target.value.split('\n').filter(l => l.trim())})} placeholder="https://..." />
                </div>

                {/* Credentials & Security Section */}
                <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thông Tin Tài Khoản & Bảo Mật</h4>
                </div>
                <div className="form-group">
                  <label className="form-label">Tài khoản Game</label>
                  <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Tên đăng nhập game" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu Game</label>
                  <input className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mật khẩu game" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email liên kết</label>
                  <input className="form-control" value={form.email_acc} onChange={e => setForm({...form, email_acc: e.target.value})} placeholder="abc@gmail.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu Email</label>
                  <input className="form-control" value={form.email_pass} onChange={e => setForm({...form, email_pass: e.target.value})} placeholder="Mật khẩu email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Máy chủ (Server)</label>
                  <input className="form-control" value={form.server} onChange={e => setForm({...form, server: e.target.value})} placeholder="VD: Mặt Trời" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái Bảo mật</label>
                  <select className="form-control" value={form.security_status} onChange={e => setForm({...form, security_status: e.target.value})}>
                    <option value="TRANG_THONG_THIN">Trắng thông tin</option>
                    <option value="DINH_THONG_THIN">Dính thông tin (Có SĐT/Mail)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Acc'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSkins() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ champion_name: '', skin_name: '', image_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleSkinImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const toastId = toast.loading('Đang tải ảnh skin lên Cloudflare R2...');
    try {
      const res = await accountAPI.uploadImage(file);
      if (res.data.success) {
        setForm(prev => ({ ...prev, image_url: res.data.url }));
        toast.success('Tải ảnh skin thành công!', { id: toastId });
      } else {
        toast.error(res.data.message || 'Tải ảnh thất bại', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const load = () => {
    setLoading(true);
    adminAPI.getSkins({ page, limit: 20, search: search || undefined })
      .then(res => {
        const normalized = (res.data.data || []).map(s => ({
          ...s,
          champion_name: s.championName !== undefined ? s.championName : s.champion_name,
          skin_name: s.skinName !== undefined ? s.skinName : s.skin_name,
          image_url: s.imageUrl !== undefined ? s.imageUrl : s.image_url
        }));
        setSkins(normalized);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error('Vui lòng tải ảnh skin lên từ máy');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await adminAPI.updateSkin(editItem.id, form);
        toast.success('Cập nhật skin thành công');
      } else {
        await adminAPI.createSkin(form);
        toast.success('Thêm skin mới thành công');
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ champion_name: '', skin_name: '', image_url: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu skin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa skin này khỏi danh mục lọc?')) return;
    try {
      await adminAPI.deleteSkin(id);
      toast.success('Đã xóa skin');
      load();
    } catch (err) {
      toast.error('Không thể xóa skin');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><FiTag style={{ color: 'var(--primary)' }} /> Cấu Hình Tag Skin</h1>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ champion_name: '', skin_name: '', image_url: '' }); setShowForm(true); }}>+ Thêm Skin Mới</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <FiTag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm tên tướng, tên skin..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{total} kết quả</span>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Ảnh</th><th>Tên Tướng</th><th>Tên Skin</th><th>Hành Động</th></tr></thead>
                <tbody>
                  {skins.map(skin => (
                    <tr key={skin.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{skin.id}</td>
                      <td>
                        <img src={skin.image_url} alt={skin.skin_name} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                      </td>
                      <td style={{ fontWeight: 700 }}>{skin.champion_name}</td>
                      <td style={{ fontWeight: 600 }}>{skin.skin_name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => { setEditItem(skin); setForm(skin); setShowForm(true); }} title="Sửa"><FiEdit2 /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(skin.id)} title="Xóa"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h2 className="modal-title">{editItem ? 'Cập Nhật Skin' : 'Thêm Skin Game Mới'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Tên tướng (Champion) *</label>
                <input className="form-control" value={form.champion_name} onChange={e => setForm({...form, champion_name: e.target.value})} required placeholder="Ví dụ: Nakroth, Violet" />
              </div>
              <div className="form-group">
                <label className="form-label">Tên skin *</label>
                <input className="form-control" value={form.skin_name} onChange={e => setForm({...form, skin_name: e.target.value})} required placeholder="Ví dụ: Thứ Nguyên Vệ Thần" />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Ảnh skin *</label>
                {form.image_url && (
                  <div style={{ position: 'relative', marginBottom: 12, width: 'fit-content' }}>
                    <img 
                      src={form.image_url} 
                      alt="Preview" 
                      style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--bg-input)',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    onChange={handleSkinImageUpload} 
                    accept="image/*" 
                    disabled={uploadingImage}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                  />
                  <FiUploadCloud size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {uploadingImage ? 'Đang tải ảnh lên...' : 'Chọn file từ máy để tải lên'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Skin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const load = () => {
    setLoading(true);
    adminAPI.getOrders({ page, limit: 20, search: search || undefined, status: statusFilter || undefined })
      .then(res => {
        setOrders(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page, search, statusFilter]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}><FiClock style={{ color: 'var(--primary)' }} /> Phòng Giao Dịch Trung Gian</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <FiClock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm tên acc, người mua, người bán..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 150 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Đang trung gian</option>
          <option value="COMPLETED">Thành công</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{total} giao dịch</span>
      </div>
      {loading ? <Spinner /> : (
        <>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã GD</th><th>Tài Khoản</th><th>Người Mua</th><th>Người Bán</th><th>Số Tiền</th><th>Trạng Thái</th><th>Phòng Chat</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{o.id}</td>
                      <td style={{ fontWeight: 600 }}>{o.account_title}</td>
                      <td>{o.buyer_name}</td>
                      <td>{o.seller_name}</td>
                      <td style={{ fontWeight: 700 }} className="price">{formatMoney(o.amount)}</td>
                      <td>
                        {o.status === 'PENDING' && <span className="badge badge-warning">Chờ giao dịch</span>}
                        {o.status === 'COMPLETED' && <span className="badge badge-success">Thành công</span>}
                        {o.status === 'CANCELLED' && <span className="badge badge-danger">Đã hủy</span>}
                      </td>
                      <td>
                        {o.status === 'PENDING' && (
                          <button className="btn btn-sm btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => router.push(`/admin/orders/${o.id}`)} title="Vào Phòng Chat">
                            <FiMessageSquare size={14} />
                          </button>
                        )}
                        {o.status !== 'PENDING' && (
                          <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} onClick={() => router.push(`/admin/orders/${o.id}`)} title="Xem lại">
                            <FiEye size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = () => { setLoading(true); adminAPI.getDeposits({ status, page, limit: 20, search, date_from: dateFrom, date_to: dateTo }).then(res => { setDeposits(res.data.data); setTotal(res.data.total); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [status, page, search, dateFrom, dateTo]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try { await adminAPI.approveDeposit(id, {}); toast.success('Đã duyệt nạp tiền!'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); } finally { setProcessing(null); }
  };
  const handleReject = async (id) => {
    setProcessing(id);
    try { await adminAPI.rejectDeposit(id, { admin_note: 'Từ chối bởi admin' }); toast.success('Đã từ chối'); load(); } catch (err) { toast.error('Lỗi'); } finally { setProcessing(null); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}><FiCreditCard style={{ color: 'var(--primary)' }} /> Duyệt Nạp Tiền</h1>

      {/* Status tabs */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['pending', <><FiClock /> Chờ Duyệt</>], ['approved', <><FiCheck /> Đã Duyệt</>], ['rejected', <><FiX /> Từ Chối</>], ['', <><FiList /> Tất Cả</>]].map(([v, l]) => (
          <button key={v} className={`filter-tag ${status === v ? 'active' : ''}`} onClick={() => { setStatus(v); setPage(1); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{l}</button>
        ))}
      </div>

      {/* Search + date filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 240 }}>
          <FiUsers style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm username, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiCalendar size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="date" className="form-control" style={{ width: 140 }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
          <input type="date" className="form-control" style={{ width: 140 }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        {(search || dateFrom || dateTo) && (
          <button className="btn btn-sm btn-outline" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}>Xóa lọc</button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Số Tiền</th><th>Phương Thức</th><th>Mã GD</th><th>Trạng Thái</th><th>Thời Gian</th><th>Hành Động</th></tr></thead>
              <tbody>
                {deposits.map(dep => (
                  <tr key={dep.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{dep.username}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dep.email}</div>
                    </td>
                    <td style={{ color: 'var(--success)', fontWeight: 800 }}>{formatMoney(dep.amount)}</td>
                    <td><span className="badge badge-primary">{dep.method}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{dep.transaction_ref || '—'}</td>
                    <td><StatusBadge status={dep.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(dep.created_at)}</td>
                    <td>
                      {dep.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(dep.id)} disabled={processing === dep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} title="Duyệt"><FiCheck size={14} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(dep.id)} disabled={processing === dep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }} title="Từ chối"><FiX size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );

}

export function AdminHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setLoading(true);
    adminAPI.getHistory({ page, limit: 30, search, type: typeFilter, date_from: dateFrom, date_to: dateTo })
      .then(res => { setTransactions(res.data.data); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [page, search, typeFilter, dateFrom, dateTo]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}><FiList style={{ color: 'var(--primary)' }} /> Lịch Sử Giao Dịch</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 240 }}>
          <FiUsers style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm username..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả loại GD</option>
          <option value="DEPOSIT">Nạp tiền</option>
          <option value="PURCHASE">Mua acc</option>
          <option value="REFUND">Hoàn tiền</option>
          <option value="MIDDLEMAN_RELEASE">Giải phóng TG</option>
          <option value="POST_FEE">Phí đăng tin</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiCalendar size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="date" className="form-control" style={{ width: 140 }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
          <input type="date" className="form-control" style={{ width: 140 }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        {(search || typeFilter || dateFrom || dateTo) && (
          <button className="btn btn-sm btn-outline" onClick={() => { setSearch(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}>Xóa lọc</button>
        )}
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Loại</th><th>Mô Tả</th><th>Số Tiền</th><th>Số Dư Sau</th><th>Thời Gian</th></tr></thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.username}</td>
                    <td><span className="badge badge-primary">{t.type}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.description}</td>
                    <td style={{ fontWeight: 700, color: ['DEPOSIT','REFUND','MIDDLEMAN_RELEASE'].includes(t.type) ? 'var(--success)' : 'var(--danger)' }}>
                      {['DEPOSIT','REFUND','MIDDLEMAN_RELEASE'].includes(t.type) ? '+' : '-'}{formatMoney(t.amount)}
                    </td>
                    <td>{formatMoney(t.balance_after)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} total={total} limit={30} onPage={setPage} />
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);

  const load = () => { setLoading(true); adminAPI.getUsers({ search, page, limit: 20 }).then(res => { setUsers(res.data.data); setTotal(res.data.total); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [search, page]);

  const handleBan = async (id, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khóa vĩnh viễn tài khoản "${username}"? Toàn bộ số dư ví còn lại của người dùng này sẽ bị đóng băng vĩnh viễn.`)) {
      return;
    }
    try {
      const res = await adminAPI.banUser(id);
      if (res.data.success) {
        toast.success('Đã khóa tài khoản thành công và đóng băng số dư!');
        load();
      } else {
        toast.error(res.data.message || 'Lỗi khi khóa tài khoản');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    setResetSaving(true);
    try {
      const res = await adminAPI.resetPassword(resettingUser.id, { password: newPassword });
      if (res.data.success) {
        toast.success(`Cấp lại mật khẩu thành công cho ${resettingUser.username}!`);
        setResettingUser(null);
        setNewPassword('');
      } else {
        toast.error(res.data.message || 'Lỗi khi cấp lại mật khẩu');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cấp lại mật khẩu');
    } finally {
      setResetSaving(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%^*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}><FiUsers style={{ color: 'var(--primary)' }} /> Quản Lý Users</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <FiUsers style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm username, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{total} người dùng</span>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Username</th><th>Zalo</th><th>Số Dư Chính</th><th>Số Dư Khóa</th><th>Tổng Nạp</th><th>Role</th><th>Trạng Thái</th><th>Hành Động</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 700 }}>{user.username}</td>
                    <td style={{ fontSize: 12 }}>{user.phone_zalo || '—'}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatMoney(user.balance)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatMoney(user.frozen_balance)}</td>
                    <td style={{ color: 'var(--success)' }}>{formatMoney(user.total_deposited)}</td>
                    <td><span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{user.role}</span></td>
                    <td>
                      {user.status === 'banned' ? (
                        <span className="badge badge-danger">Bị khóa</span>
                      ) : (
                        <span className="badge badge-success">Hoạt động</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {user.role !== 'admin' && (
                          <button 
                            className="btn btn-sm btn-outline" 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}
                            onClick={() => { setResettingUser(user); setNewPassword(''); }}
                            title="Cấp lại mật khẩu"
                          >
                            <FiKey size={14} />
                          </button>
                        )}
                        {user.role !== 'admin' && user.status !== 'banned' && (
                          <button 
                            className="btn btn-sm" 
                            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}
                            onClick={() => handleBan(user.id, user.username)}
                            title="Khóa vĩnh viễn"
                          >
                            <FiLock size={14} />
                          </button>
                        )}
                        {user.status === 'banned' && <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center' }}>Đã khóa</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} total={total} limit={20} onPage={setPage} />

      {resettingUser && (
        <div className="modal-overlay" onClick={() => setResettingUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiKey style={{ color: 'var(--primary)' }} /> Cấp Lại Mật Khẩu
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 13.5 }}>
              Đặt lại mật khẩu cho tài khoản người dùng <strong>{resettingUser.username}</strong>.
            </p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Mật khẩu mới *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={generateRandomPassword}
                    style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '0 12px' }}
                  >
                    Ngẫu nhiên
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setResettingUser(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={resetSaving}>
                  {resetSaving ? 'Đang lưu...' : 'Cấp Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    adminAPI.getRevenue()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Không thể tải dữ liệu doanh thu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Không có dữ liệu thống kê</div>;

  // Format monthly data for chart (sorted chronologically)
  const chartData = data.monthly ? [...data.monthly].sort((a, b) => a.month.localeCompare(b.month)) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header section with quick actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <FiTrendingUp style={{ color: 'var(--primary)' }} /> Phân Tích Doanh Thu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Theo dõi biến động dòng tiền và nguồn thu hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control" style={{ width: 'auto' }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
          <button className="btn btn-outline" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiDownload size={14} /> Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {[
          { icon: <FiDollarSign />, label: 'Tổng Doanh Thu', sub: 'Tất cả nguồn thu', value: formatMoney(data.totalRevenue), color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ffc107 100%)' },
          { icon: <FiMonitor />, label: 'Hoa Hồng Escrow', sub: 'Phí giao dịch trung gian', value: formatMoney(data.orderRevenue), color: '#6c63ff', gradient: 'linear-gradient(135deg, #6c63ff 0%, #8c85ff 100%)' },
          { icon: <FiBox />, label: 'Phí Đăng Tin', sub: 'Dịch vụ người bán', value: formatMoney(data.blindBagRevenue), color: '#ff6584', gradient: 'linear-gradient(135deg, #ff6584 0%, #ff8da1 100%)' },
          { icon: <FiDownload />, label: 'Tổng Tiền Nạp', sub: 'Khách nạp vào ví', value: formatMoney(data.totalDeposits), color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: s.color + '15',
              color: s.color,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontSize: 22,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center'
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Table section split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, alignItems: 'start' }} className="grid-split">
        {/* Left Column: Trend AreaChart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FiTrendingUp style={{ color: 'var(--primary)' }} /> Xu Hướng Doanh Thu
            </h3>
            <span style={{ fontSize: 11, background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 8px', borderRadius: 100, fontWeight: 700 }}>Doanh số hàng tháng</span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} tickFormatter={tick => formatMoney(tick).replace('đ', '')} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow)',
                    fontSize: 13
                  }}
                  formatter={(value) => [formatMoney(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Breakdown Table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <FiCalendar style={{ color: 'var(--primary)' }} /> Chi Tiết Hàng Tháng
          </h3>
          <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ background: 'transparent', borderBottom: '1px solid var(--border)', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>THÁNG</th>
                  <th style={{ background: 'transparent', borderBottom: '1px solid var(--border)', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>DOANH THU</th>
                  <th style={{ background: 'transparent', borderBottom: '1px solid var(--border)', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>SỐ ĐƠN</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Chưa có dữ liệu tháng nào</td>
                  </tr>
                ) : (
                  [...chartData].reverse().map(m => (
                    <tr key={m.month} style={{ transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{m.month}</td>
                      <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)', fontWeight: 800, textAlign: 'right', color: 'var(--primary)' }}>{formatMoney(m.revenue)}</td>
                      <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)', fontWeight: 600, textAlign: 'right', color: 'var(--text-secondary)' }}>{m.orders}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


export function AdminOrderRoom() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = React.useRef(null);

  const loadMessages = () => {
    orderAPI.getMessages(id).then(res => setMessages(res.data.data || []));
  };

  useEffect(() => {
    orderAPI.getDetail(id)
      .then(res => setOrder(res.data.data))
      .catch(() => router.push('/admin/orders'))
      .finally(() => setLoading(false));
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await orderAPI.sendMessage(id, { message: msg, is_private: isPrivate });
      setMsg('');
      loadMessages();
    } catch (err) { toast.error('Gửi thất bại'); }
    finally { setSending(false); }
  };

  const handleComplete = async () => {
    if (!window.confirm('Xác nhận hoàn tất đơn hàng? Tiền sẽ được giải ngân cho người bán (trừ 3% phí).')) return;
    setProcessing(true);
    try {
      await orderAPI.complete(id);
      toast.success('Hoàn tất đơn! Tiền đã giải ngân cho người bán.');
      orderAPI.getDetail(id).then(res => setOrder(res.data.data));
      loadMessages();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(false); }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Vui lòng nhập lý do hủy'); return; }
    setProcessing(true);
    try {
      await orderAPI.cancel(id, { reason: cancelReason });
      toast.success('Đã hủy đơn và hoàn tiền cho người mua!');
      setCancelModal(false);
      orderAPI.getDetail(id).then(res => setOrder(res.data.data));
      loadMessages();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Spinner />;
  if (!order) return null;

  const isPending = order.status === 'PENDING';
  const statusColor = { PENDING: 'var(--warning)', COMPLETED: 'var(--success)', CANCELLED: 'var(--danger)' }[order.status];
  const statusLabel = { PENDING: 'Đang Giao Dịch', COMPLETED: 'Hoàn Tất', CANCELLED: 'Đã Hủy' }[order.status];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/admin/orders')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Quay Lại
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiMessageSquare style={{ color: 'var(--primary)' }} /> Phòng Chat Trung Gian #{id}
        </h1>
        <span className="badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44` }}>{statusLabel}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Order Info + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase' }}>Thông Tin Đơn Hàng</div>
            {[
              ['🎮 Tài khoản', order.account_title],
              ['💰 Giá trị', formatMoney(order.amount)],
              ['🏷️ Phí sàn (3%)', formatMoney(order.fee)],
              ['🛍️ Người mua', order.buyer_name],
              ['📱 Zalo mua', order.buyer_phone || '—'],
              ['🤝 Người bán', order.seller_name],
              ['📱 Zalo bán', order.seller_phone || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Credentials (Admin only) */}
          {order.account_username && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 10 }}>🔑 THÔNG TIN BÀN GIAO (CHỈ ADMIN)</div>
              {[['Username game', order.account_username], ['Mật khẩu', order.account_password], ['Email acc', order.account_email]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                  <code style={{ color: 'var(--success)', fontWeight: 700 }}>{v}</code>
                </div>
              ))}
            </div>
          )}

          {/* Admin Actions */}
          {isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                onClick={handleComplete} disabled={processing}>
                <FiCheck /> Xác Nhận Hoàn Tất (Giải Ngân)
              </button>
              <button className="btn" style={{ width: '100%', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', gap: 8 }}
                onClick={() => setCancelModal(true)} disabled={processing}>
                <FiX /> Hủy Đơn & Hoàn Tiền
              </button>
            </div>
          )}
          {!isPending && (
            <div className="alert" style={{ background: 'var(--bg-input)', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Đơn hàng đã được xử lý xong
            </div>
          )}
        </div>

        {/* Right: Chat room */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', height: 600 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMessageSquare style={{ color: 'var(--primary)' }} /> Phòng Chat 3 Bên
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>Tự động cập nhật mỗi 3 giây</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>Chưa có tin nhắn nào</div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 2,
                alignItems: m.sender_role === 'admin' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                  {m.sender_role === 'admin' ? '🔧 Admin' : m.sender_role === 'user' ? '👤 ' + m.sender_name : m.sender_name}
                  {m.is_private === 1 && <span style={{ color: 'var(--warning)', marginLeft: 6 }}>🔒 Private</span>}
                </div>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 14, lineHeight: 1.5,
                  background: m.sender_role === 'admin' ? 'var(--primary)' : m.is_private === 1 ? 'rgba(251,192,45,0.15)' : 'var(--bg-input)',
                  color: m.sender_role === 'admin' ? 'white' : 'var(--text-primary)',
                  border: m.is_private === 1 ? '1px solid rgba(251,192,45,0.4)' : 'none'
                }}>{m.message}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(m.created_at)}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--warning)', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                🔒 Tin nhắn Private (chỉ Admin thấy)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Nhập tin nhắn..." value={msg}
                onChange={e => setMsg(e.target.value)} disabled={sending} />
              <button type="submit" className="btn btn-primary" disabled={sending || !msg.trim()} style={{ gap: 6 }}>
                <FiSend /> {sending ? '...' : 'Gửi'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertTriangle style={{ color: 'var(--danger)' }} /> Hủy Đơn Hàng
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
              Tiền sẽ được hoàn trả 100% cho người mua. Bài đăng sẽ chuyển sang trạng thái HIDDEN.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Chọn lý do hủy *</label>
              <select className="input" value={cancelReason} onChange={e => setCancelReason(e.target.value)}>
                <option value="">-- Chọn lý do --</option>
                <option value="Acc sai thông tin mô tả">Acc sai thông tin mô tả</option>
                <option value="Người bán không cung cấp được tài khoản">Người bán không cung cấp được tài khoản</option>
                <option value="Hai bên tự thỏa thuận hủy">Hai bên tự thỏa thuận hủy</option>
                <option value="Người bán block/không phản hồi Admin">Người bán block/không phản hồi Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setCancelModal(false)}>Đóng</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white' }}
                onClick={handleCancel} disabled={processing || !cancelReason}>
                {processing ? 'Đang xử lý...' : 'Xác Nhận Hủy & Hoàn Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const toastId = toast.loading('Đang tải ảnh bìa lên Cloudflare R2...');
    try {
      const res = await accountAPI.uploadImage(file);
      if (res.data.success) {
        setForm(prev => ({ ...prev, image: res.data.url }));
        toast.success('Tải ảnh bìa thành công!', { id: toastId });
      } else {
        toast.error(res.data.message || 'Tải ảnh thất bại', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const load = () => { setLoading(true); adminAPI.getCategories().then(res => setCats(res.data.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', slug: '', image: '', description: '' }); setShowForm(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, slug: c.slug, image: c.image || '', description: c.description || '' }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await adminAPI.updateCategory(editItem.id, form); toast.success('Cập nhật danh mục thành công'); }
      else { await adminAPI.createCategory(form); toast.success('Tạo danh mục thành công'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này? Các acc trong danh mục sẽ bị ảnh hưởng!')) return;
    try { await adminAPI.deleteCategory(id); toast.success('Đã xóa danh mục'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Lỗi — danh mục có thể đang được sử dụng'); }
  };

  const filtered = cats.filter(c => 
    !search || 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiLayers style={{ color: 'var(--primary)' }} /> Danh Mục Game
        </h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Thêm Danh Mục</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <FiLayers style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Tìm tên danh mục, slug..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} danh mục</span>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ height: 160, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {c.image ? (
                  <img src={c.image} alt={c.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiLayers size={48} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}><code>{c.slug}</code></div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>{c.description || '—'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(c)} title="Sửa">
                    <FiEdit2 />
                  </button>
                  <button className="btn btn-sm btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(c.id)} title="Xóa">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editItem ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Tên danh mục *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Liên Quân Mobile" />
              </div>
              <div>
                <label className="label">Slug (URL) *</label>
                <input className="input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required placeholder="lien-quan-mobile" />
              </div>
              <div>
                <label className="label" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Ảnh bìa danh mục *</label>
                {form.image && (
                  <div style={{ position: 'relative', marginBottom: 12, width: 'fit-content' }}>
                    <img 
                      src={form.image} 
                      alt="Preview" 
                      style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--bg-input)',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    onChange={handleCategoryImageUpload} 
                    accept="image/*" 
                    disabled={uploadingImage}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: uploadingImage ? 'not-allowed' : 'pointer' }}
                  />
                  <FiUploadCloud size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {uploadingImage ? 'Đang tải ảnh lên...' : 'Chọn file từ máy để tải lên'}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Mô tả</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về danh mục..." />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminLayout({ children }) {
  const { user } = useAuth();
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)', display: 'flex' }}>
      <AdminSidebar />

      {/* Main area offset by sidebar width */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Header */}
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '0 28px',
          height: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Bản điều khiển hệ thống
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
                {(user?.username || 'A')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username || 'Admin'}</span>
            </div>
            <Link href="/" style={{
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              transition: 'all 0.15s'
            }}>Về trang chủ</Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState({ post_fee_percent: '1.0', post_fee_max: '30000', telegram_bot_token: '', telegram_chat_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  useEffect(() => {
    adminAPI.getSettings()
      .then(res => {
        if (res.data.success) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(err => toast.error('Không thể tải cấu hình'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const feeStr = String(settings.post_fee_percent || '').replace(',', '.');
      const feeVal = parseFloat(feeStr);
      if (isNaN(feeVal) || feeVal < 0 || feeVal > 100) {
        toast.error('Phần trăm phí đăng tin phải là số hợp lệ từ 0 đến 100');
        setSaving(false);
        return;
      }

      const maxFeeStr = String(settings.post_fee_max || '').replace(/\D/g, '').trim();
      const maxFeeVal = parseFloat(maxFeeStr);
      if (isNaN(maxFeeVal) || maxFeeVal < 0) {
        toast.error('Phí đăng tin tối đa phải là số hợp lệ từ 0 trở lên');
        setSaving(false);
        return;
      }

      const payload = {
        ...settings,
        post_fee_percent: feeStr,
        post_fee_max: maxFeeStr
      };

      await adminAPI.updateSettings(payload);
      toast.success('Cập nhật cấu hình thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
      toast.error('Vui lòng điền đủ Token và Chat ID để kiểm tra.');
      return;
    }
    setTestingTelegram(true);
    const toastId = toast.loading('Đang gửi tin nhắn thử nghiệm...');
    try {
      const res = await adminAPI.testTelegramSettings({
        telegram_bot_token: settings.telegram_bot_token,
        telegram_chat_id: settings.telegram_chat_id
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Thành công! Hãy kiểm tra Telegram của bạn.', { id: toastId });
      } else {
        toast.error(res.data.message || 'Thử nghiệm thất bại!', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gọi thử nghiệm', { id: toastId, duration: 6000 });
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FiSettings style={{ color: 'var(--primary)' }} /> Cấu Hình Hệ Thống
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Cấu hình các tham số vận hành sàn giao dịch</p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', maxWidth: 900 }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 28, marginBottom: 24 }}>
            {/* Column 1: Config Fees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 8, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiDollarSign size={16} /> Cấu Hình Phí Đăng Tin
              </h3>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Phần trăm phí đăng tin (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    className="form-control"
                    type="text"
                    value={settings.post_fee_percent || ''}
                    onChange={e => setSettings({ ...settings, post_fee_percent: e.target.value })}
                    required
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 14 }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                </div>
                <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block', fontSize: 11, lineHeight: 1.4 }}>
                  Phí dịch vụ tự động trừ từ ví người dùng khi đăng bài thành công.
                </small>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Phí đăng tin tối đa mỗi bài (đ)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    className="form-control"
                    type="text"
                    value={formatNumberString(settings.post_fee_max)}
                    onChange={e => setSettings({ ...settings, post_fee_max: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="Ví dụ: 30.000"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 14 }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>đ</span>
                </div>
                <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block', fontSize: 11, lineHeight: 1.4 }}>
                  Giới hạn số tiền thu phí tối đa cho mỗi tin đăng. Nhập <strong>0</strong> để không giới hạn.
                </small>
              </div>
            </div>

            {/* Column 2: Telegram Notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 8, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiSend size={16} /> Thông Báo Telegram
              </h3>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Telegram Bot Token</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Ví dụ: 123456789:ABCdefGh..."
                  value={settings.telegram_bot_token || ''}
                  onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 14 }}
                />
                <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block', fontSize: 11, lineHeight: 1.4 }}>
                  HTTP API Token của Telegram Bot, lấy từ bot @BotFather.
                </small>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Telegram Chat ID</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Ví dụ: -100123456789"
                  value={settings.telegram_chat_id || ''}
                  onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 14 }}
                />
                <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block', fontSize: 11, lineHeight: 1.4 }}>
                  ID của nhóm/kênh Telegram nhận thông báo hệ thống.
                </small>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ padding: '8px 20px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5 }}
            >
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
            <button
              type="button"
              onClick={handleTestTelegram}
              className="btn btn-outline"
              disabled={testingTelegram}
              style={{ padding: '8px 18px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5, borderColor: 'var(--gold)', color: 'var(--gold)' }}
            >
              {testingTelegram ? 'Đang thử...' : 'Thử Gửi Telegram'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
