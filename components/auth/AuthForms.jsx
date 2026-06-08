'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FiKey, FiUserPlus } from 'react-icons/fi';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || '/logo_lienquan.png';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    if (googleLoading) return;
    setGoogleLoading(true);
    const toastId = toast.loading('Đang đăng nhập bằng Google...');
    try {
      const result = await loginWithGoogle(response.credential);
      toast.success('Đăng nhập bằng Google thành công!', { id: toastId });
      if (result.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại', { id: toastId });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
        window.google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
        );
      } catch (err) {
        console.error('Lỗi cấu hình Google Sign-In:', err);
      }
    }
  }, [googleLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await login(form);
      toast.success('Đăng nhập thành công!');
      if (result.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          try {
            const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
            window.google.accounts.id.initialize({
              client_id: client_id,
              callback: handleGoogleLogin,
            });
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-btn'),
              { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
            );
          } catch (err) {
            console.error('Lỗi khi load script Google Sign-In:', err);
          }
        }}
      />
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Link href="/"><img src={LOGO_URL} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain' }} /></Link>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Đăng Nhập</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Chào mừng trở lại Shop Acc Game</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập / Email</label>
              <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Nhập username hoặc email" required />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Nhập mật khẩu" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: 14 }} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : <><FiKey style={{ marginRight: 8 }} /> Đăng Nhập</>}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
            <span style={{ position: 'relative', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0 12px' }}>Hoặc đăng nhập bằng</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div id="google-signin-btn" style={{ width: '100%', minHeight: 40 }} />
          </div>

          <div className="divider" />
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Đăng ký ngay</Link>
          </div>
          {/* <div style={{ marginTop: 16, background: 'var(--bg-input)', borderRadius: 10, padding: '12px 16px', fontSize: 12, border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><FiKey /> Demo Accounts</div>
            <div style={{ color: 'var(--text-secondary)' }}>Admin: <code style={{ color: 'var(--primary)' }}>admin / 123456</code></div>
            <div style={{ color: 'var(--text-secondary)' }}>User: <code style={{ color: 'var(--success)' }}>user01 / 123456</code></div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', phone_zalo: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    if (googleLoading) return;
    setGoogleLoading(true);
    const toastId = toast.loading('Đang đăng ký/đăng nhập bằng Google...');
    try {
      const result = await loginWithGoogle(response.credential);
      toast.success('Đăng nhập bằng Google thành công!', { id: toastId });
      if (result.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại', { id: toastId });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
        window.google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-register-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
        );
      } catch (err) {
        console.error('Lỗi cấu hình Google Sign-In ở trang Register:', err);
      }
    }
  }, [googleLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Đăng ký thành công! Chào mừng bạn!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          try {
            const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
            window.google.accounts.id.initialize({
              client_id: client_id,
              callback: handleGoogleLogin,
            });
            window.google.accounts.id.renderButton(
              document.getElementById('google-register-btn'),
              { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
            );
          } catch (err) {
            console.error('Lỗi khi load script Google Sign-In ở trang Register:', err);
          }
        }}
      />
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Đăng Ký</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tạo tài khoản để bắt đầu mua acc</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username" required minLength={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Họ tên</label>
                <input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Nguyễn Văn A" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@gmail.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại Zalo *</label>
              <input className="form-control" value={form.phone_zalo} onChange={e => setForm({...form, phone_zalo: e.target.value})} placeholder="0901234567" required />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ít nhất 6 ký tự" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: 14 }} disabled={loading}>
              {loading ? 'Đang đăng ký...' : <><FiUserPlus style={{ marginRight: 8 }} /> Đăng Ký</>}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
            <span style={{ position: 'relative', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0 12px' }}>Hoặc đăng ký bằng</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div id="google-register-btn" style={{ width: '100%', minHeight: 40 }} />
          </div>

          <div className="divider" />
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Đã có tài khoản? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
