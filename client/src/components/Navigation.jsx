import React from 'react';
import './Navigation.css';

const Navigation = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav>
      <div className="nav-logo">HACK<span>X</span></div>
      <ul className="nav-links">
        <li><a href="#objectives" onClick={(e) => { e.preventDefault(); scrollToSection('objectives'); }}>Mission</a></li>
        <li><a href="#schedule" onClick={(e) => { e.preventDefault(); scrollToSection('schedule'); }}>Timeline</a></li>
        <li><a href="#prizes" onClick={(e) => { e.preventDefault(); scrollToSection('prizes'); }}>Loot</a></li>
        <li><a href="#judges" onClick={(e) => { e.preventDefault(); scrollToSection('judges'); }}>Council</a></li>
        <li><a href="#sponsors" onClick={(e) => { e.preventDefault(); scrollToSection('sponsors'); }}>Backers</a></li>
        <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>Intel</a></li>
      </ul>
      <a href="#register" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollToSection('register'); }}>
        🔒 Join the Heist
      </a>
    </nav>
  );
};

export default Navigation;
