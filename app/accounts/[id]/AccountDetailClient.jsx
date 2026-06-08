'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; import { useRouter, useParams } from 'next/navigation';
import { accountAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner, formatMoney, formatDate } from '@/components/common';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiEye, FiHeart, FiShare2, FiMoreHorizontal,
  FiChevronLeft, FiChevronRight, FiAward, FiZap, FiGrid,
  FiShield, FiClock, FiPhoneOff, FiMessageSquare, FiDollarSign,
  FiEdit, FiEyeOff, FiTag, FiInbox
} from 'react-icons/fi';

export default function AccountDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    accountAPI.getById(id)
      .then(res => setAccount(res.data.data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!account) return null;

  const images = account.images ? (Array.isArray(account.images) ? account.images : JSON.parse(account.images)) : [];
  const displayImages = images.length > 0 ? images : [`https://placehold.co/800x450/13132a/6c63ff?text=${encodeURIComponent(account.title)}`];

  const isSold = account.status === 'SOLD';
  const isInTransaction = account.status === 'IN_TRANSACTION';
  const isOwner = user && (user.username === account.seller_name || user.id === account.seller_id);

  const handlePrev = () => {
    setActiveImgIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImgIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết chia sẻ tin đăng này!");
  };

  const handleEditToast = () => {
    toast.success("Vui lòng liên hệ Admin hoặc nhắn Zalo hỗ trợ để chỉnh sửa thông tin tin đăng này.");
  };

  const handleHideToast = () => {
    toast.success("Vui lòng liên hệ Admin để ẩn hoặc gỡ tin đăng này.");
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-dark)' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Navigation / Back Button */}
        <button onClick={() => router.back()} className="btn btn-outline btn-sm" style={{ marginBottom: 24, gap: 6, borderRadius: 'var(--radius)' }}>
          <FiArrowLeft /> Quay lại
        </button>

        {/* Responsive Grid layout */}
        <div className="detail-grid">

          {/* LEFT COLUMN: Gallery & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Gallery Box */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border)',
                background: '#09090b',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={displayImages[activeImgIndex]}
                  alt={account.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                />

                {/* Status Badges Overlay */}
                {isSold && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 950, color: 'var(--danger)', letterSpacing: 2 }}>ĐÃ BÁN</div>
                )}
                {isInTransaction && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 950, color: 'var(--gold)', letterSpacing: 2 }}>ĐANG GIAO DỊCH</div>
                )}

                {/* Left/Right Slider Controls */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="slider-arrow"
                      style={{ left: 16 }}
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="slider-arrow"
                      style={{ right: 16 }}
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Top-Right Gallery Options */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                  <button onClick={handleShare} className="gallery-btn" title="Chia sẻ">
                    <FiShare2 size={16} />
                  </button>
                  <button className="gallery-btn" title="Thêm">
                    <FiMoreHorizontal size={16} />
                  </button>
                </div>

                {/* Bottom-Right Page Indicator */}
                {displayImages.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    background: 'rgba(0,0,0,0.65)', color: 'white',
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                  }}>
                    {activeImgIndex + 1}/{displayImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {displayImages.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 12,
                  overflowX: 'auto',
                  paddingBottom: 4
                }}>
                  {displayImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      style={{
                        width: 76,
                        height: 57,
                        flexShrink: 0,
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        border: activeImgIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        opacity: activeImgIndex === idx ? 1 : 0.75,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => {
                        if (activeImgIndex !== idx) e.currentTarget.style.opacity = '0.75';
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ marginBottom: 16, fontSize: 14, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mô Tả Tài Khoản</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-line', margin: 0 }}>{account.description}</p>

              {account.skins_list && account.skins_list.length > 0 && (
                <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiTag size={13} /> Trang phục nổi bậtt:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {account.skins_list.map(skin => (
                      <div key={skin.id} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--primary-glow)',
                        border: '1px solid var(--primary)',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        <span>{skin.champion_name} - {skin.skin_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Info & Actions */}
          <div>
            <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Product Info Card */}
              <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
                {/* Title */}
                <div style={{ marginBottom: 12 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {account.title}
                  </h1>
                </div>

                {/* Subtitle list */}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <span>{account.category_name}</span>
                  <span>•</span>
                  <span>{account.rank_level || 'Chưa xếp hạng'}</span>
                  <span>•</span>
                  <span style={{ color: account.security_status === 'TRANG_THONG_THIN' ? 'var(--success)' : 'var(--danger)' }}>
                    {account.security_status === 'TRANG_THONG_THIN' ? 'Trắng thông tin' : 'Dính thông tin'}
                  </span>
                </div>

                {/* Price Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 26, fontWeight: 600, color: '#ff3b30' }}>{formatMoney(account.price)}</span>
                  {account.original_price > account.price && (
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 15 }}>
                      {formatMoney(account.original_price)}
                    </span>
                  )}
                </div>

                {/* Specs List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <FiAward style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={16} />
                    <span>Hạng: <strong>{account.rank_level || 'Chưa xếp hạng'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <FiZap style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={16} />
                    <span>Số tướng sở hữu: <strong>{account.champions_count} tướng</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <FiGrid style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={16} />
                    <span>Số trang phục sở hữu: <strong>{account.skins_count} skins</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <FiShield style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={16} />
                    <span>Bảo mật: <strong style={{ color: account.security_status === 'TRANG_THONG_THIN' ? 'var(--success)' : 'var(--danger)' }}>
                      {account.security_status === 'TRANG_THONG_THIN' ? 'Trắng thông tin' : 'Dính thông tin'}
                    </strong></span>
                  </div>
                  {account.created_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <FiClock style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={16} />
                      <span>Cập nhật: {formatDate(account.created_at)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 6, marginTop: 8 }}>
                    <FiPhoneOff size={14} style={{ flexShrink: 0 }} />
                    <span>Người bán đã ẩn số điện thoại liên hệ trực tiếp.</span>
                  </div>
                </div>

                {/* Actions Button Block */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  {isOwner ? (
                    /* Viewer is Seller / Owner */
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={handleHideToast}
                        className="btn btn-outline"
                        style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius)', background: 'var(--bg-input)', border: 'none', color: 'var(--text-secondary)', fontWeight: 700 }}
                      >
                        Đã bán / Ẩn tin
                      </button>
                      <button
                        onClick={handleEditToast}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius)', background: '#ffcc00', border: 'none', color: '#000', fontWeight: 700, gap: 6 }}
                      >
                        <FiEdit size={14} /> Sửa tin
                      </button>
                    </div>
                  ) : (
                    /* Viewer is Buyer */
                    !isSold && (
                      <a
                        href={`https://zalo.me/${account.seller_phone || '0901234567'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius)', gap: 8, height: 44 }}
                      >
                        <FiMessageSquare /> Liên Hệ Ngay (Zalo)
                      </a>
                    )
                  )}

                  {isSold && (
                    <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'not-allowed', borderRadius: 'var(--radius)' }}>
                      Tài khoản đã bán
                    </button>
                  )}
                </div>
              </div>

              {/* Seller Profile Summary Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 16, flexShrink: 0
                  }}>
                    {(account.seller_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {account.seller_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--success)', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                      <span>Đang hoạt động</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <Link
                    href={`/seller/${account.seller_id}`}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px 12px', fontSize: 11, height: 30, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Xem trang
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .detail-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 32px;
        }
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }
        .slider-arrow:hover {
          background: rgba(0, 0, 0, 0.7);
          scale: 1.05;
        }
        .gallery-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gallery-btn:hover {
          background: rgba(0, 0, 0, 0.7);
          scale: 1.05;
        }
        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}} />
    </div>
  );
}
