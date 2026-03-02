"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getUserMessages, sendMessage, markAsRead, SupportMessage } from "@/shared/api/supportApi";

export const SupportWidget = () => {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const userEmail = sessionUser?.email || null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const originalTitle = useRef(typeof document !== 'undefined' ? document.title : 'YOGA.LIFE');

  const loadMessages = async () => {
    if (!userEmail) return;

    const userMsgs = await getUserMessages(userEmail);
    setMessages(userMsgs);
    
    const unread = userMsgs.filter(m => (m.status === 'replied' || m.status === 'bot_answered') && !m.readByUser).length;
    setUnreadCount(unread);

    if (unread > 0) {
      document.title = `(${unread}) ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
  };

  useEffect(() => {
    originalTitle.current = document.title;
    loadMessages();

    const handleCustomUpdate = () => {
      loadMessages();
    };

    window.addEventListener('yoga_support_updated', handleCustomUpdate);
    
    const interval = setInterval(loadMessages, 3000);

    return () => {
      window.removeEventListener('yoga_support_updated', handleCustomUpdate);
      clearInterval(interval);
      document.title = originalTitle.current;
    };
  }, [userEmail]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening
      messages.forEach(m => {
        if ((m.status === 'replied' || m.status === 'bot_answered') && !m.readByUser) {
          markAsRead(m.id);
        }
      });
      setUnreadCount(0);
      document.title = originalTitle.current;
      loadMessages();
    }
  };

  if (!userEmail && messages.length === 0) return null; // Don't show if not logged in and no messages

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1050 }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="card shadow-lg border-0 mb-3" 
          style={{ 
            width: '350px', 
            height: '450px', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <div className="card-header text-white d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: 'var(--color-primary)' }}>
            <h6 className="mb-0 fw-bold">Служба поддержки</h6>
            <button className="btn-close btn-close-white" onClick={toggleWidget}></button>
          </div>
          <div className="card-body p-3" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {messages.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <p>У вас пока нет сообщений.</p>
                <small>Задайте вопрос на странице Контакты.</small>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="mb-4">
                  {/* User Message */}
                  <div className="d-flex justify-content-end mb-2">
                    <div className="p-2 rounded-3" style={{ backgroundColor: 'var(--color-primary)', color: 'white', maxWidth: '85%' }}>
                      <small className="d-block fw-bold mb-1" style={{ opacity: 0.8 }}>Вы: {msg.questionType !== 'Написать свой вопрос' ? msg.questionType : ''}</small>
                      {msg.message}
                    </div>
                  </div>
                  
                  {/* Reply */}
                  {(msg.status === 'replied' || msg.status === 'bot_answered') && msg.reply && (
                    <div className="d-flex justify-content-start">
                      <div className="p-2 rounded-3 bg-white border shadow-sm" style={{ maxWidth: '85%' }}>
                        <small className="d-block fw-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                          {msg.status === 'bot_answered' ? 'Виртуальный помощник' : 'Администратор'}
                        </small>
                        {msg.reply}
                      </div>
                    </div>
                  )}
                  
                  {/* Pending */}
                  {msg.status === 'new' && (
                    <div className="d-flex justify-content-start">
                      <div className="p-2 rounded-3 bg-white border shadow-sm text-muted" style={{ maxWidth: '85%', fontStyle: 'italic' }}>
                        <small>Ожидает ответа администратора...</small>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={toggleWidget}
        className="btn btn-primary-custom rounded-circle shadow-lg d-flex align-items-center justify-content-center position-relative"
        style={{ width: '60px', height: '60px', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'} fs-3`}></i>
        
        {/* Notification Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light border-2">
            {unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </button>
    </div>
  );
};
