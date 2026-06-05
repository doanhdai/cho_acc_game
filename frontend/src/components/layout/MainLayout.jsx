import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function MainLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-card2)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
        }}
      />
      
      {/* Floating Action Buttons for Admin Contact */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        <a 
          href="https://t.me/Hoangshady" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Liên hệ Telegram Admin"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <img 
            src="/telegram_img.png" 
            alt="Telegram" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} 
          />
        </a>
        
        <a 
          href="https://zalo.me/0325459901" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Liên hệ Zalo Admin"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <img 
            src="/zalo_img.png" 
            alt="Zalo" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} 
          />
        </a>
      </div>
    </div>
  );
}
