import { useState, useCallback, useRef } from 'react'
import { connectSSH, createWebSocket } from '../services/api'

export default function useSSH() {
  const [status, setStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const wsRef = useRef(null)
  const decoderRef = useRef(null)

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus('disconnected')
    setSessionInfo(null)
  }, [])

  const connect = useCallback(async (formData) => {
    if (status === 'connecting' || status === 'connected') {
      return
    }

    setStatus('connecting')
    setError(null)

    try {
      const result = await connectSSH(formData)

      if (!result.id) {
        throw new Error(result.status || 'Connection failed')
      }

      const encoding = result.encoding || 'utf-8'
      decoderRef.current = new TextDecoder(encoding)
      setSessionInfo({
        id: result.id,
        encoding: encoding,
        title: `${formData.username}@${formData.hostname}:${formData.port || 22}`
      })
      setStatus('connected')

      const ws = createWebSocket(result.id)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = async (event) => {
        const text = await readAsText(event.data, decoderRef.current)
        // Data will be handled via callback
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
        setSessionInfo(null)
      }

    } catch (err) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect')
      setStatus('disconnected')
    }
  }, [status])

  const sendData = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ data }))
    }
  }, [])

  const sendResize = useCallback((cols, rows) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ resize: [cols, rows] }))
    }
  }, [])

  return {
    status,
    error,
    sessionInfo,
    connect,
    disconnect,
    sendData,
    sendResize,
    ws: wsRef.current
  }
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
