'use client';

import React, { useState, useEffect } from 'react';
import { newsAPI } from '@/lib/api';
import { Spinner, formatMoney } from '@/components/common';
import { FiAward, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function TopDepositPage() {
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsAPI.getTopDeposit().then(res => setTop(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const top3 = top.slice(0, 3);
  const rest = top.slice(3);

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return 'var(--text-muted)';
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'linear-gradient(135deg, #ffd700, #d97706)';
    if (rank === 2) return 'linear-gradient(135deg, #e5e7eb, #9ca3af)';
    if (rank === 3) return 'linear-gradient(135deg, #f8b485, #b45309)';
    return 'var(--bg-input)';
  };

  return (
    <div style={{ padding: '60px 0', background: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-glow)', 
            color: 'var(--primary)', fontSize: 32, marginBottom: 16
          }}>
            <FiAward />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
            Bảng Xếp Hạng Top Nạp
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Vinh danh những thành viên có đóng góp nhiều nhất cho hệ thống. Bảng xếp hạng được cập nhật liên tục mỗi ngày.
          </p>
        </div>

        {/* Podium Section */}
        {top3.length > 0 && (
          <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
            gap: 24, marginBottom: 60, padding: '0 20px' 
          }}>
            {/* Rank 2 */}
            {top3[1] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 160, position: 'relative' }}>
                <div style={{ color: getRankColor(2), fontSize: 28, marginBottom: 12 }}><FiAward /></div>
                <div style={{ 
                  width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%', padding: 4,
                  background: getRankBg(2), boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    {top3[1].avatar ? <img src={top3[1].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#9ca3af' }}>{top3[1].username[0].toUpperCase()}</div>}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '12px 8px', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{top3[1].full_name || top3[1].username}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{formatMoney(top3[1].total_deposited)}</div>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 190, position: 'relative', zIndex: 10 }}>
                <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', color: '#ffd700', fontSize: 40, filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.4))' }}>👑</div>
                <div style={{ 
                  width: 140, height: 140, margin: '0 auto 20px', borderRadius: '50%', padding: 6,
                  background: getRankBg(1), boxShadow: '0 12px 32px rgba(217, 119, 6, 0.25)'
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    {top3[0].avatar ? <img src={top3[0].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800, color: '#d97706' }}>{top3[0].username[0].toUpperCase()}</div>}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px 12px', borderRadius: 16, border: '2px solid #ffd700', boxShadow: '0 8px 24px rgba(255,215,0,0.15)' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{top3[0].full_name || top3[0].username}</div>
                  <div className="gold-text" style={{ fontWeight: 700, fontSize: 15 }}>{formatMoney(top3[0].total_deposited)}</div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 160, position: 'relative' }}>
                <div style={{ color: getRankColor(3), fontSize: 28, marginBottom: 12 }}><FiAward /></div>
                <div style={{ 
                  width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%', padding: 4,
                  background: getRankBg(3), boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    {top3[2].avatar ? <img src={top3[2].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#b45309' }}>{top3[2].username[0].toUpperCase()}</div>}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '12px 8px', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{top3[2].full_name || top3[2].username}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{formatMoney(top3[2].total_deposited)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List Section */}
        {top.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTrendingUp /> Bảng Xếp Hạng Chi Tiết
            </h3>
            {top.map((user, idx) => {
              const rank = idx + 1;
              return (
                <div key={user.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 20, padding: '12px 20px', 
                  background: 'var(--bg-card)', border: '1px solid var(--border)', 
                  borderRadius: 16, transition: 'all 0.2s ease', cursor: 'default'
                }}>
                  
                  {/* Rank Number/Medal */}
                  <div style={{ width: 40, textAlign: 'center', fontWeight: 900, fontSize: rank <= 3 ? 24 : 20, color: getRankColor(rank) }}>
                    {rank <= 3 ? <FiAward /> : `#${rank}`}
                  </div>
                  
                  {/* Avatar */}
                  <div style={{ 
                    width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', 
                    background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--text-secondary)'
                  }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                      {user.full_name || user.username}
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <div className={rank <= 3 ? "gold-text" : ""} style={{ fontWeight: 600, fontSize: 16, color: rank > 3 ? 'var(--text-primary)' : undefined }}>
                      {formatMoney(user.total_deposited)}
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
