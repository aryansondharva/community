import React from 'react';
import '../styles/Objectives.css';

const Objectives = () => {
  const objectives = [
    {
      number: '01',
      icon: '🎯',
      name: 'Build AI Solutions',
      description: 'Create real-world AI applications tackling community challenges — healthcare, education, sustainability & governance.'
    },
    {
      number: '02',
      icon: '👥',
      name: 'Foster Collaboration',
      description: 'Break silos. Unite developers, designers & domain experts into unstoppable cross-functional squads.'
    },
    {
      number: '03',
      icon: '💡',
      name: 'Drive Innovation',
      description: 'Push beyond the obvious. Experiment, iterate and prototype bold ideas that reshape industries.'
    },
    {
      number: '04',
      icon: '🌍',
      name: 'Create Impact',
      description: 'Build solutions with measurable, lasting social and economic impact. Code that doesn\'t just run — it matters.'
    },
    {
      number: '05',
      icon: '🎓',
      name: 'Learn & Grow',
      description: 'Expert workshops, mentoring & talks. Leave sharper, more connected and ready for what\'s next.'
    },
    {
      number: '06',
      icon: '🏆',
      name: 'Launch Ventures',
      description: 'Top teams connect with investors & incubators to take their MVPs to market.'
    }
  ];

  return (
    <section id="objectives">
      <div className="container">
        <div className="reveal">
          <div className="sec-eyebrow">The Mission</div>
          <h2 className="sec-title">OUR <span className="red">OBJECTIVES</span></h2>
          <div className="sec-bar"></div>
        </div>
        <div className="obj-grid">
          {objectives.map((obj, index) => (
            <div 
              key={index} 
              className="obj-card reveal" 
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="obj-num">{obj.number}</div>
              <div className="obj-icon">{obj.icon}</div>
              <div className="obj-name">{obj.name}</div>
              <p className="obj-desc">{obj.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Objectives;
