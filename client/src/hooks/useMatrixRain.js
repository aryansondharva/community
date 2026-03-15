import { useEffect } from 'react';

export const useMatrixRain = (containerId, density = 20) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    for (let i = 0; i < density; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${Math.random() * 100}%`;
      column.style.animationDuration = `${Math.random() * 10 + 5}s`;
      column.style.animationDelay = `${Math.random() * 5}s`;
      
      let text = '';
      for (let j = 0; j < 20; j++) {
        text += characters[Math.floor(Math.random() * characters.length)] + '<br>';
      }
      column.innerHTML = text;
      
      container.appendChild(column);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [containerId, density]);
};
