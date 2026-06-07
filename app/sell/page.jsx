'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accountAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiPlus, FiTrash, FiAlertCircle, FiUploadCloud,
  FiTag, FiCheckCircle, FiDollarSign, FiInfo,
  FiServer, FiLayers, FiShield, FiSliders, FiImage, FiArrowLeft
} from 'react-icons/fi';

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const formatNumberString = (val) => {
  if (val === null || val === undefined) return '';
  const clean = val.toString().replace(/\D/g, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function SellPage() {
  const { user, loading: authLoading, reloadUser, updateUser } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [availableSkins, setAvailableSkins] = useState([]);

  // Detect Edit Mode
  const [editId, setEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalStatus, setOriginalStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const edit = queryParams.get('edit');
      if (edit) {
        setEditId(edit);
        setIsEditMode(true);
      }
    }
  }, []);

  // Form States
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const username = '';
  const password = '';
  const emailAcc = '';
  const emailPass = '';
  const [server, setServer] = useState('');
  const [level, setLevel] = useState('');
  const [rankLevel, setRankLevel] = useState('');
  const [championsCount, setChampionsCount] = useState('');
  const [skinsCount, setSkinsCount] = useState('');
  const [securityStatus, setSecurityStatus] = useState('TRANG_THONG_THIN');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedSkins, setSelectedSkins] = useState([]);
  const [skinSearch, setSkinSearch] = useState('');
  const [skinSearchFocused, setSkinSearchFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feePercent, setFeePercent] = useState(1.0);
  const [phoneZaloInput, setPhoneZaloInput] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Vui lòng đăng nhập để đăng tin bán acc!');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    accountAPI.getCategories().then(res => {
      setCategories(res.data.data);
      if (res.data.data.length > 0 && !isEditMode) {
        const lq = res.data.data.find(c => c.slug === 'lien-quan-mobile' || c.slug === 'lien-quan');
        setCategoryId(lq ? lq.id : res.data.data[0].id);
      }
    });
    accountAPI.getSkins().then(res => {
      setAvailableSkins(res.data.data);
    });
    accountAPI.getPostFeePercent().then(res => {
      if (res.data.success) {
        setFeePercent(res.data.percent);
      }
    }).catch(err => console.error("Lỗi lấy phần trăm phí:", err));
  }, []);

  // Fetch listing details for Edit Mode
  useEffect(() => {
    if (isEditMode && editId) {
      accountAPI.getById(editId)
        .then(res => {
          if (res.data.success) {
            const acc = res.data.data;
            setCategoryId(acc.category_id || '');
            setTitle(acc.title || '');
            setDescription(acc.description || '');
            setPrice(acc.price ? formatNumberString(acc.price) : '');
            setOriginalPrice(acc.original_price ? formatNumberString(acc.original_price) : '');
            setRankLevel(acc.rank_level || '');
            setChampionsCount(acc.champions_count || '');
            setSkinsCount(acc.skins_count || '');
            setSecurityStatus(acc.security_status || 'TRANG_THONG_THIN');
            setOriginalStatus(acc.status || '');
            
            // Parse images
            let imgs = [];
            if (acc.images) {
              try {
                imgs = Array.isArray(acc.images) ? acc.images : JSON.parse(acc.images);
              } catch (e) {
                console.error("Failed to parse images", e);
              }
            }
            setImages(imgs);
            
            // Set skins
            if (acc.skins_list) {
              setSelectedSkins(acc.skins_list.map(s => ({
                id: s.id,
                champion_name: s.champion_name || s.championName,
                skin_name: s.skin_name || s.skinName,
                image_url: s.image_url || s.imageUrl
              })));
            }
          }
        })
        .catch(err => {
          toast.error('Lỗi khi tải thông tin tin đăng');
          router.push('/my-accounts');
        });
    }
  }, [editId, isEditMode, router]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error('Bạn chỉ được phép tải lên tối đa 5 ảnh!');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Đang tải ảnh lên Cloudflare R2...');
    try {
      const uploadPromises = files.map(async (file) => {
        const res = await accountAPI.uploadImage(file);
        if (res.data.success) {
          return res.data.url;
        } else {
          throw new Error(res.data.message || 'Tải ảnh thất bại');
        }
      });

      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
      toast.success('Tải ảnh lên R2 thành công!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi upload ảnh lên R2', { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      if (images.length >= 5) {
        toast.error('Bạn chỉ được phép tải lên tối đa 5 ảnh!');
        return;
      }
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSkin = (skin) => {
    if (!selectedSkins.some(s => s.id === skin.id)) {
      setSelectedSkins(prev => [...prev, skin]);
    }
    setSkinSearch('');
  };

  const handleRemoveSkin = (skinId) => {
    setSelectedSkins(prev => prev.filter(s => s.id !== skinId));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (submitting) return;

    // PRD Rule 2: Zalo phone required
    const isPhoneStored = user.phone_zalo && /^0[0-9]{9}$/.test(user.phone_zalo);
    if (!isPhoneStored) {
      if (!phoneZaloInput || !/^0[0-9]{9}$/.test(phoneZaloInput)) {
        toast.error('Vui lòng nhập số điện thoại Zalo hợp lệ (10 chữ số, bắt đầu bằng 0)!');
        return;
      }
      
      // Update profile first
      try {
        setSubmitting(true);
        const updateRes = await userAPI.updateProfile({
          full_name: user.fullName || user.full_name || '',
          email: user.email || '',
          phone_zalo: phoneZaloInput,
          avatar: user.avatar || ''
        });
        if (updateRes.data.success) {
          updateUser(updateRes.data.user);
        } else {
          toast.error(updateRes.data.message || 'Lỗi khi cập nhật số điện thoại Zalo');
          setSubmitting(false);
          return;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể cập nhật số điện thoại Zalo. Vui lòng thử lại.');
        setSubmitting(false);
        return;
      }
    }

    if (calculatedFee > 0 && Number(user.balance) < calculatedFee) {
      toast.error(`Số dư ví không đủ để trả phí đăng bài (${calculatedFee.toLocaleString()}đ)! Vui lòng nạp thêm tiền.`);
      router.push('/deposit');
      return;
    }

    if (!title || !price) {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category_id: parseInt(categoryId),
        title,
        description,
        price: parseFloat(price.toString().replace(/\./g, '')) || 0,
        original_price: originalPrice ? (parseFloat(originalPrice.toString().replace(/\./g, '')) || null) : null,
        username,
        password,
        email_acc: emailAcc,
        email_pass: emailPass,
        server,
        level: level ? parseInt(level) : null,
        rank_level: rankLevel,
        champions_count: championsCount ? parseInt(championsCount) : 0,
        skins_count: skinsCount ? parseInt(skinsCount) : 0,
        security_status: securityStatus,
        images,
        skin_ids: selectedSkins.map(s => s.id)
      };

      if (isEditMode) {
        await accountAPI.update(editId, payload);
        toast.success(calculatedFee > 0 
          ? `Cập nhật thành công! Đã trừ ${calculatedFee.toLocaleString()}đ phí đăng bài.`
          : 'Cập nhật tin đăng thành công!'
        );
      } else {
        await accountAPI.create(payload);
        toast.success(`Đăng tin thành công! Đã trừ ${calculatedFee.toLocaleString()}đ phí treo bài.`);
      }
      
      await reloadUser();
      router.push('/my-accounts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkins = skinSearch.trim() === ''
    ? []
    : availableSkins.filter(skin => {
      const champ = skin.champion_name || skin.championName || '';
      const name = skin.skin_name || skin.skinName || '';
      const fullName = `${champ} ${name}`.toLowerCase();
      const searchVal = skinSearch.toLowerCase();
      return fullName.includes(searchVal) || removeAccents(fullName).includes(removeAccents(searchVal));
    }).slice(0, 8);

  const ranks = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Tinh Anh', 'Cao Thủ', 'Chiến Tướng', 'Thách Đấu'];

  // Only charge fee on create, or on edit if the listing was REJECTED
  const isRejected = originalStatus === 'REJECTED';
  const cleanPrice = Number(price.toString().replace(/\./g, '') || 0);
  const calculatedFee = (!isEditMode || isRejected) ? Math.round(cleanPrice * (feePercent / 100)) : 0;
  
  const hasInsufficientBalance = user && Number(user.balance) < calculatedFee;
  const hasMissingZalo = user && (!user.phone_zalo || !/^0[0-9]{9}$/.test(user.phone_zalo));

  return (
    <div className="page-container" style={{ background: 'var(--bg-dark)' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Header Block */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isEditMode ? 'Chỉnh Sửa Tin Đăng' : 'Đăng Tin Bán Tài Khoản Game'}
          </h1>
          <p className="page-subtitle">
            {isEditMode ? 'Cập nhật lại thông tin tài khoản của bạn. Tin đăng sẽ được gửi duyệt lại.' : 'Định giá tài khoản theo ý bạn và tiếp cận hàng ngàn người mua tiềm năng qua Zalo.'}
          </p>
        </div>

        {/* Warning Banners */}
        {hasInsufficientBalance && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(229,62,62,0.05)'
          }}>
            <FiAlertCircle size={24} style={{ color: '#e53e3e', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 14, color: '#2d3748', lineHeight: 1.5 }}>
              <strong>Số dư tài khoản không đủ!</strong> Bạn hiện có <strong>{Number(user.balance).toLocaleString()}đ</strong> trong ví. Cần tối thiểu <strong>{calculatedFee.toLocaleString()}đ ({feePercent}%)</strong> để thanh toán phí đăng bài cho giá trị acc này.
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/deposit')} style={{ borderRadius: 6 }}>Nạp tiền ngay</button>
          </div>
        )}

        {/* Missing Zalo check removed - handled via inline form input below */}

        {/* Side-by-side Grid Layout */}
        <div className="sell-grid">
          {/* Left Column: Form Details */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 1: Basic display info */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14
                }}>1</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Thông Tin Hiển Thị Bài Đăng</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Tiêu đề tin đăng *</label>
                  <input
                    className="form-control"
                    placeholder="Ví dụ: Acc Liên Quân siêu ngon có Nakroth Lôi Quang Sứ..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Mô tả chi tiết tài khoản</label>
                  <textarea
                    className="form-control"
                    placeholder="Viết mô tả chi tiết: kho ngọc, danh sách tướng chính, thành tích nổi bật..."
                    style={{ minHeight: 100, resize: 'vertical', borderRadius: 'var(--radius)' }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Giá bán mong muốn (VNĐ) *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Ví dụ: 150.000"
                        value={price}
                        onChange={e => setPrice(formatNumberString(e.target.value))}
                        required
                        style={{ paddingLeft: 30, borderRadius: 'var(--radius)' }}
                      />
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>đ</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Giá gốc ban đầu (nếu có)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Để trống nếu không giảm giá"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(formatNumberString(e.target.value))}
                        style={{ paddingLeft: 30, borderRadius: 'var(--radius)' }}
                      />
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>đ</span>
                    </div>
                  </div>
                </div>

                {hasMissingZalo && (
                  <div style={{ marginTop: 8 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary)' }}>Số điện thoại Zalo liên hệ *</label>
                    <input
                      className="form-control"
                      placeholder="Nhập số điện thoại Zalo (ví dụ: 0901234567)"
                      value={phoneZaloInput}
                      onChange={e => setPhoneZaloInput(e.target.value)}
                      required
                      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Số điện thoại này sẽ được lưu vào tài khoản của bạn để người mua có thể liên hệ trực tiếp qua Zalo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Game details */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14
                }}>2</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Thông Số Chi Tiết Trong Game</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><FiSliders size={13} /> Hạng (Rank)</label>
                    <select className="form-control" value={rankLevel} onChange={e => setRankLevel(e.target.value)} style={{ borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                      <option value="">-- Chọn Rank --</option>
                      {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><FiShield size={13} /> Bảo mật</label>
                    <select className="form-control" value={securityStatus} onChange={e => setSecurityStatus(e.target.value)} style={{ borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                      <option value="TRANG_THONG_THIN">Trắng thông tin</option>
                      <option value="DINH_THONG_THIN">Dính thông tin (Có SĐT/Mail)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Số Tướng sở hữu</label>
                    <input className="form-control" type="number" placeholder="Ví dụ: 80" value={championsCount} onChange={e => setChampionsCount(e.target.value)} style={{ borderRadius: 'var(--radius)' }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Số Skin sở hữu</label>
                    <input className="form-control" type="number" placeholder="Ví dụ: 100" value={skinsCount} onChange={e => setSkinsCount(e.target.value)} style={{ borderRadius: 'var(--radius)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Highlight skins tag */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)', overflow: 'visible', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14
                }}>3</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Trang phục nổi bật</h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Chọn các skin hot để khách tìm thấy nhanh hơn.</p>

              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  placeholder="Gõ tìm kiếm tướng hoặc trang phục..."
                  value={skinSearch}
                  onChange={e => setSkinSearch(e.target.value)}
                  onFocus={() => setSkinSearchFocused(true)}
                  onBlur={() => setSkinSearchFocused(false)}
                  style={{ borderRadius: 'var(--radius)' }}
                />

                {skinSearchFocused && filteredSkins.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 200,
                    maxHeight: 220,
                    overflowY: 'auto'
                  }}>
                    {filteredSkins.map(skin => (
                      <div
                        key={skin.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddSkin(skin);
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <img src={skin.image_url || skin.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{skin.champion_name || skin.championName} - {skin.skin_name || skin.skinName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedSkins.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  {selectedSkins.map(skin => (
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
                      <FiTag size={10} style={{ color: 'var(--primary)' }} />
                      <span>{skin.champion_name || skin.championName} - {skin.skin_name || skin.skinName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkin(skin.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <FiTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Right Column: Upload and Payment Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 4: Image Upload */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
                <FiImage style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Hình Ảnh Minh Họa</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Upload drag-drop box */}
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--bg-input)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <input type="file" multiple onChange={handleFileUpload} accept="image/*" disabled={uploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: uploading ? 'not-allowed' : 'pointer' }} />
                  <FiUploadCloud size={28} style={{ color: uploading ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {uploading ? 'Đang tải ảnh lên...' : 'Kéo thả hoặc Click để tải ảnh'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tối đa 5 ảnh chụp kho đồ, trang phục</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>Hoặc nhập Link ảnh trực tiếp</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder="https://..."
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      style={{ fontSize: 13, padding: '8px 12px', borderRadius: 'var(--radius)' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddImageUrl}
                      style={{ padding: '0 12px', borderRadius: 'var(--radius)' }}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8, marginTop: 10 }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={img} alt="Detail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          style={{
                            position: 'absolute', top: 4, right: 4, background: 'rgba(229,57,53,0.9)', color: 'white',
                            border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                          }}
                        >
                          <FiTrash size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payout & Terms Card */}
            <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-input)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiInfo style={{ color: 'var(--gold)' }} />
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Chính sách giao dịch</h4>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Phí đăng tin là <strong>{feePercent}% giá trị tài khoản</strong> ({calculatedFee.toLocaleString()}đ) sẽ được trừ trực tiếp vào số dư ví của bạn khi nhấn treo bài.</li>
                <li>Không yêu cầu bạn nhập mật khẩu game. Người mua sẽ chủ động inbox Zalo để xem acc và chốt giá.</li>
                <li>Nếu người mua thanh toán qua cổng <strong>Escrow Trung Gian</strong> của sàn, tiền sẽ đóng băng. Sau khi bạn bàn giao và người mua đổi thông tin thành công, sàn sẽ giải ngân cho bạn (phí trung gian 3% do admin thu).</li>
              </ul>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phí dịch vụ ({feePercent}%):</span>
                  <span style={{ color: 'var(--primary)' }}>{calculatedFee.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Số dư hiện tại:</span>
                  <span style={{ color: user && Number(user.balance) >= calculatedFee ? 'var(--success)' : 'var(--danger)' }}>
                    {user ? Number(user.balance).toLocaleString() : 0}đ
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => router.push('/')}
                    style={{ flex: 1, borderRadius: 'var(--radius)' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting || hasInsufficientBalance}
                    style={{ flex: 1.5, borderRadius: 'var(--radius)', gap: 6, justifyContent: 'center' }}
                  >
                    <FiDollarSign /> {submitting ? 'Đang gửi...' : 'Đăng Bài'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .sell-grid { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 28px; }
        @media (max-width: 900px) {
          .sell-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}
