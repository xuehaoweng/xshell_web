import React, { useState, useCallback } from 'react'

export default function LoginForm({ onConnect }) {
  const [formData, setFormData] = useState({
    hostname: '',
    port: '22',
    username: '',
    password: '',
    privatekey: '',
    passphrase: '',
    totp: ''
  })
  const [errors, setErrors] = useState({})

  const validate = useCallback(() => {
    const errs = {}
    if (!formData.hostname) errs.hostname = 'Required'
    if (!formData.username) errs.username = 'Required'
    return errs
  }, [formData])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onConnect(formData)
  }, [formData, validate, onConnect])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-form__title">New Connection</h2>

      <div className="login-form__row">
        <div className="login-form__field login-form__field--grow">
          <label>Host</label>
          <input
            type="text"
            name="hostname"
            value={formData.hostname}
            onChange={handleChange}
            placeholder="192.168.1.1"
            className={errors.hostname ? 'login-form__input--error' : ''}
          />
          {errors.hostname && <span className="login-form__error">{errors.hostname}</span>}
        </div>
        <div className="login-form__field login-form__field--small">
          <label>Port</label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleChange}
            placeholder="22"
          />
        </div>
      </div>

      <div className="login-form__field">
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="root"
          className={errors.username ? 'login-form__input--error' : ''}
        />
        {errors.username && <span className="login-form__error">{errors.username}</span>}
      </div>

      <div className="login-form__field">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />
      </div>

      <div className="login-form__field">
        <label>Private Key (PEM)</label>
        <textarea
          name="privatekey"
          value={formData.privatekey}
          onChange={handleChange}
          placeholder="-----BEGIN RSA PRIVATE KEY-----"
        />
      </div>

      <div className="login-form__row">
        <div className="login-form__field">
          <label>Passphrase</label>
          <input
            type="password"
            name="passphrase"
            value={formData.passphrase}
            onChange={handleChange}
            placeholder="Key passphrase"
          />
        </div>
        <div className="login-form__field">
          <label>TOTP</label>
          <input
            type="password"
            name="totp"
            value={formData.totp}
            onChange={handleChange}
            placeholder="6-digit code"
          />
        </div>
      </div>

      <button type="submit" className="login-form__submit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span>Connect</span>
      </button>
    </form>
  )
}
