import React, { useState } from 'react';
import '../styles/FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Who can participate?',
      answer: 'Anyone passionate about tech! Open to students, professionals & entrepreneurs. All skill levels welcome. No background restrictions.'
    },
    {
      question: 'Team size?',
      answer: 'Teams of 2–4 members. Solo participation allowed. We run a team-formation session before the event. Diverse teams tend to win.'
    },
    {
      question: 'Is there a registration fee?',
      answer: 'Completely FREE. Meals, snacks & sleeping areas during the 48-hour heist are all provided. Just bring your laptop and ambition.'
    },
    {
      question: 'What should we build?',
      answer: 'Anything that uses AI & Innovation to solve a real problem. Tracks include healthcare AI, EdTech, smart cities, AgriTech & open innovation. Problem statements revealed at ceremony.'
    },
    {
      question: 'Can we start before the event?',
      answer: 'Pre-built projects are not allowed. All work must be done during the 48-hour window. You CAN study tech, plan strategy & setup your dev environment in advance.'
    },
    {
      question: 'What tools & APIs can we use?',
      answer: 'All open-source tools, free APIs & sponsor-provided API credits. Cloud compute credits from sponsors available. Full resource list shared post-registration.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq">
      <div className="container">
        <div className="reveal">
          <div className="sec-eyebrow">Intel Briefing</div>
          <h2 className="sec-title">NEED TO <span className="red">KNOW</span></h2>
          <div className="sec-bar"></div>
        </div>
        <div className="faq-wrap">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item reveal ${openIndex === index ? 'open' : ''}`}>
              <button 
                className="faq-q" 
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
