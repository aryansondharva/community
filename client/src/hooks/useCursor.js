import { useEffect, useRef, useState } from 'react';

export const useCursor = () => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const animateCursor = () => {
      setCursorPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.14,
        y: prev.y + (mousePos.y - prev.y) * 0.14
      }));
      requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos]);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.left = cursorPos.x + 'px';
      cursorRef.current.style.top = cursorPos.y + 'px';
    }
  }, [cursorPos]);

  const handleMouseEnter = () => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = 'translate(-50%, -50%) scale(2.2)';
      cursorRef.current.style.borderColor = 'var(--gold)';
    }
  };

  const handleMouseLeave = () => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRef.current.style.borderColor = 'var(--red)';
    }
  };

  return {
    cursorRef,
    dotRef,
    handleMouseEnter,
    handleMouseLeave
  };
};
