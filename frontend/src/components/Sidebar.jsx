import React, { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'webssh_sessions'

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onSessionConnect, onCloseSession }) {
  const [savedSessions, setSavedSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    port: '22',
    username: '',
    password: '',
    privatekey: '',
    passphrase: '',
    totp: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const saveSessions = useCallback((sessions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!formData.name || !formData.hostname || !formData.username) return

    if (editingSession) {
      const updated = savedSessions.map(s =>
        s.name === editingSession.name ? { ...formData } : s
      )
      setSavedSessions(updated)
      saveSessions(updated)
    } else {
      const updated = [...savedSessions, { ...formData }]
      setSavedSessions(updated)
      saveSessions(updated)
    }

    setShowForm(false)
    setEditingSession(null)
    setFormData({ name: '', hostname: '', port: '22', username: '', password: '', privatekey: '', passphrase: '', totp: '' })
  }, [formData, editingSession, savedSessions, saveSessions])

  const handleEdit = useCallback((session) => {
    setEditingSession(session)
    setFormData({ ...session })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback((name) => {
    const updated = savedSessions.filter(s => s.name !== name)
    setSavedSessions(updated)
    saveSessions(updated)
  }, [savedSessions, saveSessions])

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h3 className="sidebar__title">Sessions</h3>
        <button className="sidebar__add" onClick={() => setShowForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {showForm && (
        <form className="sidebar__form" onSubmit={handleSubmit}>
          <input
            className="sidebar__input"
            type="text"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="Session name"
          />
          <input
            className="sidebar__input"
            type="text"
            value={formData.hostname}
            onChange={e => setFormData(p => ({ ...p, hostname: e.target.value }))}
            placeholder="Host"
          />
          <input
            className="sidebar__input sidebar__input--small"
            type="number"
            value={formData.port}
            onChange={e => setFormData(p => ({ ...p, port: e.target.value }))}
            placeholder="Port"
          />
          <input
            className="sidebar__input"
            type="text"
            value={formData.username}
            onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
            placeholder="Username"
          />
          <input
            className="sidebar__input"
            type="password"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            placeholder="Password"
          />
          <div className="sidebar__form-actions">
            <button type="submit" className="sidebar__btn sidebar__btn--primary">Save</button>
            <button type="button" className="sidebar__btn" onClick={() => { setShowForm(false); setEditingSession(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="sidebar__list">
        {savedSessions.map(session => (
          <div
            key={session.name}
            className={`sidebar__item ${sessions.find(s => s.title === `${session.username}@${session.hostname}`) ? 'sidebar__item--active' : ''}`}
          >
            <div className="sidebar__item-content" onClick={() => onSessionConnect(session)}>
              <div className="sidebar__item-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 10l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="sidebar__item-info">
                <div className="sidebar__item-name">{session.name}</div>
                <div className="sidebar__item-host">{session.username}@{session.hostname}</div>
              </div>
            </div>
            <div className="sidebar__item-actions">
              <button onClick={() => handleEdit(session)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(session.name)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__hint">Right-click to edit</div>
      </div>
    </aside>
  )
}
