# WebSSH

[![Build Status](https://travis-ci.org/huashengdun/webssh.svg?branch=master)](https://travis-ci.org/huashengdun/webssh)
[![codecov](https://codecov.io/gh/huashengdun/webssh/branch/master/graph/badge.svg)](https://codecov.io/gh/huashengdun/webssh)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/webssh.svg)
![PyPI](https://img.shields.io/pypi/v/webssh.svg)

A modern, professional web-based SSH client with a React frontend and Tornado backend. Connect to your SSH servers directly from the browser with a sleek, terminal-style interface.

![WebSSH Terminal](https://github.com/huashengdun/webssh/raw/master/preview/terminal.png)

## Features

- **Modern React SPA** - Clean, professional interface with tabbed multi-session support
- **SSH Authentication** - Password, public-key (DSA/RSA/ECDSA/Ed25519), and Two-Factor Authentication (TOTP)
- **Session Management** - Save and organize your frequently used connections
- **Tabbed Interface** - Multiple simultaneous SSH sessions with easy switching
- **Full Terminal Experience** - xterm.js with 256-color support, auto-encoding detection
- **Responsive Design** - Works on desktop and mobile browsers
- **Import/Export** - Share your session configurations easily
- **Customizable** - Adjustable terminal font size

## Architecture

```
+---------+     http     +--------+    ssh     +-----------+
| browser | <==========> | webssh | <========> | ssh server|
+---------+   websocket  +--------+    ssh     +-----------+
                                    |
                              +-------------+
                              | React SPA  |
                              +-------------+
```

- **Frontend**: React 18 + Vite, served as static files
- **Backend**: Python Tornado, handles SSH connections and WebSocket proxy
- **Terminal**: xterm.js for browser-based terminal emulation

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+ (for frontend development)
- npm or yarn

### Backend Setup

```bash
# Install Python dependencies
pip install -e .

# Start the server
python run.py
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies API to backend on port 8888)
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
cd frontend

# Build React app
npm run build

# The built files are copied to webssh/static/react/
# Restart the backend to serve the production build
```

Then open http://localhost:8888 to access the application.

## Server Options

```bash
# HTTP server with custom address and port
python run.py --address='0.0.0.0' --port=8888

# HTTPS server (recommended for production)
python run.py --certfile='/path/to/cert.crt' --keyfile='/path/to/cert.key'

# Missing host key policy (reject/autoadd/warning)
python run.py --policy=reject

# Enable debug mode
python run.py --debug

# Change SSH connection timeout (seconds)
python run.py --timeout=10

# Custom known_hosts file
python run.py --hostfile='/path/to/known_hosts'

# Show all options
python run.py --help
```

## Session Management

The sidebar allows you to:

- **Add new sessions** - Save connection details for quick access
- **Edit sessions** - Click the edit icon to modify
- **Delete sessions** - Click the delete icon to remove
- **Import/Export** - Use the settings menu (top-right) to backup or share sessions

Sessions are stored in your browser's localStorage.

## Keyboard Shortcuts

- **Tab switching** - Click on tabs to switch between sessions
- **Right-click tab** - Context menu with Reconnect/Disconnect options
- **Fullscreen** - Click the fullscreen button in the terminal header

## Deployment

### Running Behind Nginx

```bash
# Start webssh on localhost
python run.py --address='127.0.0.1' --port=8888 --policy=reject
```

```nginx
# Nginx configuration
location / {
    proxy_pass http://127.0.0.1:8888;
    proxy_http_version 1.1;
    proxy_read_timeout 300;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Real-PORT $remote_port;
}
```

### Standalone HTTPS Server

```bash
python run.py --port=8080 --sslport=4433 --certfile='cert.crt' --keyfile='cert.key' --xheaders=False --policy=reject
```

### Using Docker

```bash
docker-compose up
```

## Security Tips

1. **Always use HTTPS** in production - never expose plain HTTP
2. **Use reject policy** with your verified known_hosts to prevent MITM attacks
3. **Restrict access** with firewall rules if running on a public server
4. **Empty your known_hosts** file if you suspect it has been compromised

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov codecov flake8 mock

# Run all tests
python -m pytest tests
```

### Project Structure

```
webssh/
├── run.py              # Backend entry point
├── webssh/
│   ├── main.py         # Tornado app setup
│   ├── handler.py      # HTTP/WebSocket handlers
│   ├── worker.py       # SSH worker management
│   ├── settings.py     # Server configuration
│   └── static/         # Static files (React build)
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service
│   │   └── styles/     # CSS styles
│   └── vite.config.js  # Vite configuration
└── tests/              # Unit tests
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
