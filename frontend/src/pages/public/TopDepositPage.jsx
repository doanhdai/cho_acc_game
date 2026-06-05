import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../../api';
import { Spinner, formatMoney } from '../../components/common';
import { FiAward } from 'react-icons/fi';

export default function TopDepositPage() {
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    newsAPI.getTopDeposit().then(res => setTop(res.data.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  const medals = [
    <FiAward style={{ color: '#ffd700' }} />,
    <FiAward style={{ color: '#c0c0c0' }} />,
    <FiAward style={{ color: '#cd7f32' }} />
  ];
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <FiAward style={{ color: 'var(--primary)' }} /> Top Nạp
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bảng xếp hạng thành viên nạp tiền nhiều nhất</p>
        </div>
        {}
        {top.slice(0, 3).length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {[top[1], top[0], top[2]].filter(Boolean).map((user, i) => {
              const realRank = user === top[0] ? 1 : user === top[1] ? 2 : 3;
              const sizes = {1: 140, 2: 110, 3: 100};
              const size = realRank === 1 ? 140 : realRank === 2 ? 110 : 100;
              return (
                <div key={user.id} style={{ textAlign: 'center', flex: '0 0 auto' }}>
                  <div style={{ marginBottom: 8, fontSize: 28 }}>{medals[realRank - 1]}</div>
                  <div style={{
                    width: size, height: size,
                    background: `linear-gradient(135deg, ${realRank === 1 ? '#ffd700, #e08000' : realRank === 2 ? '#c0c0c0, #888' : '#cd7f32, #8b4513'})`,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: size * 0.35, fontWeight: 900, color: '#000', margin: '0 auto 12px', border: '4px solid rgba(255,255,255,0.2)'
                  }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{user.full_name || user.username}</div>
                  <div className="gold-text" style={{ fontWeight: 800, fontSize: 14 }}>{formatMoney(user.total_deposited)}</div>
                </div>
              );
            })}
          </div>
        )}
        {}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {top.map((user, idx) => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
              borderBottom: idx < top.length - 1 ? '1px solid var(--border)' : 'none',
              background: idx < 3 ? 'var(--bg-card2)' : 'transparent'
            }}>
              <div style={{ width: 32, textAlign: 'center', fontWeight: 900, fontSize: idx < 3 ? 20 : 15, color: idx < 3 ? ['#ffd700','#c0c0c0','#cd7f32'][idx] : 'var(--text-muted)' }}>
                {idx < 3 ? medals[idx] : idx + 1}
              </div>
              <div style={{ width: 42, height: 42, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{user.full_name || user.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username}</div>
              </div>
              <div className="gold-text" style={{ fontWeight: 800, fontSize: 16 }}>{formatMoney(user.total_deposited)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
