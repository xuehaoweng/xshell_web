import React, { useState, useCallback, useRef, useEffect } from 'react'
import Header from './components/Header'
import LoginForm from './components/LoginForm'
import Session from './components/Session'
import Sidebar from './components/Sidebar'
import './styles/global.css'

export default function App() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('webssh_fontsize')
    return saved ? parseInt(saved, 10) : 14
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const sshInstances = useRef({})

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const createSession = useCallback((formData) => {
    const id = Math.random().toString(36).substring(2, 9)
    const title = `${formData.username}@${formData.hostname}:${formData.port || 22}`
    const newSession = {
      id,
      title,
      formData,
      status: 'connecting'
    }
    setSessions(prev => [...prev, newSession])
    setActiveSessionId(id)
    setShowLogin(false)
    return id
  }, [])

  const closeSession = useCallback((sessionId) => {
    const ssh = sshInstances.current[sessionId]
    if (ssh) {
      ssh.disconnect()
      delete sshInstances.current[sessionId]
    }
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId)
      if (activeSessionId === sessionId) {
        setActiveSessionId(newSessions.length > 0 ? newSessions[newSessions.length - 1].id : null)
      }
      return newSessions
    })
  }, [activeSessionId])

  const reconnectSession = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      closeSession(sessionId)
      setTimeout(() => {
        createSession(session.formData)
      }, 100)
    }
  }, [sessions, closeSession, createSession])

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId)
  }, [])

  const handleConnect = useCallback((formData) => {
    createSession(formData)
  }, [createSession])

  const handleNewConnection = useCallback(() => {
    setShowLogin(true)
  }, [])

  const handleLoginClose = useCallback(() => {
    setShowLogin(false)
  }, [])

  const handleSessionConnect = useCallback((session) => {
    createSession({
      hostname: session.hostname,
      port: session.port || '22',
      username: session.username,
      password: session.password || '',
      privatekey: session.privatekey ? new File([session.privatekey], 'key') : null,
      passphrase: session.passphrase || '',
      totp: session.totp || ''
    })
  }, [createSession])

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev)
  }, [])

  const handleFontSizeChange = useCallback((newSize) => {
    setFontSize(newSize)
    localStorage.setItem('webssh_fontsize', newSize.toString())
  }, [])

  const handleImportSessions = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleClearSessions = useCallback(() => {
    localStorage.removeItem('webssh_sessions')
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <div className="app">
      <Header
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onCloseSession={closeSession}
        onReconnectSession={reconnectSession}
        onNewConnection={handleNewConnection}
        onToggleSidebar={toggleSidebar}
        onFontSizeChange={handleFontSizeChange}
        onImportSessions={handleImportSessions}
        onClearSessions={handleClearSessions}
        fontSize={fontSize}
        showSidebar={showSidebar}
      />

      <div className="app__body">
        {showSidebar && (
          <Sidebar
            key={refreshKey}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={selectSession}
            onSessionConnect={handleSessionConnect}
            onCloseSession={closeSession}
          />
        )}

        <main className="app__main">
          {showLogin && (
            <div className="login-modal">
              <div className="login-modal__content">
                <button className="login-modal__close" onClick={handleLoginClose}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <LoginForm onConnect={handleConnect} />
              </div>
            </div>
          )}

          {!activeSession && !showLogin && sessions.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 18l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 30h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="36" cy="14" r="6" fill="var(--accent)" opacity="0.9"/>
                  <path d="M34 14l1.5 1.5L38 12" stroke="var(--bg-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="empty-state__title">No Active Session</h2>
              <p className="empty-state__text">Select a saved session from the sidebar or create a new connection to get started</p>
              <button className="empty-state__btn" onClick={handleNewConnection}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New Connection</span>
              </button>
            </div>
          )}

          {sessions.map(session => (
            <div
              key={session.id}
              className={`app__session ${session.id === activeSessionId ? 'app__session--active' : ''}`}
            >
              <Session
                session={session}
                ssh={sshInstances.current[session.id]}
                onDisconnect={() => closeSession(session.id)}
                isActive={session.id === activeSessionId}
                fontSize={fontSize}
              />
            </div>
          ))}
        </main>
      </div>

      {activeSession && (
        <footer className="statusbar">
          <div className="statusbar__left">
            <span className="statusbar__item">
              <span className="statusbar__dot statusbar__dot--success"></span>
              Connected
            </span>
          </div>
          <div className="statusbar__right">
            <span className="statusbar__item">{activeSession?.title}</span>
            <span className="statusbar__item">UTF-8</span>
            <span className="statusbar__item">{fontSize}px</span>
          </div>
        </footer>
      )}
    </div>
  )
}
