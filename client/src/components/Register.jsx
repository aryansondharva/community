import React, { useState } from 'react';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: '',
    track: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log('Registration submitted:', formData);
  };

  if (isSubmitted) {
    return (
      <section id="register">
        <div className="container">
          <div className="reg-inner">
            <div id="reg-success">
              <div className="suc-title">YOU'RE IN THE CREW.</div>
              <p className="suc-sub">Check your email. Welcome to the resistance. 🔒</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="register">
      <div className="container">
        <div className="reg-inner">
          <div className="reveal">
            <div className="sec-eyebrow" style={{ justifyContent: 'center' }}>Join the Resistance</div>
            <h2 className="reg-big">
              <span style={{ color: 'var(--white)' }}>REGISTER</span><br/>
              <span className="blink-gold">NOW</span>
            </h2>
            <p className="reg-sub">"The system won't hack itself. Spots are limited. Move fast."</p>
          </div>
          <form className="reg-form reveal" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="organization"
              placeholder="College / Organization"
              value={formData.organization}
              onChange={handleChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Your Role</option>
              <option>Student — Engineering</option>
              <option>Student — Other</option>
              <option>Working Professional</option>
              <option>Entrepreneur / Founder</option>
              <option>Designer / Creative</option>
              <option>Other</option>
            </select>
            <select
              name="track"
              value={formData.track}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Track of Interest</option>
              <option>Healthcare AI</option>
              <option>EdTech & Learning</option>
              <option>Smart Cities</option>
              <option>AgriTech</option>
              <option>FinTech AI</option>
              <option>Open Innovation</option>
            </select>
            <button type="submit" className="reg-submit">
              🔒 EXECUTE REGISTRATION
            </button>
            <p className="reg-note">■ By registering you agree to the code of conduct. Confirmation within 48 hours.</p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
