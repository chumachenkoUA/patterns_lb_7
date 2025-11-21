import { useEffect, useState } from 'react'
import AdminPage from './pages/AdminPage'
import SuperAdminPage from './pages/SuperAdminPage'
import AuthPage from './pages/AuthPage'
import client, { setAuthToken } from './api/client'
import type { SafeUser } from './types/user'

type AuthSession = {
  token: string
  user: SafeUser
}

const loadSession = (): AuthSession | null => {
  try {
    const stored = localStorage.getItem('authSession')
    return stored ? (JSON.parse(stored) as AuthSession) : null
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(loadSession)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (session?.token) {
      setAuthToken(session.token)
      localStorage.setItem('authSession', JSON.stringify(session))
    } else {
      setAuthToken(null)
      localStorage.removeItem('authSession')
    }
  }, [session])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setAuthLoading(true)
    try {
      const { data } = await client.post<{ token: string; user: SafeUser }>(
        '/auth/login',
        credentials,
      )
      setSession({ token: data.token, user: data.user })
      setAuthError('')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
        || 'Не вдалося увійти'
      setAuthError(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (payload: {
    name: string
    email: string
    password: string
  }) => {
    setAuthLoading(true)
    try {
      await client.post('/auth/register', payload)
      // Після реєстрації одразу логінимося
      const { data } = await client.post<{ token: string; user: SafeUser }>(
        '/auth/login',
        {
            email: payload.email,
            password: payload.password,
        },
      )
      setSession({ token: data.token, user: data.user })
      setAuthError('')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
        || 'Не вдалося зареєструватися'
      setAuthError(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setSession(null)
    setAuthToken(null)
  }

  const role = session?.user?.role

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Role based demo</p>
          <h1>Керування доступом</h1>
        </div>
        {session && (
          <div className="auth-panel">
            <p className="eyebrow">Поточний користувач</p>
            <strong>{session.user.name}</strong>
            <span className="muted">{session.user.email}</span>
            <span className="pill">{session.user.role}</span>
            <button className="ghost" type="button" onClick={handleLogout}>
              Вийти
            </button>
          </div>
        )}
      </header>

      <main className="content">
        {!session && (
          <AuthPage
            loading={authLoading}
            error={authError}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onClearError={() => setAuthError('')}
          />
        )}

        {session && (
          <div className="card">
            <div className="card-title">
              <div>
                <p className="eyebrow">Профіль</p>
                <h2>{session.user.name}</h2>
              </div>
              <span className="pill">{session.user.role}</span>
            </div>
            <p className="muted">{session.user.email}</p>
          </div>
        )}

        {role === 'SUPER_ADMIN' && <SuperAdminPage />}
        {role === 'ADMIN' && <AdminPage />}
        {role === 'USER' && session && (
          <div className="card">
            <div className="card-title">
              <div>
                <p className="eyebrow">USER</p>
                <h2>Обмежений доступ</h2>
              </div>
            </div>
            <p className="muted">
              Звичайні користувачі не бачать список. Зверніться до адміністратора для
              підвищення ролі.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
