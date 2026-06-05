import React, { useState } from 'react';
import { userAPI } from '../../api';
import toast from 'react-hot-toast';
import { formatMoney } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { FiCopy, FiCheckCircle, FiInfo, FiDollarSign, FiCreditCard, FiCheck } from 'react-icons/fi';
import { RiQrCodeLine } from 'react-icons/ri';

export default function DepositPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ amount: '', method: 'bank_transfer', transaction_ref: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const quickAmounts = [20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Đã sao chép ' + fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.amount || parseInt(form.amount) < 10000) { 
      toast.error('Số tiền tối thiểu 10,000đ'); 
      return; 
    }
    setLoading(true);
    try {
      await userAPI.createDeposit(form);
      toast.success('Đã gửi yêu cầu nạp tiền thành công!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const bankAccount = {
    no: '1050849641',
    name: 'DO ANH DAI',
    bank: 'Vietcombank',
    bin: '970436'
  };

  const noteContent = `${user?.username || 'user'} nap tien`;
  const qrUrl = `https://api.vietqr.io/image/${bankAccount.bin}-${bankAccount.no}-VjKqKjZ.jpg?amount=${form.amount || 0}&addInfo=${encodeURIComponent(noteContent)}&accountName=${encodeURIComponent(bankAccount.name)}`;

  return (
    <div className="deposit-page" style={{ padding: '40px 0', background: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 1140 }}>
        
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 800, margin: 0 }}>
              <FiDollarSign style={{ color: 'var(--primary)' }} /> Nạp Tiền Tài Khoản
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Cổng thanh toán tự động VietQR - Duyệt tự động 24/7.
            </p>
          </div>
          
          <div className="balance-badge" style={{ 
            background: 'rgba(217,119,6,0.06)', 
            border: '1px solid rgba(217,119,6,0.2)', 
            padding: '10px 20px', 
            borderRadius: 12, 
            fontSize: 14, 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Số dư hiện tại: <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 18 }}>{formatMoney(user?.balance)}</span>
          </div>
        </div>

        {/* Deposit Main Layout */}
        <div className="deposit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 28 }}>
          
          {/* Left Column: Form & Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Payment Method Block (Locked to Bank Transfer) */}
            <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCreditCard style={{ color: 'var(--primary)' }} /> Phương Thức Thanh Toán
              </h3>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '16px 20px', 
                borderRadius: 12, 
                border: '2px solid var(--primary)', 
                background: 'var(--primary-glow)',
                position: 'relative'
              }}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 10, 
                  background: 'var(--primary)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 20, 
                  marginRight: 16,
                  flexShrink: 0
                }}>
                  <FiCreditCard />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Chuyển Khoản Ngân Hàng (VietQR) 
                    <span style={{ fontSize: 10, background: 'var(--success)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Tự động</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Duyệt tự động siêu tốc qua API trong vòng 1-3 phút.</div>
                </div>
                <div style={{ 
                  width: 18, 
                  height: 18, 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 10 
                }}>
                  <FiCheck />
                </div>
              </div>
            </div>

            {/* Amount Selection Block */}
            <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiDollarSign style={{ color: 'var(--primary)' }} /> Chọn Số Tiền Cần Nạp
              </h3>
              
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input 
                  className="form-control" 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  placeholder="Nhập số tiền (VNĐ)" 
                  min={10000} 
                  style={{ 
                    fontSize: 24, 
                    fontWeight: 700, 
                    padding: '16px 20px 16px 40px', 
                    borderRadius: 12,
                    height: 'auto',
                    color: 'var(--gold)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)'
                  }}
                />
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: 'var(--text-muted)' }}>đ</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {quickAmounts.map(a => (
                  <button 
                    key={a} 
                    type="button" 
                    onClick={() => setForm({...form, amount: a})}
                    style={{
                      background: form.amount === a ? 'var(--primary)' : 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      color: form.amount === a ? '#fff' : 'var(--text-secondary)',
                      padding: '12px 6px',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 13,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {a.toLocaleString().replace(/,/g, '.')}đ
                  </button>
                ))}
              </div>

              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                <FiInfo /> Tối thiểu 10.000đ. Vui lòng điền đúng nội dung để được cộng tiền tự động.
              </p>
            </div>

            {/* Confirm Step */}
            <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCheckCircle style={{ color: 'var(--primary)' }} /> Xác Nhận Đã Chuyển Khoản
              </h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Mã tham chiếu / Mã giao dịch (Tùy chọn)</label>
                  <input 
                    className="form-control" 
                    value={form.transaction_ref} 
                    onChange={e => setForm({...form, transaction_ref: e.target.value})} 
                    placeholder="Mã giao dịch ngân hàng (Ví dụ: FT2345...)" 
                    style={{ borderRadius: 8 }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>Nhập mã giao dịch sẽ giúp admin đối soát nhanh hơn nếu hệ thống auto bị chậm.</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !form.amount}
                  style={{
                    width: '100%',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận đã chuyển tiền'}
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: QR Code & Bank Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* QR Card */}
            <div className="card" style={{ 
              borderRadius: 16, 
              border: '1px solid var(--border)', 
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg-input)', borderBottom: '1px dashed var(--border)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RiQrCodeLine size={18} style={{ color: 'var(--primary)' }} /> Quét Mã QR VietQR
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Mở ứng dụng ngân hàng của bạn và quét mã QR dưới đây</p>
              </div>

              <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>
                <div style={{ 
                  padding: 12, 
                  background: '#fff', 
                  borderRadius: 12, 
                  border: '1px solid #e2e8f0', 
                  width: 220, 
                  height: 220, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <img src={qrUrl} alt="VietQR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ marginTop: 16, fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: 0.5 }}>
                  {form.amount ? (parseInt(form.amount).toLocaleString() + 'đ') : 'Nhập số tiền'}
                </div>
              </div>

              {/* Bank Transfer Details list */}
              <div style={{ padding: 20, background: 'var(--bg-input)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ngân hàng:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{bankAccount.bank}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chủ tài khoản:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{bankAccount.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Số tài khoản:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6', letterSpacing: 0.5 }}>{bankAccount.no}</span>
                      <button 
                        onClick={() => handleCopy(bankAccount.no, 'stk')}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {copiedField === 'stk' ? 'OK!' : <FiCopy />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nội dung chuyển:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>{noteContent}</span>
                      <button 
                        onClick={() => handleCopy(noteContent, 'nội dung')}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {copiedField === 'nội dung' ? 'OK!' : <FiCopy />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: 16, 
                  background: 'rgba(217,119,6,0.06)', 
                  border: '1px solid rgba(217,119,6,0.15)', 
                  padding: 12, 
                  borderRadius: 8, 
                  fontSize: 12, 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.5 
                }}>
                  ⚠️ <strong>Lưu ý:</strong> Vui lòng nhập <strong>đích xác</strong> nội dung chuyển khoản ở trên để hệ thống tự động cộng số dư vào tài khoản ngay lập tức.
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Success Modal */}
      {submitted && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="card" style={{ 
            maxWidth: 500, 
            width: '100%', 
            padding: 32, 
            textAlign: 'center', 
            borderRadius: 20,
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ marginBottom: 16 }}><FiCheckCircle size={64} color="var(--success)" /></div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px 0' }}>Gửi Yêu Cầu Thành Công</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Hệ thống đã nhận được thông tin giao dịch nạp <strong>{formatMoney(form.amount)}</strong>. Tài khoản của bạn sẽ được tự động cộng tiền sau khi giao dịch khớp thông tin.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => { setSubmitted(false); setForm({...form, amount: '', transaction_ref: ''}); }}
                style={{ borderRadius: 8 }}
              >
                Nạp Tiếp
              </button>
              <a href="/history" className="btn btn-primary" style={{ borderRadius: 8 }}>Lịch sử ví</a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .deposit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
