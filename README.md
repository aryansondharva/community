# HACKX 2025 - Hack The System

A modern hackathon website built with React.js and Express.js, featuring a cyberpunk money heist theme.

## 🚀 Features

- **Modern React Architecture**: Component-based structure with custom hooks
- **Express.js Backend**: RESTful API for registration and data management
- **Cyberpunk Theme**: Dark design with red and gold accents, glitch effects, and animations
- **Responsive Design**: Fully responsive across all devices
- **Interactive Elements**: Custom cursor, particle effects, typewriter animations
- **Smooth Animations**: Scroll reveal animations and hover effects
- **Registration System**: Functional registration form with validation

## 📁 Project Structure

```
Raah/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Navigation.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── Objectives.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Prizes.jsx
│   │   │   ├── Judges.jsx
│   │   │   ├── Sponsors.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Footer.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useCursor.js
│   │   │   ├── useCountdown.js
│   │   │   ├── useTypewriter.js
│   │   │   └── useParticles.js
│   │   ├── styles/         # CSS files
│   │   │   ├── global.css
│   │   │   ├── Hero.css
│   │   │   ├── Navigation.css
│   │   │   ├── Gallery.css
│   │   │   ├── Objectives.css
│   │   │   ├── Schedule.css
│   │   │   ├── Prizes.css
│   │   │   ├── Judges.css
│   │   │   ├── Sponsors.css
│   │   │   ├── FAQ.css
│   │   │   ├── Register.css
│   │   │   └── Footer.css
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── models/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The React app will run on `http://localhost:3000`

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Registration
```
POST /api/register
Content-Type: application/json

Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "organization": "University",
  "role": "Student — Engineering",
  "track": "Healthcare AI"
}
```

### Get Stats
```
GET /api/stats
```

### Get Sponsors
```
GET /api/sponsors
```

## 🎨 Design Features

- **Custom Cursor**: Interactive cursor that responds to hover states
- **Particle System**: Animated floating particles with red and gold colors
- **Glitch Effects**: Random glitch animations on main headings
- **Countdown Timer**: Live countdown to hackathon start date
- **Typewriter Effect**: Cycling text with typewriter animation
- **Scroll Reveal**: Elements animate in as you scroll
- **Responsive Gallery**: Auto-scrolling image gallery
- **Interactive FAQ**: Accordion-style FAQ section
- **Form Validation**: Client-side validation with visual feedback

## 🎯 Components

### Navigation
- Fixed header with smooth scroll navigation
- Active section highlighting
- Responsive mobile menu

### Hero Section
- Animated background with parallax effect
- Glitch text animations
- Live countdown timer
- Call-to-action buttons
- Statistics display

### Objectives
- Grid layout with hover effects
- Icon-based objective cards
- Animated numbering

### Schedule
- Timeline layout for events
- Day-wise organization
- Badge system for event types

### Prizes
- Tiered prize display
- Special prizes grid
- Animated prize cards

### Judges & Mentors
- Judge cards with avatars
- Hover animations
- Organization details

### Registration
- Form validation
- Success state handling
- Input styling with focus effects

## 🔧 Custom Hooks

### useCursor
- Manages custom cursor movement and hover states
- Smooth cursor animation with lag effect

### useCountdown
- Calculates time remaining to target date
- Updates every second
- Returns formatted time object

### useTypewriter
- Implements typewriter text effect
- Cycles through multiple phrases
- Configurable typing and deleting speeds

### useParticles
- Generates floating particle elements
- Random positioning and animation
- Configurable particle count

## 🚀 Deployment

### Client (React)
```bash
cd client
npm run build
```
Deploy the `build` folder to your hosting service.

### Server (Express)
Set environment variables:
```bash
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎭 Theme

The website features a cyberpunk money heist theme with:
- Color scheme: Black background with red and gold accents
- Typography: Bebas Neue, Rajdhani, Special Elite, Share Tech Mono
- Visual effects: Glitch animations, scanlines, noise overlay
- Interactive elements: Custom cursor, hover states, transitions
- Motif: "Hack the System" with heist terminology

---

Built with ❤️ for the HACKX 2025 Hackathon
