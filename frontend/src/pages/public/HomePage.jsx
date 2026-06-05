import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountAPI } from '../../api';
import AccountCard from '../../components/ui/AccountCard';
import { Spinner } from '../../components/common';
import { FiArrowRight, FiStar, FiCheckCircle, FiShield, FiUsers, FiTag, FiFilter, FiX } from 'react-icons/fi';

const ranks = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Tinh Anh', 'Cao Thủ', 'Chiến Tướng', 'Thách Đấu'];

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const formatNumberString = (val) => {
  if (val === null || val === undefined) return '';
  const clean = val.toString().replace(/\D/g, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function HomePage() {
  const [accounts, setAccounts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [skins, setSkins] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // Filter input states
  const [query, setQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedSkins, setSelectedSkins] = useState([]);
  const [skinSearch, setSkinSearch] = useState('');
  const [skinSearchFocused, setSkinSearchFocused] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    query: '',
    rank: '',
    skin: '',
    priceMin: '',
    priceMax: ''
  });

  useEffect(() => {
    accountAPI.getSkins()
      .then(res => setSkins(res.data.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setFiltering(true);
    const params = { limit: 8 };

    if (appliedFilters.skin) {
      params.skin_ids = appliedFilters.skin;
    }
    if (appliedFilters.rank) {
      params.rank_level = appliedFilters.rank;
    }
    if (appliedFilters.query) {
      params.search = appliedFilters.query;
    }
    if (appliedFilters.priceMin) {
      params.price_min = parseFloat(appliedFilters.priceMin.toString().replace(/\./g, ''));
    }
    if (appliedFilters.priceMax) {
      params.price_max = parseFloat(appliedFilters.priceMax.toString().replace(/\./g, ''));
    }

    // Default to featured when no filter is applied
    if (!appliedFilters.skin && !appliedFilters.rank && !appliedFilters.query && !appliedFilters.priceMin && !appliedFilters.priceMax) {
      params.featured = true;
    }

    accountAPI.getAll(params)
      .then(res => {
        setAccounts(res.data.data);
        setTotalCount(res.data.total || 0);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setInitialLoading(false);
        setFiltering(false);
      });
  }, [appliedFilters]);

  const filteredSkinSuggestions = skins.filter(skin => {
    const champ = skin.champion_name || skin.championName || '';
    const name = skin.skin_name || skin.skinName || '';
    const fullName = `${champ} ${name}`.toLowerCase();
    const searchVal = skinSearch.toLowerCase();
    return fullName.includes(searchVal) || removeAccents(fullName).includes(removeAccents(searchVal));
  }).slice(0, 30);

  const handleAddSkin = (skin) => {
    if (!selectedSkins.some(s => s.id === skin.id)) {
      setSelectedSkins([...selectedSkins, skin]);
    }
    setSkinSearch('');
  };

  const handleRemoveSkin = (skinId) => {
    setSelectedSkins(prev => prev.filter(s => s.id !== skinId));
  };

  const handleApply = () => {
    const skinIds = selectedSkins.map(s => s.id).join(',');
    setAppliedFilters({
      query,
      rank: selectedRank,
      skin: skinIds,
      priceMin,
      priceMax
    });
  };

  const handleReset = () => {
    setQuery('');
    setSelectedRank('');
    setSelectedSkins([]);
    setSkinSearch('');
    setPriceMin('');
    setPriceMax('');
    setAppliedFilters({
      query: '',
      rank: '',
      skin: '',
      priceMin: '',
      priceMax: ''
    });
  };

  if (initialLoading) return <Spinner />;

  return (
    <div>
      {/* Banner */}
      <section style={{ width: '100%' }}>
        <img src="/banner.png" alt="Shop Acc Game Banner" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </section>


      {/* Featured Accounts */}
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          {/* Advanced Filter Panel */}
          <div style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '24px', 
            marginBottom: 36,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <FiFilter style={{ color: 'var(--primary)' }} /> Tìm Kiếm
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Search text */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Từ khóa</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Nakroth, ngọc..." 
                  value={query} 
                  onChange={e => setQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    padding: '10px 14px', 
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }} 
                />
              </div>

              {/* Rank selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Hạng (Rank)</label>
                <select 
                  value={selectedRank} 
                  onChange={e => setSelectedRank(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    padding: '10px 14px', 
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Tất cả hạng</option>
                  {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Skin selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Trang phục (Skin)</label>
                <input 
                  type="text"
                  placeholder="Chọn hoặc gõ tên skin..." 
                  value={skinSearch} 
                  onChange={e => setSkinSearch(e.target.value)}
                  onFocus={() => setSkinSearchFocused(true)}
                  onBlur={() => setSkinSearchFocused(false)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    padding: '10px 14px', 
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }} 
                />
                {skinSearchFocused && filteredSkinSuggestions.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    zIndex: 20, 
                    maxHeight: '220px',
                    overflowY: 'auto', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)' 
                  }}>
                    {filteredSkinSuggestions.map(skin => (
                      <div key={skin.id} onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddSkin(skin);
                      }}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <img src={skin.image_url || skin.imageUrl} alt="" style={{ width: 36, height: 27, objectFit: 'cover', borderRadius: 3 }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{skin.champion_name || skin.championName} - {skin.skin_name || skin.skinName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

               {/* Price filter */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Khoảng giá (VNĐ)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="text" 
                    placeholder="Từ" 
                    value={priceMin} 
                    onChange={e => setPriceMin(formatNumberString(e.target.value))}
                    style={{ 
                      width: '100%', 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius)', 
                      padding: '10px 12px', 
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }} 
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>
                  <input 
                    type="text" 
                    placeholder="Đến" 
                    value={priceMax} 
                    onChange={e => setPriceMax(formatNumberString(e.target.value))}
                    style={{ 
                      width: '100%', 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius)', 
                      padding: '10px 12px', 
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }} 
                  />
                </div>
              </div>
            </div>

            {selectedSkins.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {selectedSkins.map(s => (
                  <div key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 4, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                    <FiTag size={10} style={{ color: 'var(--primary)' }} />
                    <span>{s.champion_name || s.championName} - {s.skin_name || s.skinName}</span>
                    <button onClick={() => handleRemoveSkin(s.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: 0 }}><FiX size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Filter buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={handleReset} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)', 
                  padding: '10px 20px', 
                  color: 'var(--text-secondary)', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                Nhập Lại
              </button>
              <button 
                onClick={handleApply} 
                style={{ 
                  background: 'var(--primary)', 
                  border: 'none', 
                  borderRadius: 'var(--radius)', 
                  padding: '10px 24px', 
                  color: 'white', 
                  fontSize: 14, 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Áp Dụng
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiStar style={{ color: 'var(--gold)' }} /> Tài Khoản Nổi Bật
              </h2>
              <p className="page-subtitle">Các bài đăng bán được xem nhiều nhất</p>
            </div>
            {totalCount >= 30 && (
              <Link to="/search" className="btn btn-outline btn-sm">Xem tất cả <FiArrowRight /></Link>
            )}
          </div>

          {filtering ? (
            <Spinner />
          ) : accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Không tìm thấy tài khoản game nào khớp với skin đã chọn.
            </div>
          ) : (
            <div className="grid grid-4">
              {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
            </div>
          )}
        </div>
      </section>

      {/* Call to action for Sellers */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 20,
            padding: '40px 60px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>Bạn có tài khoản game không dùng đến?</h2>
              <p style={{ fontSize: 14, color: '#c7d2fe' }}>Đăng bán ngay trên sàn với mức phí siêu rẻ 5.000đ. Đảm bảo thanh toán an toàn, không lo lừa đảo.</p>
            </div>
            <Link to="/sell" className="btn btn-primary" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 28px', fontSize: 14, fontWeight: 700 }}>Đăng bán acc ngay</Link>
          </div>
        </div>
      </section>

      {/* C2C Marketplace Benefits */}
      <section className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'center' }}>
          <div style={{ padding: 20 }}>
            <FiShield size={36} style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Giao Dịch Escrow 100% An Toàn</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Số tiền người mua thanh toán sẽ được khóa tạm thời và chỉ được giải ngân cho người bán khi giao dịch đổi thông tin hoàn tất.</p>
          </div>
          <div style={{ padding: 20 }}>
            <FiUsers size={36} style={{ color: 'var(--gold)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Chợ C2C Người Với Người</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Cho phép người chơi tự đăng bài bán acc game với giá mong muốn. Phí niêm yết bài chỉ 5,000đ cực rẻ.</p>
          </div>
          <div style={{ padding: 20 }}>
            <FiCheckCircle size={36} style={{ color: 'var(--success)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Hỗ Trợ 3 Bên Trực Tiếp</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Mỗi đơn hàng có một phòng chat riêng gồm Người Mua, Người Bán và Admin để hướng dẫn đổi thông tin chi tiết.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
