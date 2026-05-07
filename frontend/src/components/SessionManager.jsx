import React, { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'webssh_sessions'

export default function SessionManager({ onConnect, onClose }) {
  const [sessions, setSessions] = useState([])
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
        const parsed = JSON.parse(saved)
        setSessions(parsed.filter(s => s.name && s.hostname && s.username))
      } catch (e) {
        console.error('Failed to parse saved sessions')
      }
    }
  }, [])

  const saveSessions = useCallback((sessions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!formData.name || !formData.hostname || !formData.username) return

    const newSession = { ...formData }

    if (editingSession) {
      setSessions(prev => {
        const updated = prev.map(s =>
          s.name === editingSession.name ? newSession : s
        )
        saveSessions(updated)
        return updated
      })
    } else {
      setSessions(prev => {
        const updated = [...prev, newSession]
        saveSessions(updated)
        return updated
      })
    }

    setShowForm(false)
    setEditingSession(null)
    setFormData({
      name: '',
      hostname: '',
      port: '22',
      username: '',
      password: '',
      privatekey: '',
      passphrase: '',
      totp: ''
    })
  }, [formData, editingSession, saveSessions])

  const handleEdit = useCallback((session) => {
    setEditingSession(session)
    setFormData({ ...session })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback((name) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.name !== name)
      saveSessions(updated)
      return updated
    })
  }, [saveSessions])

  const handleConnect = useCallback((session) => {
    onConnect({
      hostname: session.hostname,
      port: session.port || '22',
      username: session.username,
      password: session.password || '',
      privatekey: session.privatekey ? new File([session.privatekey], 'key') : null,
      passphrase: session.passphrase || '',
      totp: session.totp || ''
    })
  }, [onConnect])

  return (
    <div className="sm">
      <div className="sm__header">
        <div className="sm__title-row">
          <svg className="sm__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <h2 className="sm__title">Connection Manager</h2>
        </div>
        <button className="sm__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showForm && (
        <form className="sm-form" onSubmit={handleSubmit}>
          <div className="sm-form__header">
            <h3 className="sm-form__title">
              {editingSession ? 'Edit Connection' : 'New Connection'}
            </h3>
            <button type="button" className="sm-form__cancel" onClick={() => {
              setShowForm(false)
              setEditingSession(null)
            }}>
              Cancel
            </button>
          </div>

          <div className="sm-form__body">
            <div className="sm-form__section">
              <label className="sm-form__label">Connection Name</label>
              <input
                className="sm-form__input"
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Production Server"
              />
            </div>

            <div className="sm-form__row">
              <div className="sm-form__section sm-form__section--grow">
                <label className="sm-form__label">Hostname / IP</label>
                <input
                  className="sm-form__input"
                  type="text"
                  value={formData.hostname}
                  onChange={e => setFormData(p => ({ ...p, hostname: e.target.value }))}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="sm-form__section sm-form__section--shrink">
                <label className="sm-form__label">Port</label>
                <input
                  className="sm-form__input"
                  type="number"
                  value={formData.port}
                  onChange={e => setFormData(p => ({ ...p, port: e.target.value }))}
                  placeholder="22"
                />
              </div>
            </div>

            <div className="sm-form__section">
              <label className="sm-form__label">Username</label>
              <input
                className="sm-form__input"
                type="text"
                value={formData.username}
                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                placeholder="root"
              />
            </div>

            <div className="sm-form__section">
              <label className="sm-form__label">Password</label>
              <input
                className="sm-form__input"
                type="password"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div className="sm-form__section">
              <label className="sm-form__label">Private Key (PEM)</label>
              <textarea
                className="sm-form__textarea"
                value={formData.privatekey}
                onChange={e => setFormData(p => ({ ...p, privatekey: e.target.value }))}
                placeholder={"-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAL..."}
                rows={4}
              />
            </div>

            <div className="sm-form__row">
              <div className="sm-form__section">
                <label className="sm-form__label">Passphrase</label>
                <input
                  className="sm-form__input"
                  type="password"
                  value={formData.passphrase}
                  onChange={e => setFormData(p => ({ ...p, passphrase: e.target.value }))}
                />
              </div>
              <div className="sm-form__section">
                <label className="sm-form__label">TOTP (2FA)</label>
                <input
                  className="sm-form__input"
                  type="password"
                  value={formData.totp}
                  onChange={e => setFormData(p => ({ ...p, totp: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="sm-form__footer">
            <button type="submit" className="sm-btn sm-btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {editingSession ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="sm__actions">
        <button className="sm-btn sm-btn--add" onClick={() => setShowForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New
        </button>
      </div>

      <div className="sm__list">
        {sessions.length === 0 && !showForm && (
          <div className="sm__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p>No saved connections</p>
            <span>Add your first server connection above</span>
          </div>
        )}
        {sessions.map((session, index) => (
          <div
            key={session.name}
            className="sm-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="sm-card__content" onClick={() => handleConnect(session)}>
              <div className="sm-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                </svg>
              </div>
              <div className="sm-card__info">
                <div className="sm-card__name">{session.name}</div>
                <div className="sm-card__host">
                  <span className="sm-card__user">{session.username}</span>
                  <span className="sm-card__at">@</span>
                  <span className="sm-card__addr">{session.hostname}</span>
                  <span className="sm-card__port">:{session.port || 22}</span>
                </div>
              </div>
            </div>
            <div className="sm-card__actions">
              <button className="sm-card__btn" onClick={() => handleEdit(session)} title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button className="sm-card__btn sm-card__btn--danger" onClick={() => handleDelete(session.name)} title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
