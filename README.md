# GameDin 🎮🚀  
**The Professional Network for the Gaming Ecosystem**  
*"Where Headshots Meet Handshakes"*  

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/gamedin/main.yml)](https://github.com/yourusername/gamedin/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/your-server-id)](https://discord.gg/your-invite-link)

<img src="[https://github.com/yourusername/gamedin/blob/main/design/gamedin-logo.png?raw=true](https://i.ibb.co/yBFtPhVp/image-fx-1.png)" width="200" align="right">

## 🌟 Overview  
GameDin revolutionizes professional networking for the gaming universe:
- **🎮 Gamers:** Showcase skills, find teams/clans, track stats  
- **👩💻 Developers:** Portfolio showcase, job opportunities, collab hub  
- **🏆 eSports Pros:** Sponsorship deals, tournament tracking, fan engagement  
- **👩👦 Parents:** Monitor gaming habits, connect with other gaming parents  

Think LinkedIn meets Twitch meets Discord - but with salary negotiations and mom-approved privacy controls.

---

## 🚀 Key Features  

### **For Players**  
- **Gamer CV™** with verified stats (K/D ratios, rank history, hero mastery)  
- **Team Finder** with AI-powered matchmaking  
- **Tournament Calendar** with auto-import from major platforms  
- **Streamer Mode** (integrated Twitch/OBS overlays)  

### **For Developers**  
- **Code Portfolio** (GitHub/Lab integration)  
- **Game Jam Hub** with real-time collaboration  
- **Job Board** (Remote gaming jobs with crypto payment options)  
- **Bug Bounty System** for indie games  

### **For eSports**  
- **Sponsor Marketplace**  
- **Team Analytics Dashboard**  
- **Merch Store Integrations**  
- **VOD Review System**  

### **For Parents**  
- **Parental Dashboard** (screen time analytics, purchase monitoring)  
- **Gaming Literacy Courses** ("Understanding Loot Boxes 101")  
- **Safe Chat** filters  
- **Local Clan Finder** (IRL meetup verification system)  

### **Core Features**  
- **Achievement-Based Networking** (Unlock recruiter contacts by reaching Diamond rank)  
- **Gaming News Feed** (With Twitch/Youtube embed support)  
- **AR Business Cards** (Scan QR codes to exchange gamer tags IRL)  
- **Salary Benchmark Tool** (Compare esports salaries by region/role)  

---

# GameDin - Gaming Social Network

A modern social platform for gamers to find teammates and connect with fellow players.

## Features

- User profiles with gaming statistics
- Match finding system with filters
- Real-time messaging
- Game-specific matchmaking
- Modern, responsive UI with DaisyUI components

## Tech Stack

- Vite + React
- TailwindCSS + DaisyUI
- Zustand for state management
- React Router for navigation
- JSON Server for development API

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
# Terminal 1: Start the Vite dev server
npm run dev

# Terminal 2: Start the JSON Server
npm run server
```

3. Open http://localhost:3000 in your browser

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start the JSON Server API

## Project Structure

```
src/
  ├── components/      # Reusable UI components
  ├── store/          # Zustand store and state management
  ├── pages/          # Route components
  ├── App.jsx         # Main application component
  └── main.jsx        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

# GameDin React

A social gaming platform built with React, TypeScript, and Material-UI.

## Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment

This project is configured for automatic deployment with AWS Amplify. Simply push to the main branch of your GitHub repository, and Amplify will automatically build and deploy your changes.

### Environment Variables

The following environment variables are required:

- `VITE_API_URL`: API endpoint URL
- `VITE_WS_URL`: WebSocket endpoint URL

## Tech Stack

- React 18
- TypeScript
- Material-UI
- Vite
- TailwindCSS
- React Router
- React Dropzone
- React Quill
