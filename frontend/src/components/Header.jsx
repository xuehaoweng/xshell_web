import React, { useState, useCallback, useEffect, useRef } from 'react'

export default function Header({ sessions, activeSessionId, onSelectSession, onCloseSession, onReconnectSession, onNewConnection, onToggleSidebar, onFontSizeChange, onExportSessions, onImportSessions, onClearSessions, fontSize, showSidebar }) {
  const [contextMenu, setContextMenu] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)
  const settingsRef = useRef(null)

  const handleContextMenu = useCallback((e, session) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sessionId: session.id
    })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu()
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [closeContextMenu])

  const handleExport = useCallback(() => {
    const saved = localStorage.getItem('webssh_sessions')
    if (!saved) {
      alert('No sessions to export')
      return
    }
    const blob = new Blob([saved], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webssh-sessions-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSettingsOpen(false)
  }, [])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (Array.isArray(data)) {
            localStorage.setItem('webssh_sessions', JSON.stringify(data))
            onImportSessions()
            alert(`Successfully imported ${data.length} sessions`)
          } else {
            alert('Invalid session file format')
          }
        } catch {
          alert('Failed to parse session file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
    setSettingsOpen(false)
  }, [onImportSessions])

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to delete all saved sessions? This cannot be undone.')) {
      onClearSessions()
      setSettingsOpen(false)
    }
  }, [onClearSessions])

  return (
    <>
      <header className="header">
        <div className="header__left">
          <button className={`header__toggle ${showSidebar ? 'header__toggle--active' : ''}`} onClick={onToggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
          <div className="header__logo">
            <svg className="header__logo-icon" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="4" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 12l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="24" cy="8" r="4" fill="var(--accent)" opacity="0.9"/>
              <path d="M22.5 8l1 1 2-2" stroke="var(--bg-deep)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="header__logo-text">
              <span className="header__logo-brand">Web</span><span className="header__logo-accent">SSH</span>
            </span>
          </div>
        </div>

        <div className="header__tabs">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`header__tab ${session.id === activeSessionId ? 'header__tab--active' : ''}`}
              onClick={() => onSelectSession(session.id)}
              onContextMenu={(e) => handleContextMenu(e, session)}
            >
              <span className="header__tab-status" data-status={session.status}></span>
              <span className="header__tab-title">{session.title}</span>
              <button
                className="header__tab-close"
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseSession(session.id)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button className="header__tab header__tab--new" onClick={onNewConnection}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="header__right">
          <div className="settings-container" ref={settingsRef}>
            <button
              className={`header__btn ${settingsOpen ? 'header__btn--active' : ''}`}
              title="Settings"
              onClick={(e) => {
                e.stopPropagation()
                setSettingsOpen(!settingsOpen)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {settingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <div className="settings-label">Terminal Font Size</div>
                  <div className="settings-font-size">
                    <button
                      className="settings-font-btn"
                      onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="settings-font-value">{fontSize}px</span>
                    <button
                      className="settings-font-btn"
                      onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-item" onClick={handleExport}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export Sessions
                </div>

                <div className="settings-item" onClick={handleImport}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Import Sessions
                </div>

                <div className="settings-divider"></div>

                <div className="settings-item settings-item--danger" onClick={handleClearAll}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                  Clear All Sessions
                </div>

                <div className="settings-divider"></div>

                <div className="settings-about">
                  <div className="settings-about-title">WebSSH</div>
                  <div className="settings-about-version">Version 1.5.3</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {contextMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div
            className="context-menu__item"
            onClick={() => {
              onReconnectSession(contextMenu.sessionId)
              closeContextMenu()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Reconnect
          </div>
          <div
            className="context-menu__item context-menu__item--danger"
            onClick={() => {
              onCloseSession(contextMenu.sessionId)
              closeContextMenu()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Disconnect
          </div>
        </div>
      )}
    </>
  )
}
