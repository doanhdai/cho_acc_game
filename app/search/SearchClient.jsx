'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { accountAPI } from '@/lib/api';
import AccountCard from '@/components/ui/AccountCard';
import { Spinner, Pagination } from '@/components/common';
import { FiSearch, FiFrown, FiFilter, FiChevronDown, FiChevronUp, FiX, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableSkins, setAvailableSkins] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter States
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const priceMin = searchParams.get('price_min') || '';
  const priceMax = searchParams.get('price_max') || '';
  const rankLevel = searchParams.get('rank_level') || '';
  const selectedSkinIdsStr = searchParams.get('skin_ids') || '';

  const [query, setQuery] = useState(q);
  const [minPriceInput, setMinPriceInput] = useState(priceMin ? formatNumberString(priceMin) : '');
  const [maxPriceInput, setMaxPriceInput] = useState(priceMax ? formatNumberString(priceMax) : '');
  const [selectedRank, setSelectedRank] = useState(rankLevel);
  const [selectedSkins, setSelectedSkins] = useState([]);
  const [skinSearch, setSkinSearch] = useState('');
  const [skinSearchFocused, setSkinSearchFocused] = useState(false);

  useEffect(() => {
    accountAPI.getCategories().then(res => setCategories(res.data.data));
    accountAPI.getSkins().then(res => {
      setAvailableSkins(res.data.data);
      // Populate selectedSkins from URL params if present
      if (selectedSkinIdsStr) {
        const ids = selectedSkinIdsStr.split(',').map(Number);
        const mapped = res.data.data.filter(s => ids.includes(s.id));
        setSelectedSkins(mapped);
      }
    });
  }, [selectedSkinIdsStr]);

  const fetchFilteredAccounts = () => {
    setLoading(true);
    const skinIds = selectedSkins.map(s => s.id).join(',');
    
    accountAPI.getAll({
      search: q,
      category,
      price_min: priceMin ? parseFloat(priceMin.toString().replace(/\./g, '')) : undefined,
      price_max: priceMax ? parseFloat(priceMax.toString().replace(/\./g, '')) : undefined,
      rank_level: rankLevel || undefined,
      skin_ids: skinIds || undefined,
      page,
      limit: 12
    })
    .then(res => {
      setAccounts(res.data.data);
      setTotal(res.data.total);
    })
    .catch(err => {
      toast.error('Lỗi tìm kiếm tài khoản');
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFilteredAccounts();
  }, [q, category, priceMin, priceMax, rankLevel, selectedSkins, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (minPriceInput) params.price_min = minPriceInput.toString().replace(/\./g, '');
    if (maxPriceInput) params.price_max = maxPriceInput.toString().replace(/\./g, '');
    if (selectedRank) params.rank_level = selectedRank;
    if (selectedSkins.length > 0) {
      params.skin_ids = selectedSkins.map(s => s.id).join(',');
    }
    const qs = new URLSearchParams(params).toString(); router.push('/search' + (qs ? '?' + qs : ''));
    setPage(1);
  };

  const handleCategory = (slug) => {
    const newCategory = slug === category ? '' : slug;
    const params = {};
    if (query) params.q = query;
    if (newCategory) params.category = newCategory;
    if (minPriceInput) params.price_min = minPriceInput.toString().replace(/\./g, '');
    if (maxPriceInput) params.price_max = maxPriceInput.toString().replace(/\./g, '');
    if (selectedRank) params.rank_level = selectedRank;
    if (selectedSkins.length > 0) {
      params.skin_ids = selectedSkins.map(s => s.id).join(',');
    }
    const qs = new URLSearchParams(params).toString(); router.push('/search' + (qs ? '?' + qs : ''));
    setPage(1);
  };

  const handleResetFilters = () => {
    setQuery('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSelectedRank('');
    setSelectedSkins([]);
    router.push('/search');
    setPage(1);
  };

  const handleAddSkin = (skin) => {
    if (!selectedSkins.some(s => s.id === skin.id)) {
      const newList = [...selectedSkins, skin];
      setSelectedSkins(newList);
    }
    setSkinSearch('');
  };

  const handleRemoveSkin = (skinId) => {
    setSelectedSkins(prev => prev.filter(s => s.id !== skinId));
  };

  const filteredSkinSuggestions = skinSearch.trim() === ''
    ? []
    : availableSkins.filter(skin => {
        const champ = skin.champion_name || skin.championName || '';
        const name = skin.skin_name || skin.skinName || '';
        const fullName = `${champ} ${name}`.toLowerCase();
        const searchVal = skinSearch.toLowerCase();
        return fullName.includes(searchVal) || removeAccents(fullName).includes(removeAccents(searchVal));
      }).slice(0, 5);

  const ranks = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Tinh Anh', 'Cao Thủ', 'Chiến Tướng', 'Thách Đấu'];

  return (
    <div style={{ padding: '40px 0', background: 'var(--bg-body)' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiSearch style={{ color: 'var(--primary)' }} /> Tìm Kiếm & Lọc Tài Khoản Game
          </h1>
          <p className="page-subtitle">Tìm acc game C2C phù hợp nhất thông qua các bộ lọc thông minh</p>
        </div>

        {/* Search Input and Filter Toggle */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 280 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nhập tiêu đề acc, mô tả..." />
              <button type="submit"><FiSearch /></button>
            </div>
            
            <button type="button" className="btn btn-outline" style={{ gap: 8 }} onClick={() => setShowAdvanced(!showAdvanced)}>
              <FiFilter /> Bộ lọc nâng cao {showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            <button type="button" className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleResetFilters}>
              Xóa bộ lọc
            </button>
          </form>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div>
                <label className="label">Giá tối thiểu (đ)</label>
                <input className="input" type="text" placeholder="Ví dụ: 100.000" value={minPriceInput} onChange={e => setMinPriceInput(formatNumberString(e.target.value))} />
              </div>
              
              <div>
                <label className="label">Giá tối đa (đ)</label>
                <input className="input" type="text" placeholder="Ví dụ: 2.000.000" value={maxPriceInput} onChange={e => setMaxPriceInput(formatNumberString(e.target.value))} />
              </div>

              <div>
                <label className="label">Hạng (Rank)</label>
                <select className="input" value={selectedRank} onChange={e => setSelectedRank(e.target.value)}>
                  <option value="">Tất cả các Rank</option>
                  {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <label className="label">Lọc theo skin sở hữu</label>
                 <input 
                  className="input" 
                  placeholder="Gõ Violet, Nakroth..." 
                  value={skinSearch} 
                  onChange={e => setSkinSearch(e.target.value)} 
                  onFocus={() => setSkinSearchFocused(true)}
                  onBlur={() => setSkinSearchFocused(false)}
                />
                {skinSearchFocused && filteredSkinSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {filteredSkinSuggestions.map(skin => (
                      <div key={skin.id} onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddSkin(skin);
                      }}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <img src={skin.image_url || skin.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3 }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{skin.champion_name || skin.championName} - {skin.skin_name || skin.skinName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedSkins.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {selectedSkins.map(s => (
                <div key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                  <FiTag size={10} />
                  <span>{s.champion_name || s.championName} - {s.skin_name || s.skinName}</span>
                  <button onClick={() => handleRemoveSkin(s.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}><FiX size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {showAdvanced && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-primary btn-sm" onClick={updateSearchParams}>Áp Dụng Bộ Lọc</button>
            </div>
          )}
        </div>

        {/* Category Filters hidden temporarily as we only serve Liên Quân Mobile */}

        {/* Accounts List */}
        {loading ? <Spinner /> : (
          <>
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>Tìm thấy <strong>{total}</strong> kết quả phù hợp</div>
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
              {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
            </div>
            {accounts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}><FiFrown /></div>
                <p>Không tìm thấy acc nào phù hợp với bộ lọc hiện tại. Thử reset hoặc đổi từ khóa!</p>
              </div>
            )}
            <Pagination page={page} total={total} limit={12} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Spinner />
        <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Đang tải danh sách tài khoản...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
