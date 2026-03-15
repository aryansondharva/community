import React from 'react';
import { useTypewriter, useCountdown } from '../hooks';
import '../styles/Hero.css';

const Hero = () => {
  const phrases = [
    '> Initializing HackX Protocol...',
    '> 48 Hours. Unlimited Ambition.',
    '> AI & Innovation Summit 2025',
    '> Build. Break. Innovate. Repeat.',
    '> Your code could change everything.',
    '> La Casa de Código.'
  ];
  
  const typewriterText = useTypewriter(phrases);
  const countdown = useCountdown('2025-08-15T09:00:00');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero">
      <div className="hero-img"></div>
      <div className="hero-overlay"></div>
      <div className="hero-scanlines"></div>

      <div className="hero-content">
        <div className="hero-ticker">
          <div className="ticker-dot"></div>
          INITIATING PROTOCOL X &nbsp;|&nbsp; AUG 15–17, 2025 &nbsp;|&nbsp; SURAT, GUJARAT &nbsp;|&nbsp; AI & INNOVATION
          <div className="ticker-dot"></div>
        </div>

        <div className="glitch-wrap">
          <span className="glitch" data-text="HACK">HACK</span>
          <span className="glitch blink-red" data-text="THE">THE</span>
          <span className="glitch gold-glow" data-text="SYSTEM">SYSTEM</span>
        </div>

        <div className="typewriter-wrap">
          <span>{typewriterText}</span><span className="tw-cursor"></span>
        </div>

        <p className="hero-quote">"Every great revolution starts with a single line of code."</p>

        <div className="hero-stats">
          <div className="stat"><span className="val" id="s1">48</span><span className="lbl">Hours</span></div>
          <div className="stat"><span className="val" id="s2">₹5L+</span><span className="lbl">In Prizes</span></div>
          <div className="stat"><span className="val" id="s3">500+</span><span className="lbl">Hackers</span></div>
          <div className="stat"><span className="val" id="s4">30+</span><span className="lbl">Mentors</span></div>
        </div>

        <div className="hero-btns">
          <a href="#register" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollToSection('register'); }}>
            🔒 Execute Plan
          </a>
          <a href="#schedule" className="btn-outline" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>
            📖 View Dossier
          </a>
        </div>

        <div className="countdown">
          <div className="cd-box">
            <span className="cd-num">{countdown.days}</span>
            <span className="cd-lbl">Days</span>
          </div>
          <div className="cd-box">
            <span className="cd-num">{countdown.hours}</span>
            <span className="cd-lbl">Hrs</span>
          </div>
          <div className="cd-box">
            <span className="cd-num">{countdown.minutes}</span>
            <span className="cd-lbl">Min</span>
          </div>
          <div className="cd-box">
            <span className="cd-num">{countdown.seconds}</span>
            <span className="cd-lbl">Sec</span>
          </div>
        </div>
      </div>

      <div className="scroll-ind">
        <div className="scroll-line"></div>
        <span className="scroll-txt">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
