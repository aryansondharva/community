import React from 'react';
import '../styles/Prizes.css';

const Prizes = () => {
  const mainPrizes = [
    {
      rank: 'Second Place',
      icon: '🥈',
      amount: '₹75K',
      name: 'Silver Mask',
      perks: ['Cash Prize', 'Internship Opportunities', 'Premium Swag Kit', 'Certificate of Excellence'],
      isGold: false
    },
    {
      rank: 'First Place',
      icon: '🥇',
      amount: '₹1.5L',
      name: 'Golden Mask',
      perks: ['Grand Cash Prize', 'VC Pitch Opportunity', '6-Month Incubation', 'Media Feature & PR', 'Exclusive Mentorship'],
      isGold: true
    },
    {
      rank: 'Third Place',
      icon: '🥉',
      amount: '₹40K',
      name: 'Bronze Mask',
      perks: ['Cash Prize', 'Freelance Referrals', 'Swag Kit', 'Certificate of Merit'],
      isGold: false
    }
  ];

  const specialPrizes = [
    { amount: '₹25K', name: 'Best AI for Social Good' },
    { amount: '₹20K', name: 'Best Student Team' },
    { amount: '₹15K', name: 'Most Innovative AI' },
    { amount: '₹10K', name: 'People\'s Choice' }
  ];

  return (
    <section id="prizes">
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="sec-eyebrow" style={{ justifyContent: 'center' }}>The Loot</div>
          <h2 className="sec-title">PRIZE <span className="red">VAULT</span></h2>
          <div className="sec-bar" style={{ margin: '0 auto 3rem' }}></div>
        </div>
        <div className="prizes-grid">
          {mainPrizes.map((prize, index) => (
            <div 
              key={index} 
              className={`prize-card reveal ${prize.isGold ? 'gold-p' : ''}`}
            >
              <div className="prize-rank">{prize.rank}</div>
              <span className="prize-icon">{prize.icon}</span>
              <div className="prize-amount">{prize.amount}</div>
              <div className="prize-name">{prize.name}</div>
              <ul className="prize-perks">
                {prize.perks.map((perk, perkIndex) => (
                  <li key={perkIndex}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="sp-grid reveal">
          {specialPrizes.map((prize, index) => (
            <div key={index} className="sp-card">
              <div className="sp-amt">{prize.amount}</div>
              <div className="sp-name">{prize.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Prizes;
