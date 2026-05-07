# WebSSH Frontend

Modern React frontend for WebSSH terminal client.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **xterm.js** - Terminal emulator
- **CSS3** - Custom styling with CSS variables

## Development

### Setup

```bash
# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Starts Vite dev server on http://localhost:5173 with API proxy to backend on port 8888.

### Build for Production

```bash
npm run build
```

This will:
1. Build the React app using Vite
2. Copy the built files to `webssh/static/react/`

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── scripts/
│   └── copy-static.js   # Build script to copy dist to backend
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx   # Tab bar and settings
│   │   ├── Sidebar.jsx  # Session manager
│   │   ├── Session.jsx  # Terminal component
│   │   └── LoginForm.jsx # Connection form
│   ├── services/
│   │   └── api.js       # API service (SSH connect, WebSocket)
│   ├── styles/
│   │   └── global.css   # Global styles
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## API Endpoints

The frontend communicates with the backend via:

- **POST /api/ssh** - Initiate SSH connection, returns session ID
- **WebSocket /ws?id={sessionId}** - Terminal communication

## Features

- Tabbed multi-session interface
- Session persistence (localStorage)
- Import/Export sessions
- Adjustable terminal font size
- Fullscreen terminal
- Right-click context menu for reconnect/disconnect
