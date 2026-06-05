import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { newsAPI } from '../../api';
import { Spinner, formatDate } from '../../components/common';

function NewsListPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  useEffect(() => {
    setLoading(true);
    newsAPI.getAll({ category, limit: 20 }).then(res => setNews(res.data.data)).finally(() => setLoading(false));
  }, [category]);
  const cats = [['', 'Tất Cả'], ['news', 'Tin Tức'], ['guide', 'Hướng Dẫn'], ['event', 'Sự Kiện'], ['update', 'Cập Nhật']];
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 8 }}>📰 Tin Tức</h1>
        <p className="page-subtitle" style={{ marginBottom: 28 }}>Cập nhật tin tức, sự kiện mới nhất</p>
        <div className="filter-tags" style={{ marginBottom: 28 }}>
          {cats.map(([v, l]) => <button key={v} className={`filter-tag ${category === v ? 'active' : ''}`} onClick={() => setCategory(v)}>{l}</button>)}
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-3">
            {news.map(n => (
              <Link key={n.id} to={`/news/${n.slug}`} className="card" style={{ textDecoration: 'none' }}>
                <img src={n.thumbnail} alt={n.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{n.category}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{n.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 12 }}>{n.excerpt}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{n.author}</span><span>{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewsDetailPage() {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    newsAPI.getBySlug(slug).then(res => setNews(res.data.data)).finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <Spinner />;
  if (!news) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Không tìm thấy bài viết</div>;
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/news" style={{ color: 'var(--primary)', fontSize: 13, display: 'inline-block', marginBottom: 20 }}>← Quay lại tin tức</Link>
        <img src={news.thumbnail} alt={news.title} style={{ width: '100%', borderRadius: 16, aspectRatio: '16/9', objectFit: 'cover', marginBottom: 28 }} />
        <div style={{ fontSize: 11, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>{news.category}</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>{news.title}</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28, display: 'flex', gap: 16 }}>
          <span>✍️ {news.author}</span><span>📅 {new Date(news.created_at).toLocaleDateString('vi-VN')}</span><span>👁️ {news.view_count} lượt xem</span>
        </div>
        <div className="divider" />
        <div
          style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 16, marginTop: 24 }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </div>
  );
}

export { NewsListPage, NewsDetailPage };
