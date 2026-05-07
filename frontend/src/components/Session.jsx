import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { connectSSH, createWebSocket } from '../services/api'
import '@xterm/xterm/css/xterm.css'

export default function Session({ session, onDisconnect, isActive, fontSize = 14 }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const wsRef = useRef(null)
  const decoderRef = useRef(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connected, setConnected] = useState(false)

  // Fit terminal when session becomes active
  useEffect(() => {
    if (isActive && termRef.current && fitAddonRef.current && connected) {
      setTimeout(() => {
        fitAddonRef.current?.fit()
        termRef.current?.focus()
      }, 50)
    }
  }, [isActive, connected])

  // Update font size when it changes
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = fontSize
      fitAddonRef.current?.fit()
    }
  }, [fontSize])

  useEffect(() => {
    if (!containerRef.current || termRef.current) return

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: fontSize,
      lineHeight: 1.2,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: 'rgba(88, 166, 255, 0.3)',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#7ee787',
        yellow: '#d29922',
        blue: '#79c0ff',
        magenta: '#d2a8ff',
        cyan: '#39c5cf',
        white: '#c9d1d9',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#ffffff'
      },
      scrollback: 10000
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)

    // Delay fit to ensure container is rendered
    setTimeout(() => {
      if (fitAddonRef.current && containerRef.current) {
        fitAddonRef.current.fit()
        term.focus()
        // Connect to SSH after fit
        connectToSSH(term, session.formData)
      }
    }, 100)

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (termRef.current) {
        termRef.current.dispose()
        termRef.current = null
      }
    }
  }, [])

  const connectToSSH = async (term, formData) => {
    try {
      const result = await connectSSH(formData)

      if (!result.id) {
        throw new Error(result.status || 'Connection failed')
      }

      const encoding = result.encoding || 'utf-8'
      decoderRef.current = new TextDecoder(encoding)
      setStatus('connected')

      term.write(`Connected to ${formData.hostname}\r\n`)
      term.write(`Encoding: ${encoding}\r\n\r\n`)

      const ws = createWebSocket(result.id)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
      }

      ws.onmessage = async (event) => {
        const text = await readAsText(event.data, decoderRef.current)
        term.write(text)
      }

      ws.onerror = (e) => {
        console.error('WebSocket error:', e)
        setError('WebSocket connection error')
      }

      ws.onclose = (e) => {
        console.log('WebSocket closed:', e.reason)
        setStatus('disconnected')
        if (e.reason && e.reason !== 'client disconnected') {
          setError(e.reason)
        }
        term.write(`\r\nConnection closed: ${e.reason || 'Unknown reason'}\r\n`)
      }

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ data }))
        }
      })

      term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ resize: [cols, rows] }))
        }
      })

      // Initial resize
      setTimeout(() => {
        fitAddonRef.current?.fit()
        const dims = fitAddonRef.current?.proposeDimensions()
        if (dims) {
          ws.send(JSON.stringify({ resize: [dims.cols, dims.rows] }))
        }
      }, 100)

    } catch (err) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect')
      setStatus('disconnected')
      term.write(`\r\n\x1b[31mError: ${err.message || 'Failed to connect'}\x1b[0m\r\n`)
    }
  }

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  return (
    <div className={`session ${isFullscreen ? 'session--fullscreen' : ''}`}>
      <div className="session__header">
        <div className="session__info">
          <span className="session__status" data-status={status}></span>
          <span className="session__title">{session.title}</span>
        </div>
        <div className="session__actions">
          <button onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            )}
          </button>
          <button onClick={onDisconnect} title="Disconnect" className="session__btn--danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="session__container" ref={containerRef}></div>
    </div>
  )
}

async function readAsText(blob, decoder) {
  if (typeof blob === 'string') {
    return blob
  }
  try {
    const buffer = await blob.arrayBuffer()
    return decoder.decode(buffer)
  } catch {
    return ''
  }
}
