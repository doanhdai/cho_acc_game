'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingContact() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  const adminZalo = process.env.NEXT_PUBLIC_ADMIN_ZALO || '0325459901';
  const adminTelegram = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM || '@Hoangshady';

  // Định dạng link Zalo (nếu là số điện thoại thì dùng zalo.me/sdt, nếu là link sẵn thì giữ nguyên)
  const zaloLink = adminZalo.startsWith('http') ? adminZalo : `https://zalo.me/${adminZalo.replace(/\s+/g, '')}`;
  // Định dạng link Telegram
  const telegramLink = adminTelegram.startsWith('http') ? adminTelegram : `https://t.me/${adminTelegram.replace('@', '')}`;

  return (
    <>
      <div className="floating-contact-container">
        {/* Nút Zalo */}
        <a 
          href={zaloLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="floating-btn zalo-btn"
          aria-label="Liên hệ Zalo hỗ trợ"
        >
          <span className="tooltip-text">Zalo hỗ trợ</span>
          <div className="pulse-ring"></div>
          <img src="/zalo_img.png" alt="Zalo" className="icon-img" />
        </a>

        {/* Nút Telegram */}
        <a 
          href={telegramLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="floating-btn telegram-btn"
          aria-label="Liên hệ Telegram hỗ trợ"
        >
          <span className="tooltip-text">Telegram hỗ trợ</span>
          <div className="pulse-ring"></div>
          <img src="/telegram_img.png" alt="Telegram" className="icon-img" />
        </a>
      </div>
    </>
  );
}
