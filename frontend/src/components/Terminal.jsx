import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export default function Terminal({ ssh, sessionInfo }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!containerRef.current || termRef.current) return

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.2,
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: 'rgba(88, 166, 255, 0.3)',
        black: '#0d1117',
        red: '#f85149',
        green: '#238636',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#e6edf3',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#ffffff'
      },
      scrollback: 10000,
      allowProposedApi: true
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)
    fitAddon.fit()

    setInitialized(true)

    return () => {
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
      setInitialized(false)
    }
  }, [])

  useEffect(() => {
    if (!initialized || !ssh || !termRef.current) return

    const term = termRef.current

    const handleData = (data) => {
      ssh.sendData(data)
    }

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
        const dims = fitAddonRef.current.proposeDimensions()
        if (dims) {
          ssh.sendResize(dims.cols, dims.rows)
        }
      }
    }

    term.onData(handleData)
    term.onResize(handleResize)

    ssh.connect(term, (text) => {
      term.write(text)
    })

    window.addEventListener('resize', handleResize)

    setTimeout(() => {
      handleResize()
      term.focus()
    }, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initialized, ssh])

  useEffect(() => {
    if (!initialized) return

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialized])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const copyToClipboard = useCallback(() => {
    if (termRef.current) {
      const selection = termRef.current.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
      }
    }
  }, [])

  return (
    <div className={`terminal-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="terminal__header">
        <div className="terminal__info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
          <span>{sessionInfo?.title || 'Terminal'}</span>
          {sessionInfo?.encoding && (
            <span style={{ color: 'var(--text-muted)' }}>
              ({sessionInfo.encoding})
            </span>
          )}
        </div>
        <div className="terminal__actions">
          <button className="btn-secondary" onClick={copyToClipboard} title="Copy selection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button className="btn-secondary" onClick={toggleFullscreen} title="Toggle fullscreen">
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="terminal__container" ref={containerRef}></div>
    </div>
  )
}
