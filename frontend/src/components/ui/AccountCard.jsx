import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../common';

export default function AccountCard({ account }) {
  const { 
    id, 
    title, 
    price, 
    original_price, 
    rank_level, 
    champions_count, 
    skins_count, 
    category_name 
  } = account;
  
  let images = [];
  if (account.images) {
    try {
      images = Array.isArray(account.images) ? account.images : JSON.parse(account.images);
    } catch (e) {
      console.error(e);
    }
  }
  const imgUrl = images.length > 0 ? images[0] : '/image.png';

  return (
    <div className="card account-card">
      <div className="card-img-wrap">
        <Link to={`/accounts/${id}`}>
          <img src={imgUrl} alt={title} loading="lazy" />
        </Link>
        <div className="card-overlay-badge-left">
          {`Q${id.toString().padStart(3, '0')}`}
        </div>
        {category_name && (
          <div className="card-overlay-badge-right">
            {category_name}
          </div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/accounts/${id}`} title={title}>{title}</Link>
        </h3>
        
        <div className="card-specs">
          {rank_level && (
            <span className="spec-chip" title="Hạng / Rank">
              {rank_level}
            </span>
          )}
          {champions_count > 0 && (
            <span className="spec-chip" title="Số tướng sở hữu">
              {champions_count} Tướng
            </span>
          )}
          {skins_count > 0 && (
            <span className="spec-chip" title="Số trang phục sở hữu">
              {skins_count} Trang phục
            </span>
          )}
        </div>
        
        <div className="card-footer-new">
          <div className="price-block">
            {original_price > price && (
              <span className="original-price">{formatMoney(original_price)}</span>
            )}
            <span className="current-price">{formatMoney(price)}</span>
          </div>
          <Link to={`/accounts/${id}`} className="btn-buy-new">
            Xem chi tiết
          </Link>
        </div>
      </div>
      <style>{`
        .account-card { 
          background: var(--bg-card); 
          border: 1px solid var(--border);
          border-radius: 10px; 
          overflow: hidden; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          color: var(--text-primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .account-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          border-color: var(--primary-glow);
        }
        .card-img-wrap { 
          position: relative; 
          width: 100%; 
          aspect-ratio: 16/9; 
          overflow: hidden; 
          background: #000;
        }
        .card-img-wrap img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.5s ease;
        }
        .account-card:hover .card-img-wrap img {
          transform: scale(1.06);
        }
        .card-overlay-badge-left {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--primary);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(229, 57, 53, 0.4);
        }
        .card-overlay-badge-right {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .card-body { 
          padding: 14px; 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
        }
        .card-title { 
          font-size: 14px; 
          font-weight: 700; 
          line-height: 1.4;
          margin-bottom: 10px; 
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical; 
          overflow: hidden; 
          height: 40px;
        }
        .card-title a { 
          color: var(--text-primary); 
          text-decoration: none; 
          transition: color 0.2s;
        }
        .card-title a:hover {
          color: var(--primary);
        }
        .card-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
          min-height: 24px;
        }
        .spec-chip {
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .card-footer-new { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: auto;
        }
        .price-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .original-price {
          text-decoration: line-through;
          color: var(--text-muted);
          font-size: 11px;
        }
        .current-price {
          color: var(--primary);
          font-size: 15px;
          font-weight: 800;
        }
        .btn-buy-new { 
          background: var(--primary); 
          color: #fff; 
          padding: 6px 12px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: 700; 
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(229, 57, 53, 0.2);
        }
        .btn-buy-new:hover { 
          background: var(--primary-dark); 
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
