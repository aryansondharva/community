import React from 'react';
import '../styles/Judges.css';

const Judges = () => {
  const judges = [
    {
      initials: 'AP',
      name: 'Arjun Patel',
      role: 'Chief Judge',
      organization: 'CTO, TechVentures India'
    },
    {
      initials: 'SR',
      name: 'Sneha Rao',
      role: 'AI Lead Judge',
      organization: 'Research Director, Google DeepMind'
    },
    {
      initials: 'MK',
      name: 'Mihir Kapoor',
      role: 'Industry Judge',
      organization: 'Partner, Nexus Ventures'
    },
    {
      initials: 'PD',
      name: 'Priya Desai',
      role: 'Impact Judge',
      organization: 'Founder, ImpactAI Foundation'
    }
  ];

  return (
    <section id="judges">
      <div className="judges-content container">
        <div className="reveal">
          <div className="sec-eyebrow">The Council</div>
          <h2 className="sec-title">JUDGES & <span className="red">MENTORS</span></h2>
          <div className="sec-bar"></div>
        </div>
        <div className="judges-grid">
          {judges.map((judge, index) => (
            <div 
              key={index} 
              className="judge-card reveal" 
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="j-avatar">{judge.initials}</div>
              <div className="j-name">{judge.name}</div>
              <div className="j-role">{judge.role}</div>
              <div className="j-org">{judge.organization}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Judges;
