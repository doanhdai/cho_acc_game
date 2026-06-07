'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { accountAPI } from '@/lib/api';
import AccountCard from '@/components/ui/AccountCard';
import { Spinner, formatDate } from '@/components/common';
import { FiArrowLeft, FiMessageSquare, FiCalendar, FiShield, FiInbox } from 'react-icons/fi';
import Link from 'next/link';

export default function SellerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    accountAPI.getBySeller(id)
      .then(res => {
        if (res.data.success) {
          setSeller(res.data.seller);
          setAccounts(res.data.data);
        }
      })
      .catch(err => {
        console.error("Lỗi lấy thông tin người bán:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <Spinner />
      </div>
    );
  }

  if (!seller) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-dark)' }}>
        <FiInbox size={48} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy thông tin người bán này.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary btn-sm">Quay về trang chủ</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0', background: 'var(--bg-dark)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Back Button */}
        <button onClick={() => router.back()} className="btn btn-outline btn-sm" style={{ marginBottom: 24, gap: 6, borderRadius: 'var(--radius)' }}>
          <FiArrowLeft /> Quay lại
        </button>

        {/* Seller Banner */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: 'white',
              fontSize: 24,
              flexShrink: 0
            }}>
              {seller.username[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {seller.username}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--success)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                  <strong>Đang hoạt động</strong>
                </div>
                {seller.created_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <FiCalendar size={14} />
                    <span>Tham gia: {formatDate(seller.created_at)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <FiShield size={14} />
                  <span>Đối tác uy tín</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href={`https://zalo.me/${seller.phone_zalo || '0325459901'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius)', gap: 8, height: 40, padding: '0 20px', fontSize: 13 }}
            >
              <FiMessageSquare /> Chat Zalo
            </a>
          </div>
        </div>

        {/* Seller's Listings */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
            Tài Khoản Đang Rao Bán ({accounts.length})
          </h2>

          {accounts.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <FiInbox size={40} style={{ color: 'var(--text-muted)' }} />
              <p>Người bán hiện chưa có tài khoản game nào được rao bán.</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {accounts.map(acc => (
                <AccountCard key={acc.id} account={acc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
