import React from 'react'

export default function SessionTabs({ sessions, activeId, onSelect, onClose, onNew }) {
  return (
    <div className="session-tabs">
      <div className="session-tabs__list">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`session-tab ${session.id === activeId ? 'session-tab--active' : ''}`}
            onClick={() => onSelect(session.id)}
          >
            <div className="session-tab__status" data-status={session.status}></div>
            <span className="session-tab__title">{session.title}</span>
            <button
              type="button"
              className="session-tab__close"
              onClick={(e) => {
                e.stopPropagation()
                onClose(session.id)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="session-tabs__new" onClick={onNew} title="New session">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  )
}
