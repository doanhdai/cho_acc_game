import React from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiMessageSquare, FiClock, FiCreditCard } from 'react-icons/fi';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Shop Acc Game';
const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || '/logo_lienquan.png';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '48px 0 24px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <img src={LOGO_URL} alt="Logo" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Sàn giao dịch acc game uy tín số 1 Việt Nam. Cam kết chất lượng, hỗ trợ 24/7.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Dịch Vụ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/', 'Mua Acc Game'], ['/sell', 'Đăng Tin Bán Acc'], ['/deposit', 'Nạp Tiền'], ['/top-deposit', 'Top Nạp']].map(([to, label]) => (
                <Link key={to} href={to} style={{ color: 'var(--text-muted)', fontSize: 14, transition: 'color 0.2s' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Hỗ Trợ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/deposit" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Hướng Dẫn Nạp Tiền</Link>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Liên Hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiPhone /> 0901 234 567</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMail /> support@shopaccgame.vn</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMessageSquare /> FB: ShopAccGame.vn</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiClock /> Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2024 ShopAccGame.vn – All rights reserved.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { icon: <FiCreditCard />, label: 'Bank Transfer' },
              { icon: <FiCreditCard />, label: 'VietQR / PayOS' },
            ].map((m, idx) => (
              <span key={idx} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.icon} {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
