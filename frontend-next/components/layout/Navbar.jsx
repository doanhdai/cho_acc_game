'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiMenu, FiX, FiShoppingBag, FiUser, FiLogOut, FiSettings, FiClock } from 'react-icons/fi';
import { GiDiamondHard } from 'react-icons/gi';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Shop Acc Game';
const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || '/logo_lienquan.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/sell', label: 'Đăng Tin Bán Acc' },
    ...(user ? [{ to: '/my-accounts', label: 'Quản Lý Tin' }] : []),
    { to: '/top-deposit', label: 'Top Nạp' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        <Link href="/" className="nav-logo">
          <img src={LOGO_URL} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="logo-text">{SITE_NAME}</span>
        </Link>

        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              href={link.to}
              className={`nav-link ${pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          {user ? (
            <div className="user-menu" onMouseLeave={() => setDropdownOpen(false)}>
              <button className="user-btn" onMouseEnter={() => setDropdownOpen(true)} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-balance">{formatMoney(user.balance || 0)}</span>
                </div>
              </button>
              {dropdownOpen && (
                <div className="dropdown">
                  {user.role === 'admin' && (
                    <Link href="/admin" className="dropdown-item admin-item">
                      <FiSettings /> Quản Trị Admin
                    </Link>
                  )}
                  <Link href="/deposit" className="dropdown-item">
                    <GiDiamondHard /> Nạp Tiền
                  </Link>
                  <Link href="/profile" className="dropdown-item">
                    <FiUser /> Thông Tin Cá Nhân
                  </Link>
                  <Link href="/history" className="dropdown-item">
                    <FiClock /> Lịch Sử
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <FiLogOut /> Đăng Xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-outline btn-sm">Đăng Nhập</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Đăng Ký</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.to} href={link.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="mobile-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><FiUser /> Thông Tin Cá Nhân</Link>
              <Link href="/deposit" className="mobile-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><GiDiamondHard /> Nạp Tiền</Link>
              <Link href="/history" className="mobile-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><FiClock /> Lịch Sử</Link>
              <Link href="/my-accounts" className="mobile-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><FiShoppingBag /> Acc Của Tôi</Link>
              {user.role === 'admin' && <Link href="/admin" className="mobile-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><FiSettings /> Admin</Link>}
              <button className="mobile-link" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}><FiLogOut /> Đăng Xuất</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>🔑 Đăng Nhập</Link>
              <Link href="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>✨ Đăng Ký</Link>
            </>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.09);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .nav-inner { display: flex; align-items: center; gap: 24px; height: 64px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-text { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .nav-links { display: flex; gap: 4px; flex: 1; justify-content: flex-end; }
        .nav-link { padding: 7px 14px; border-radius: var(--radius); font-size: 13px; font-weight: 500; color: var(--text-secondary); transition: all 0.2s; white-space: nowrap; }
        .nav-link:hover, .nav-link.active { color: var(--primary); background: var(--primary-glow); }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .auth-buttons { display: flex; gap: 8px; }
        .user-menu { position: relative; }
        .user-btn { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 14px; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
        .user-btn:hover { border-color: var(--primary); box-shadow: 0 2px 12px var(--primary-glow); }
        .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; }
        .user-info { text-align: left; }
        .user-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .user-balance { display: block; font-size: 11px; color: var(--gold); }
        .dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 200px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.13); z-index: 200; animation: fadeInUp 0.15s ease; }
        .dropdown::before { content: ''; position: absolute; top: -12px; left: 0; width: 100%; height: 12px; background: transparent; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border-radius: 4px; font-size: 14px; color: var(--text-secondary); background: none; border: none; cursor: pointer; font-family: inherit; text-decoration: none; transition: all 0.2s; }
        .dropdown-item:hover { background: var(--bg-card2); color: var(--text-primary); }
        .dropdown-item.admin-item { color: var(--primary); }
        .dropdown-item.danger:hover { color: var(--danger); background: rgba(229,57,53,0.08); }
        .dropdown-divider { height: 1px; background: var(--border); margin: 6px 0; }
        .hamburger { display: none; background: none; border: none; color: var(--text-primary); font-size: 22px; cursor: pointer; }
        .mobile-menu { display: none; flex-direction: column; border-top: 1px solid var(--border); background: var(--bg-card); padding: 12px; gap: 2px; }
        .mobile-link { display: block; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: var(--text-secondary); background: none; border: none; cursor: pointer; font-family: inherit; text-decoration: none; transition: all 0.2s; text-align: left; }
        .mobile-link:hover { background: var(--bg-card2); color: var(--text-primary); }
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-right { margin-left: auto; }
          .hamburger { display: flex; }
          .mobile-menu { display: flex; }
        }
        @media (max-width: 640px) {
          .auth-buttons { display: none; }
          .logo-text { font-size: 16px; }
        }
        @media (max-width: 480px) {
          .logo-text { font-size: 14px; }
          .nav-logo img { width: 32px !important; height: 32px !important; }
          .nav-inner { gap: 12px; }
        }
      `}} />
    </nav>
  );
}
