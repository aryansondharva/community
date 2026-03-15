import { useEffect } from 'react';

export const useCyberGrid = () => {
  useEffect(() => {
    const cyberGrid = document.createElement('div');
    cyberGrid.className = 'cyber-grid';
    cyberGrid.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.03;
      background-image: 
        linear-gradient(rgba(204, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(204, 0, 0, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
    `;
    
    document.body.appendChild(cyberGrid);

    // Add CSS animation if not already present
    if (!document.querySelector('#cyber-grid-animation')) {
      const style = document.createElement('style');
      style.id = 'cyber-grid-animation';
      style.textContent = `
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (document.body.contains(cyberGrid)) {
        document.body.removeChild(cyberGrid);
      }
    };
  }, []);
};
