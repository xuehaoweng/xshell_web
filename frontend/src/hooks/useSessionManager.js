import { useState, useCallback, useRef } from 'react'

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function useSessionManager() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const sshInstances = useRef({})
  const formDataRef = useRef({})

  const createSession = useCallback((formData) => {
    const id = generateId()
    const title = `${formData.username}@${formData.hostname}:${formData.port || 22}`

    const newSession = {
      id,
      title,
      formData,
      status: 'connecting'
    }

    formDataRef.current[id] = formData

    setSessions(prev => [...prev, newSession])
    setActiveSessionId(id)

    return id
  }, [])

  const closeSession = useCallback((sessionId) => {
    const ssh = sshInstances.current[sessionId]
    if (ssh) {
      ssh.disconnect()
      delete sshInstances.current[sessionId]
      delete formDataRef.current[sessionId]
    }

    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId)
      if (activeSessionId === sessionId) {
        setActiveSessionId(newSessions.length > 0 ? newSessions[newSessions.length - 1].id : null)
      }
      return newSessions
    })
  }, [activeSessionId])

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId)
  }, [])

  const newSession = useCallback(() => {
    setActiveSessionId(null)
  }, [])

  const updateSessionStatus = useCallback((sessionId, status) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, status } : s
    ))
  }, [])

  const updateSessionError = useCallback((sessionId, error) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, error } : s
    ))
  }, [])

  const updateSessionInfo = useCallback((sessionId, sessionInfo) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, title: sessionInfo?.title || s.title } : s
    ))
  }, [])

  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId)
  }, [sessions, activeSessionId])

  const getActiveFormData = useCallback(() => {
    return activeSessionId ? formDataRef.current[activeSessionId] : null
  }, [activeSessionId])

  const registerSSH = useCallback((sessionId, ssh) => {
    sshInstances.current[sessionId] = ssh
  }, [])

  const getSSH = useCallback((sessionId) => {
    return sshInstances.current[sessionId]
  }, [])

  return {
    sessions,
    activeSessionId,
    createSession,
    closeSession,
    selectSession,
    newSession,
    updateSessionStatus,
    updateSessionError,
    updateSessionInfo,
    getActiveSession,
    getActiveFormData,
    registerSSH,
    getSSH
  }
}
