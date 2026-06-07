'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { orderAPI, accountAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner, formatMoney, formatDate } from '@/components/common';
import toast from 'react-hot-toast';
import { FiSend, FiLock, FiCheckCircle, FiXCircle, FiInfo, FiUser, FiAlertTriangle, FiPhoneCall, FiKey } from 'react-icons/fi';

export default function OrderRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [accountCredentials, setAccountCredentials] = useState(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const ordRes = await orderAPI.getDetail(id);
      setOrder(ordRes.data.data);
      
      const msgRes = await orderAPI.getMessages(id);
      setMessages(msgRes.data.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu phòng chat');
      router.push('/');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await orderAPI.sendMessage(id, {
        message: newMessage.trim(),
        is_private: isPrivate
      });
      setNewMessage('');
      setIsPrivate(false);
      // Reload messages immediately
      const msgRes = await orderAPI.getMessages(id);
      setMessages(msgRes.data.data);
    } catch (err) {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleCompleteOrder = async () => {
    setProcessingAction(true);
    try {
      await orderAPI.complete(id);
      toast.success('Đơn hàng đã được xác nhận hoàn tất. Giải ngân thành công!');
      setShowCompleteModal(false);
      fetchData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xử lý thất bại');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    setProcessingAction(true);
    try {
      await orderAPI.cancel(id, { reason: cancelReason.trim() });
      toast.success('Đơn hàng đã được hủy và hoàn tiền thành công!');
      setShowCancelModal(false);
      fetchData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xử lý thất bại');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleLoadCredentials = async () => {
    if (!order) return;
    setLoadingCredentials(true);
    try {
      const res = await accountAPI.getById(order.account_id);
      setAccountCredentials(res.data.data);
    } catch (err) {
      toast.error('Không thể tải thông tin đăng nhập');
    } finally {
      setLoadingCredentials(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return null;

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;
  const isAdmin = user?.role === 'admin';
  const isPending = order.status === 'PENDING';

  return (
    <div style={{ padding: '30px 0', background: 'var(--bg-body)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        
        {/* CỘT TRÁI: KHU VỰC CHAT 3 BÊN */}
        <div className="card" style={{ padding: 0, height: '650px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header Phòng chat */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800 }}>Phòng Giao Dịch Trung Gian #{order.id}</h2>
                {order.status === 'PENDING' && <span className="badge badge-warning">Đang xử lý</span>}
                {order.status === 'COMPLETED' && <span className="badge badge-success">Đã hoàn thành</span>}
                {order.status === 'CANCELLED' && <span className="badge badge-danger">Đã hủy</span>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Bắt đầu lúc: {formatDate(order.created_at)}
              </p>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>
              Đóng băng: {formatMoney(order.amount)}
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f5f7fb', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg) => {
              const isSys = msg.message.startsWith('HỆ THỐNG:');
              const isMsgAdmin = msg.sender_role === 'admin';
              const isOwn = msg.sender_id === user?.id;

              if (isSys) {
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <div style={{ background: '#e0e7ff', borderLeft: '4px solid var(--primary)', color: '#3730a3', padding: '10px 14px', borderRadius: 8, fontSize: 12, maxWidth: '80%', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <FiInfo style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>{msg.message.replace('HỆ THỐNG:', '').trim()}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    {/* Tên người gửi */}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiUser size={10} />
                      {msg.sender_name} 
                      {isMsgAdmin && <span style={{ background: 'var(--primary)', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>ADMIN</span>}
                      {msg.sender_id === order.buyer_id && <span style={{ background: '#3b82f6', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>MUA</span>}
                      {msg.sender_id === order.seller_id && <span style={{ background: '#10b981', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>BÁN</span>}
                      {msg.is_private === 1 && <span style={{ background: '#ec4899', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 4, fontWeight: 800 }}>NỘI BỘ</span>}
                    </div>
                    {/* Nội dung tin nhắn */}
                    <div style={{ 
                      background: msg.is_private ? '#fce7f3' : (isOwn ? 'var(--primary)' : 'white'),
                      color: msg.is_private ? '#9d174d' : (isOwn ? 'white' : 'var(--text-primary)'),
                      border: msg.is_private ? '1px dashed #ec4899' : '1px solid var(--border)',
                      padding: '10px 14px',
                      borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      fontSize: 13,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      wordBreak: 'break-word',
                      lineHeight: 1.4
                    }}>
                      {msg.message}
                    </div>
                    {/* Thời gian */}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form gửi tin nhắn */}
          {isPending ? (
            <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input type="checkbox" id="privateCheck" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                  <label htmlFor="privateCheck" style={{ fontSize: 12, fontWeight: 600, color: '#9d174d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiLock /> Gửi dưới dạng tin nhắn nội bộ (Ẩn với người mua/bán)
                  </label>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  className="input" 
                  placeholder="Nhập tin nhắn..." 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending} 
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', gap: 8 }} disabled={sending}>
                  <FiSend /> Gửi
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
              Cuộc hội thoại đã đóng do đơn hàng đã hoàn tất hoặc hủy bỏ.
            </div>
          )}
        </div>

        {/* CỘT PHẢI: CHI TIẾT ĐƠN HÀNG & THAO TÁC */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Thông tin Acc */}
          <div className="card" style={{ padding: 20 }}>
            <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', marginBottom: 8, fontSize: 11 }}>Đơn hàng #{order.id}</span>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{order.account_title}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Giá trị acc:</span>
                <strong style={{ color: 'var(--gold)' }}>{formatMoney(order.amount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phí trung gian (3%):</span>
                <span>{formatMoney(order.fee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Server:</span>
                <span style={{ fontWeight: 600 }}>{order.server || 'Việt Nam'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rank:</span>
                <span style={{ fontWeight: 600 }}>{order.rank_level || '-'}</span>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Người mua:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{order.buyer_name}</span>
                  <a href={`https://zalo.me/${order.buyer_phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xs" style={{ gap: 4, display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: 11 }}>
                    <FiPhoneCall size={12} /> Zalo mua
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Người bán:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{order.seller_name}</span>
                  <a href={`https://zalo.me/${order.seller_phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xs" style={{ gap: 4, display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: 11 }}>
                    <FiPhoneCall size={12} /> Zalo bán
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* THÔNG TIN ACC KHI HOÀN TẤT HOẶC CHO ADMIN */}
          {(isAdmin || isBuyer || isSeller) && (
            <div className="card" style={{ padding: 20, border: '1px solid var(--primary-glow)', background: 'rgba(108,99,255,0.03)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiLock style={{ color: 'var(--primary)' }} /> Thông tin bàn giao tài khoản
              </h4>
              
              {!accountCredentials ? (
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handleLoadCredentials} disabled={loadingCredentials}>
                  <FiKey /> {loadingCredentials ? 'Đang tải...' : 'Xem thông tin acc'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tên đăng nhập:</span>
                    <div style={{ background: 'var(--bg-input)', padding: 6, borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, marginTop: 2 }}>
                      {accountCredentials.username}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Mật khẩu:</span>
                    <div style={{ background: 'var(--bg-input)', padding: 6, borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, marginTop: 2 }}>
                      {accountCredentials.password}
                    </div>
                  </div>
                  {accountCredentials.email_acc && (
                    <>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Email liên kết:</span>
                        <div style={{ background: 'var(--bg-input)', padding: 6, borderRadius: 6, fontFamily: 'monospace', marginTop: 2 }}>
                          {accountCredentials.email_acc}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Mật khẩu email:</span>
                        <div style={{ background: 'var(--bg-input)', padding: 6, borderRadius: 6, fontFamily: 'monospace', marginTop: 2 }}>
                          {accountCredentials.email_pass}
                        </div>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 6, background: '#fef3c7', padding: 8, borderRadius: 6, color: '#92400e', fontSize: 10, marginTop: 4 }}>
                    <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span><strong>Lưu ý:</strong> Khách mua hãy đăng nhập game, liên kết SĐT chính chủ và thay đổi mật khẩu ngay lập tức.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* THAO TÁC CỦA ADMIN */}
          {isAdmin && isPending && (
            <div className="card" style={{ padding: 20, border: '1px solid rgba(229,57,53,0.3)', background: 'rgba(229,57,53,0.02)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle /> Thao tác quản trị viên
              </h4>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                Admin trung gian có quyền giải ngân tiền cho Người bán hoặc Hủy đơn hoàn trả tiền cho Người mua khi có sự cố.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={() => setShowCompleteModal(true)}>
                  <FiCheckCircle /> Hoàn Tất & Giải Ngân
                </button>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', gap: 8, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setShowCancelModal(true)}>
                  <FiXCircle /> Hủy Giao Dịch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP XÁC NHẬN HOÀN TẤT */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCheckCircle style={{ color: 'var(--success)' }} /> Xác Nhận Giải Ngân
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
              Bạn có chắc chắn đã xác minh Người mua nhận được tài khoản game và liên kết thông tin bảo mật thành công?
              Sau khi bấm giải ngân, số tiền <strong className="gold-text">{(order.amount - order.fee).toLocaleString()}đ</strong> sẽ được chuyển trực tiếp vào ví chính của Người bán. Thao tác này <strong>không thể phục hồi</strong>.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowCompleteModal(false)} disabled={processingAction}>Quay lại</button>
              <button className="btn btn-primary" onClick={handleCompleteOrder} disabled={processingAction}>
                {processingAction ? 'Đang giải ngân...' : 'Xác Nhận Giải Ngân'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP HỦY GIAO DỊCH */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)' }}>
              <FiXCircle /> Xác Nhận Hủy Giao Dịch
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
              Nhập lý do hủy bỏ giao dịch. Hệ thống sẽ giải phóng số tiền đóng băng <strong className="gold-text">{Number(order.amount).toLocaleString()}đ</strong> hoàn trả trực tiếp về ví chính của Người mua. Bài đăng acc sẽ chuyển sang ẩn.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Lý do hủy đơn *</label>
              <input className="input" placeholder="Ví dụ: Người bán dính thông tin ảo, không thể bàn giao acc." value={cancelReason} onChange={e => setCancelReason(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowCancelModal(false)} disabled={processingAction}>Quay lại</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleCancelOrder} disabled={processingAction}>
                {processingAction ? 'Đang hủy đơn...' : 'Xác Nhận Hủy Đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
