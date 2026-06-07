'use client';

import React from 'react';

export const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
export const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function Spinner() {
  return <div className="spinner" />;
}

export function EmptyState({ icon = '📭', title = 'Không có dữ liệu', description }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>{title}</h3>
      {description && <p style={{ fontSize: 14 }}>{description}</p>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    SHOWING:          { label: 'Đang bán',        bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    SOLD:             { label: 'Đã bán',          bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
    IN_TRANSACTION:   { label: 'Đang giao dịch',  bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
    HIDDEN:           { label: 'Đã ẩn',           bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    PENDING_APPROVAL: { label: 'Chờ duyệt',       bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
    REJECTED:         { label: 'Bị từ chối',      bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
    DELETED:          { label: 'Đã xóa',          bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    pending:          { label: 'Chờ duyệt',       bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
    approved:         { label: 'Đã duyệt',        bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    completed:        { label: 'Đã duyệt',        bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    rejected:         { label: 'Từ chối',         bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
    PENDING:          { label: 'Đang trung gian', bg: '#ede9fe', color: '#7c3aed', dot: '#8b5cf6' },
    COMPLETED:        { label: 'Thành công',      bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    CANCELLED:        { label: 'Đã hủy',          bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  };
  const cfg = map[status] || { label: status, bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
      letterSpacing: '0.01em'
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>«</button>
      {pages.map((p, idx) => (
        p === '...' ? (
          <span key={`dots-${idx}`} style={{ padding: '0 8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>...</span>
        ) : (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        )
      ))}
      <button className="page-btn" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>»</button>
    </div>
  );
}
