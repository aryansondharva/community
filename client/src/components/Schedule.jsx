import React from 'react';
import '../styles/Schedule.css';

const Schedule = () => {
  const day1Events = [
    {
      time: '09:00 AM',
      title: 'Registration Opens',
      description: 'Check in, collect your kit, meet your crew.',
      badge: null
    },
    {
      time: '10:30 AM',
      title: 'Opening Ceremony',
      description: 'Keynote address & problem statements revealed.',
      badge: 'Keynote'
    },
    {
      time: '12:00 PM',
      title: 'Hacking Begins',
      description: 'Clock starts. Execute the mission.',
      badge: { text: '■ LIVE', color: 'var(--gold)' }
    },
    {
      time: '03:00 PM',
      title: 'Workshop: AI/ML',
      description: 'Hands-on with LLMs, APIs & datasets.',
      badge: null
    },
    {
      time: '08:00 PM',
      title: 'Mentor Connect',
      description: '1:1 office hours with industry experts.',
      badge: null
    }
  ];

  const day2Events = [
    {
      time: '12:00 AM',
      title: 'Midnight Surge',
      description: 'Energy drinks, snacks & motivation.',
      badge: null
    },
    {
      time: '10:00 AM',
      title: 'Progress Check-in',
      description: 'Quick 2-min team stand-ups with mentors.',
      badge: null
    },
    {
      time: '11:00 AM',
      title: 'Submission Deadline',
      description: 'GitHub repos locked. Decks submitted.',
      badge: 'Deadline'
    },
    {
      time: '01:00 PM',
      title: 'Final Presentations',
      description: 'Top 10 teams pitch to the judges.',
      badge: 'Grand Stage'
    },
    {
      time: '04:00 PM',
      title: 'Awards Ceremony',
      description: 'Winners crowned. The heist is complete.',
      badge: { text: '★ Victory', color: 'var(--gold)' }
    }
  ];

  return (
    <section id="schedule">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal">
          <div className="sec-eyebrow">The Plan</div>
          <h2 className="sec-title">48-HOUR <span className="red">TIMELINE</span></h2>
          <div className="sec-bar"></div>
        </div>
        <div className="tl-grid">
          <div>
            <div className="tl-day">DAY 1 — AUGUST 15</div>
            <div className="timeline">
              {day1Events.map((event, index) => (
                <div key={index} className="tl-item reveal">
                  <div className="tl-dot"></div>
                  <div className="tl-time">{event.time}</div>
                  <div className="tl-title">{event.title}</div>
                  <p className="tl-desc">{event.description}</p>
                  {event.badge && (
                    <span 
                      className="tl-badge" 
                      style={event.badge.color ? { borderColor: event.badge.color, color: event.badge.color } : {}}
                    >
                      {typeof event.badge === 'string' ? event.badge : event.badge.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="tl-day">DAY 2–3 — AUG 16-17</div>
            <div className="timeline">
              {day2Events.map((event, index) => (
                <div key={index} className="tl-item reveal">
                  <div className="tl-dot"></div>
                  <div className="tl-time">{event.time}</div>
                  <div className="tl-title">{event.title}</div>
                  <p className="tl-desc">{event.description}</p>
                  {event.badge && (
                    <span 
                      className="tl-badge" 
                      style={event.badge.color ? { borderColor: event.badge.color, color: event.badge.color } : {}}
                    >
                      {typeof event.badge === 'string' ? event.badge : event.badge.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
