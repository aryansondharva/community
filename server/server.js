const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    },
  },
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HackX server is running' });
});

app.post('/api/register', (req, res) => {
  const { fullName, email, organization, role, track } = req.body;
  
  // Basic validation
  if (!fullName || !email || !organization || !role || !track) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email address' 
    });
  }

  // Here you would typically save to a database
  console.log('Registration received:', { fullName, email, organization, role, track });
  
  // Simulate processing time
  setTimeout(() => {
    res.json({ 
      success: true, 
      message: 'Registration successful! Check your email for confirmation.' 
    });
  }, 500);
});

app.get('/api/stats', (req, res) => {
  // Mock stats - in a real app, this would come from a database
  res.json({
    participants: 500,
    prizes: '₹5L+',
    hours: 48,
    mentors: 30
  });
});

app.get('/api/sponsors', (req, res) => {
  // Mock sponsor data
  res.json({
    platinum: ['NEXUS CORP', 'AXIOM AI'],
    gold: ['DEVFORGE', 'CLOUDBASE', 'SYNTHAI'],
    community: ['TECHSURAT', 'STARTUPGUJ', 'IEEE CHAPTER', 'MLSA INDIA', 'GDG SURAT']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HackX server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});
