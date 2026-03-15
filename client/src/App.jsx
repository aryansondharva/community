import React, { useEffect } from 'react';
import { useParticles } from './hooks/useParticles';
import { useMatrixRain } from './hooks/useMatrixRain';
import { useCyberGrid } from './hooks/useCyberGrid';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Objectives from './components/Objectives';
import Schedule from './components/Schedule';
import Prizes from './components/Prizes';
import Judges from './components/Judges';
import Sponsors from './components/Sponsors';
import FAQ from './components/FAQ';
import Register from './components/Register';
import Footer from './components/Footer';
import './styles/global.css';
import './styles/Animations.css';

function App() {
  // Initialize all effects
  useParticles('particles');
  useMatrixRain('matrix-rain');
  useCyberGrid();

  // Scroll reveal animation
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Navigation highlight on scroll
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = () => {
      let current = '';
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 200) {
          current = section.id;
        }
      });
      
      document.querySelectorAll('.nav-links a').forEach((link) => {
        link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--red)' : '';
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Random glitch flash effect - more frequent and intense
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchElements = document.querySelectorAll('.glitch');
      if (glitchElements.length > 0) {
        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        if (randomElement) {
          // More intense glitch effects
          const glitchEffects = [
            '4px 0 var(--red), -4px 0 var(--gold), 8px 0 var(--red2)',
            '-6px 0 var(--gold), 6px 0 var(--red), -12px 0 var(--gold2)',
            '10px 0 var(--red), -10px 0 var(--gold), 0 0 20px var(--red)',
            '-8px 0 var(--gold2), 8px 0 var(--red2), 0 0 30px var(--gold)',
            '12px 0 var(--red), -12px 0 var(--gold), 4px 0 var(--red2)'
          ];
          
          const randomEffect = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
          randomElement.style.textShadow = randomEffect;
          randomElement.style.transform = `skewX(${Math.random() * 6 - 3}deg)`;
          
          setTimeout(() => {
            randomElement.style.textShadow = '';
            randomElement.style.transform = '';
          }, Math.random() * 200 + 100); // Random duration between 100-300ms
        }
      }
    }, 1500); // Reduced from 3000ms to 1500ms for more frequent glitches

    return () => clearInterval(glitchInterval);
  }, []);

  // Add hover effects to interactive elements (without cursor)
  useEffect(() => {
    const interactiveElements = document.querySelectorAll('a, button, .obj-card, .judge-card, .prize-card, .sp-box');
    
    // Enhanced hover effects
    interactiveElements.forEach((el) => {
      el.classList.add('cyber-hover');
      
      el.addEventListener('mouseenter', () => {
        el.classList.add('hologram');
        el.classList.add('pulse-glow');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('hologram');
        el.classList.remove('pulse-glow');
      });
    });

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', () => {});
        el.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div className="App">
      <div id="particles"></div>
      <div id="matrix-rain"></div>
      
      <Navigation />
      <Hero />
      <Gallery />
      <Objectives />
      <Schedule />
      <Prizes />
      <Judges />
      <Sponsors />
      <FAQ />
      <Register />
      <Footer />
    </div>
  );
}

export default App;
