import React, { useEffect } from 'react';
import { useParticles } from './hooks/useParticles';
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

function App() {
  // Initialize particles
  useParticles('particles');

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

  // Random glitch flash effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchElements = document.querySelectorAll('.glitch');
      const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
      if (randomElement) {
        randomElement.style.textShadow = '4px 0 var(--red), -4px 0 var(--gold)';
        setTimeout(() => {
          randomElement.style.textShadow = '';
        }, 120);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Add hover effects to interactive elements (without cursor)
  useEffect(() => {
    const interactiveElements = document.querySelectorAll('a, button, .obj-card, .judge-card, .prize-card, .sp-box');
    
    // Simple hover effect without custom cursor
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.02)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
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
