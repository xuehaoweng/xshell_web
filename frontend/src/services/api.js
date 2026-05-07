export async function connectSSH(formData) {
  let privateKey = ''
  if (formData.privatekey) {
    privateKey = await formData.privatekey.text()
  }

  const response = await fetch('/api/ssh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      hostname: formData.hostname,
      port: formData.port || '22',
      username: formData.username,
      password: formData.password || '',
      privatekey: privateKey,
      passphrase: formData.passphrase || '',
      totp: formData.totp || '',
      term: 'xterm-256color'
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(`Connection failed: ${response.status} ${response.statusText} - ${result.status || ''}`)
  }

  return result
}

export function createWebSocket(sessionId) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  const wsUrl = `${protocol}//${host}/ws?id=${sessionId}`
  return new WebSocket(wsUrl)
}
