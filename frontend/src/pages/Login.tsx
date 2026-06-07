import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import { login, checkApiHealth } from '../services/api'

interface LoginProps {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [isWarningOpen, setWarningOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
  const [checkingApi, setCheckingApi] = useState(true)
  const navigate = useNavigate()

  const openWarning = (message: string) => {
    setWarningMessage(message)
    setWarningOpen(true)
  }

  useEffect(() => {
    let mounted = true

    const verifyConnection = async () => {
      try {
        await checkApiHealth()
        if (mounted) {
          setApiHealthy(true)
        }
      } catch (err) {
        if (mounted) {
          setApiHealthy(false)
          openWarning('Unable to reach the Perpus API. Please make sure the backend is running.')
        }
      } finally {
        if (mounted) {
          setCheckingApi(false)
        }
      }
    }

    verifyConnection()

    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    if (apiHealthy === false) {
      openWarning('Cannot reach the API right now. Check your connection or start the backend service.')
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      onLogin()
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Login failed') {
          setError('Invalid credentials')
        } else {
          openWarning(`Unable to login: ${err.message}`)
        }
      } else {
        openWarning('Unable to reach the login service. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h1>Perpus</h1>
          <p>Library Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading || apiHealthy === false}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className={`api-status ${apiHealthy ? 'online' : apiHealthy === false ? 'offline' : ''}`}>
            {checkingApi && 'Checking connection to the API...'}
            {!checkingApi && apiHealthy && 'Backend online'}
            {!checkingApi && apiHealthy === false && 'Backend unreachable'}
          </p>
        </form>

        <div className="login-footer">
          <p>Demo credentials: admin / admin123 or librarian / lib123</p>
        </div>
      </div>

      {isWarningOpen && (
        <div className="warning-dialog-backdrop" role="alertdialog" aria-live="assertive">
          <div className="warning-dialog">
            <h3>Warning</h3>
            <p>{warningMessage}</p>
            <button type="button" className="warning-close" onClick={() => setWarningOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login