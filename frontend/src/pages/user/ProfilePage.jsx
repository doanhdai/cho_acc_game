import React, { useState, useEffect } from 'react';
import { userAPI, accountAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiImage, FiSave, FiLock, 
  FiKey, FiShield, FiCreditCard, FiArrowRight, FiInfo, FiCamera 
} from 'react-icons/fi';
import { GiDiamondHard } from 'react-icons/gi';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile form state
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_zalo: '',
    avatar: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_zalo: user.phone_zalo || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ được phép tải lên file ảnh');
      return;
    }

    const originalAvatar = form.avatar;
    // Set local preview instantly to speed up perceived load time
    const localPreviewUrl = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, avatar: localPreviewUrl }));

    const toastId = toast.loading('Đang tải ảnh đại diện lên...');
    setUploading(true);
    try {
      const res = await accountAPI.uploadImage(file);
      if (res.data && res.data.success) {
        const newAvatarUrl = res.data.url;
        setForm(prev => ({ ...prev, avatar: newAvatarUrl }));
        
        // Automatically save the new avatar to the user profile
        const updatedForm = { ...form, avatar: newAvatarUrl };
        const profileRes = await userAPI.updateProfile(updatedForm);
        if (profileRes.data.success) {
          setUser(profileRes.data.user);
          toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
        } else {
          setForm(prev => ({ ...prev, avatar: originalAvatar }));
          toast.error('Tải ảnh thành công nhưng lưu hồ sơ thất bại', { id: toastId });
        }
      } else {
        setForm(prev => ({ ...prev, avatar: originalAvatar }));
        toast.error(res.data?.message || 'Không thể tải ảnh lên', { id: toastId });
      }
    } catch (err) {
      setForm(prev => ({ ...prev, avatar: originalAvatar }));
      toast.error(err.response?.data?.message || 'Lỗi khi upload ảnh lên hệ thống', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userAPI.updateProfile(form);
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await userAPI.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  if (!user) return <Spinner />;

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-dark)' }}>
      <div className="container" >
        
        <div className="profile-workspace">
          
          {/* Left Column: Sidebar with Avatar & Navigation */}
          <div className="profile-sidebar">
            {/* Avatar & User Details Card */}
            <div className="card" style={{ padding: '24px 16px', textAlign: 'center', marginBottom: 20 }}>
              <div className="profile-avatar-container" style={{ margin: '0 auto 16px' }}>
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <FiUser size={40} color="var(--text-muted)" />
                )}
                <label className="profile-avatar-hover">
                  <FiCamera size={18} />
                  <span>Tải ảnh</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{user.username}</h3>
              <span className={`role-badge role-${user.role}`} style={{ display: 'inline-block', marginBottom: 12 }}>
                {user.role === 'admin' ? '🔥 Quản Trị Viên' : '⭐ Thành Viên'}
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, wordBreak: 'break-all' }}>
                {user.email || 'Chưa cập nhật email'}
              </p>
            </div>

            {/* Sidebar Navigation Card */}
            <div className="card" style={{ padding: 12 }}>
              <ul className="profile-nav-list">
                <li>
                  <button 
                    className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <FiUser size={18} />
                    <span>Thông tin cá nhân</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <FiKey size={18} />
                    <span>Đổi mật khẩu</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`profile-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wallet')}
                  >
                    <FiCreditCard size={18} />
                    <span>Ví tiền & Giao dịch</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="profile-main-content">
            
            {/* Stats Summary Row at Top of Right Column */}
            <div className="profile-stats-grid" style={{ marginBottom: 20 }}>
              <div className="profile-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--gold)' }}>
                  <GiDiamondHard size={22} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Số Dư Khả Dụng</span>
                  <span className="stat-value" style={{ color: 'var(--gold)' }}>{formatMoney(user.balance || 0)}</span>
                </div>
                <button className="btn btn-gold btn-sm stat-action-btn" onClick={() => navigate('/deposit')}>
                  Nạp Tiền <FiArrowRight />
                </button>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(74, 74, 106, 0.1)', color: 'var(--text-secondary)' }}>
                  <FiLock size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Số Dư Đóng Băng</span>
                  <span className="stat-value">{formatMoney(user.frozen_balance || 0)}</span>
                </div>
                <div className="stat-hint" title="Số tiền đang trong trạng thái giao dịch trung gian">
                  <FiInfo size={14} color="var(--text-muted)" />
                </div>
              </div>
            </div>

            {/* Active Tab Card Content */}
            <div className="card" style={{ padding: 30, minHeight: 340 }}>
              
              {/* Tab 1: Info */}
              {activeTab === 'info' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiUser style={{ color: 'var(--primary)' }} /> Thông Tin Cá Nhân
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Cập nhật thông tin liên lạc để người mua dễ dàng giao dịch và hỗ trợ bạn.
                  </p>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="responsive-grid" style={{ marginBottom: 20 }}>
                      <div className="form-group">
                        <label className="profile-label">Họ và Tên</label>
                        <div className="input-with-icon-wrapper">
                          <FiUser className="input-icon" />
                          <input 
                            className="profile-input" 
                            value={form.full_name} 
                            onChange={e => setForm({...form, full_name: e.target.value})} 
                            placeholder="Chưa cập nhật"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="profile-label">Địa chỉ Email</label>
                        <div className="input-with-icon-wrapper">
                          <FiMail className="input-icon" />
                          <input 
                            className="profile-input" 
                            type="email" 
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})} 
                            placeholder="Nhập địa chỉ email"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="responsive-grid" style={{ marginBottom: 24 }}>
                      <div className="form-group">
                        <label className="profile-label">Số điện thoại Zalo liên hệ</label>
                        <div className="input-with-icon-wrapper">
                          <FiPhone className="input-icon" />
                          <input 
                            className="profile-input" 
                            value={form.phone_zalo} 
                            onChange={e => setForm({...form, phone_zalo: e.target.value})} 
                            placeholder="Ví dụ: 0901234567"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="profile-label">Ảnh đại diện (URL)</label>
                        <div className="input-with-icon-wrapper">
                          <FiImage className="input-icon" />
                          <input 
                            className="profile-input" 
                            value={form.avatar} 
                            onChange={e => setForm({...form, avatar: e.target.value})} 
                            placeholder="Đường dẫn ảnh trực tuyến"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '12px 24px', borderRadius: 'var(--radius)', fontSize: 13 }}
                      disabled={loading}
                    >
                      {loading ? 'Đang lưu...' : <><FiSave /> Lưu Thay Đổi</>}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Password */}
              {activeTab === 'password' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiLock style={{ color: 'var(--primary)' }} /> Đổi Mật Khẩu
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Hãy dùng mật khẩu bảo mật cao để bảo vệ ví tiền và bài đăng của bạn.
                  </p>

                  <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 500 }}>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="profile-label">Mật khẩu hiện tại *</label>
                      <div className="input-with-icon-wrapper">
                        <FiLock className="input-icon" />
                        <input 
                          className="profile-input" 
                          type="password" 
                          required
                          value={passwordForm.old_password}
                          onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})}
                          placeholder="Nhập mật khẩu đang sử dụng"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="profile-label">Mật khẩu mới *</label>
                      <div className="input-with-icon-wrapper">
                        <FiKey className="input-icon" />
                        <input 
                          className="profile-input" 
                          type="password" 
                          required
                          value={passwordForm.new_password}
                          onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                          placeholder="Mật khẩu mới ít nhất 6 ký tự"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 24 }}>
                      <label className="profile-label">Xác nhận mật khẩu mới *</label>
                      <div className="input-with-icon-wrapper">
                        <FiShield className="input-icon" />
                        <input 
                          className="profile-input" 
                          type="password" 
                          required
                          value={passwordForm.confirm_password}
                          onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '12px 24px', borderRadius: 'var(--radius)', fontSize: 13 }}
                      disabled={loading}
                    >
                      {loading ? 'Đang thực hiện...' : <><FiKey /> Xác Nhận Đổi Mật Khẩu</>}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Wallet */}
              {activeTab === 'wallet' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiCreditCard style={{ color: 'var(--primary)' }} /> Ví Tiền & Nạp Tiền
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Quản lý số dư, nạp thẻ hoặc chuyển khoản ngân hàng tự động.
                  </p>

                  <div className="responsive-grid" style={{ marginBottom: 30 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--bg-dark)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Ví của tôi</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>{formatMoney(user.balance || 0)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Số dư khả dụng để mua acc game hoặc trả phí bài đăng.</div>
                    </div>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--bg-dark)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Hạn mức đóng băng</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>{formatMoney(user.frozen_balance || 0)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Khoản tiền đang trong các giao dịch chờ duyệt.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={() => navigate('/deposit')}>
                      <GiDiamondHard /> Nạp Tiền Vào Ví
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/history')}>
                      Lịch Sử Giao Dịch
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      <style>{`
        .profile-workspace {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 30px;
          align-items: start;
        }
        .profile-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .profile-avatar-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid var(--border);
          box-shadow: var(--shadow);
          overflow: hidden;
          background: var(--bg-card2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }
        .profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-hover {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
          gap: 4px;
        }
        .profile-avatar-container:hover .profile-avatar-hover {
          opacity: 1;
        }
        
        .role-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .role-user {
          background: rgba(37, 99, 235, 0.1);
          color: var(--info);
        }
        .role-admin {
          background: rgba(229, 57, 53, 0.1);
          color: var(--primary);
        }
        
        .profile-nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .profile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: inherit;
        }
        .profile-nav-item:hover {
          color: var(--primary);
          background: var(--bg-card2);
        }
        .profile-nav-item.active {
          background: var(--primary-glow);
          color: var(--primary);
        }

        .profile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .profile-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }
        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .stat-action-btn {
          margin-left: auto;
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 4px;
        }
        .stat-hint {
          margin-left: auto;
          align-self: flex-start;
          cursor: help;
        }

        .profile-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .input-with-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          font-size: 16px;
        }
        .profile-input {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 44px;
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 14px;
          border-radius: var(--radius);
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .profile-input:focus {
          border-color: var(--primary);
          background: white;
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .profile-workspace {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .profile-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .responsive-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
