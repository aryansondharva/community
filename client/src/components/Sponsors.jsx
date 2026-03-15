import React from 'react';
import '../styles/Sponsors.css';

const Sponsors = () => {
  const sponsors = {
    platinum: ['NEXUS CORP', 'AXIOM AI'],
    gold: ['DEVFORGE', 'CLOUDBASE', 'SYNTHAI'],
    community: ['TECHSURAT', 'STARTUPGUJ', 'IEEE CHAPTER', 'MLSA INDIA', 'GDG SURAT']
  };

  return (
    <section id="sponsors">
      <div className="container">
        <div className="reveal">
          <div className="sec-eyebrow">The Backers</div>
          <h2 className="sec-title">OUR <span className="gold">SPONSORS</span></h2>
          <div className="sec-bar" style={{ background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }}></div>
        </div>
        <div className="reveal">
          <div className="sp-tier">Platinum Partners</div>
          <div className="sp-row">
            {sponsors.platinum.map((sponsor, index) => (
              <div key={index} className="sp-box plat">{sponsor}</div>
            ))}
          </div>
          
          <div className="sp-tier">Gold Partners</div>
          <div className="sp-row">
            {sponsors.gold.map((sponsor, index) => (
              <div key={index} className="sp-box">{sponsor}</div>
            ))}
          </div>
          
          <div className="sp-tier">Community Partners</div>
          <div className="sp-row">
            {sponsors.community.map((sponsor, index) => (
              <div key={index} className="sp-box" style={{ fontSize: '.9rem' }}>{sponsor}</div>
            ))}
          </div>
        </div>
        <div className="sp-cta reveal">
          <p>"Want to back the next generation of innovators? Join the resistance."</p>
          <a href="mailto:sponsor@hackx.dev">sponsor@hackx.dev</a>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
