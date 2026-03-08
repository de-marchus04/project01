'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const LockoutTimer = () => {
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const pathname = usePathname();

  // Dragging state
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const checkLockout = () => {
    const attemptsData = localStorage.getItem('yoga_login_attempts');
    if (attemptsData) {
      try {
        const parsed = JSON.parse(attemptsData);
        if (parsed.lockUntil) {
          if (parsed.lockUntil > Date.now()) {
            setLockUntil(parsed.lockUntil);
            setIsUnlocked(false);
          } else {
            // Timer expired
            setLockUntil(parsed.lockUntil);
            setTimeLeft(0);
            setIsUnlocked(true);
          }
        }
      } catch (e) {}
    } else {
      setLockUntil(null);
      setIsUnlocked(false);
    }
  };

  useEffect(() => {
    checkLockout();
    window.addEventListener('storage', checkLockout);
    return () => window.removeEventListener('storage', checkLockout);
  }, [pathname]);

  useEffect(() => {
    if (!lockUntil || isUnlocked) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockUntil) {
        setTimeLeft(0);
        setIsUnlocked(true);
        localStorage.removeItem('yoga_login_attempts');
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil((lockUntil - now) / 1000));
      }
    }, 1000);

    setTimeLeft(Math.ceil((lockUntil - Date.now()) / 1000));

    return () => clearInterval(interval);
  }, [lockUntil, isUnlocked]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!lockUntil && !isUnlocked) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        backgroundColor: isUnlocked ? '#2ecc71' : '#e74c3c',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        fontWeight: 'bold',
        transition: isDragging ? 'none' : 'background-color 0.3s ease',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <i className={`bi ${isUnlocked ? 'bi-unlock-fill' : 'bi-lock-fill'}`} style={{ fontSize: '1.2rem' }}></i>
      <span>{isUnlocked ? 'Доступ открыт' : formatTime(timeLeft)}</span>
      {isUnlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLockUntil(null);
            setIsUnlocked(false);
          }}
          className="btn-close btn-close-white ms-2"
          style={{ fontSize: '0.6rem' }}
        ></button>
      )}
    </div>
  );
};
