import { useEffect } from 'react';

export const useParticles = (containerId, count = 70) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const isGold = Math.random() < 0.3;
      const size = Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 2 : 1;
      
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${7 + Math.random() * 14}s;
        animation-delay: ${Math.random() * 12}s;
        background: ${isGold ? 'var(--gold)' : 'var(--red)'};
        opacity: 0;
      `;
      
      container.appendChild(particle);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [containerId, count]);
};
