import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer>
      <div className="ft-mask">🎭</div>
      <div className="ft-logo">HACK<span>X</span> 2025</div>
      <p className="ft-tag">"Every great heist needs a plan. Every great plan needs you."</p>
      <ul className="ft-links">
        <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a></li>
        <li><a href="#objectives" onClick={(e) => { e.preventDefault(); scrollToSection('objectives'); }}>Mission</a></li>
        <li><a href="#schedule" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>Timeline</a></li>
        <li><a href="#prizes" onClick={(e) => { e.preventDefault(); scrollToSection('prizes'); }}>Prizes</a></li>
        <li><a href="#judges" onClick={(e) => { e.preventDefault(); scrollToSection('judges'); }}>Judges</a></li>
        <li><a href="#register" onClick={(e) => { e.preventDefault(); scrollToSection('register'); }}>Register</a></li>
      </ul>
      <p className="ft-copy">&copy; 2025 HackX Community &nbsp;|&nbsp; Surat, Gujarat, India</p>
    </footer>
  );
};

export default Footer;
