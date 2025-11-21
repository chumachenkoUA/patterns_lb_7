import { useState, type ChangeEvent, type FormEvent } from 'react'

type LoginForm = { email: string; password: string }
type RegisterForm = { name: string; email: string; password: string }

type Props = {
  loading: boolean
  error: string
  onLogin: (data: LoginForm) => Promise<void>
  onRegister: (data: RegisterForm) => Promise<void>
  onClearError: () => void
}

type AuthMode = 'login' | 'register'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthPage({ loading, error, onLogin, onRegister, onClearError }: Props) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  const switchMode = (next: AuthMode) => {
    setMode(next)
    onClearError()
    setFormError('')
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!EMAIL_REGEX.test(loginForm.email)) {
      setFormError('Введіть коректний email')
      return
    }
    if (loginForm.password.length < 6) {
      setFormError('Пароль має містити щонайменше 6 символів')
      return
    }
    await onLogin(loginForm)
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!EMAIL_REGEX.test(registerForm.email)) {
      setFormError('Введіть коректний email')
      return
    }
    if (registerForm.password.length < 6) {
      setFormError('Пароль має містити щонайменше 6 символів')
      return
    }
    await onRegister(registerForm)
  }

  return (
    <div className="card auth-card">
      <div className="card-title">
        <div>
          <p className="eyebrow">Автентифікація</p>
          <h2>{mode === 'login' ? 'Вхід' : 'Реєстрація'}</h2>
        </div>
        <div className="auth-toggle" role="group" aria-label="Перемикач форми">
          <button
            type="button"
            className={mode === 'login' ? '' : 'ghost'}
            onClick={() => switchMode('login')}
          >
            Вхід
          </button>
          <button
            type="button"
            className={mode === 'register' ? '' : 'ghost'}
            onClick={() => switchMode('register')}
          >
            Реєстрація
          </button>
        </div>
      </div>

      {mode === 'login' ? (
        <form className="form" onSubmit={handleLoginSubmit}>
          <label>
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setLoginForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              value={loginForm.password}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Входимо...' : 'Увійти'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={handleRegisterSubmit}>
          <label>
            Ім&apos;я
            <input
              type="text"
              value={registerForm.name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              pattern={EMAIL_REGEX.source}
              value={registerForm.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              minLength={6}
              value={registerForm.password}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Реєструємо...' : 'Зареєструватись'}
          </button>
        </form>
      )}
      {(formError || error) && <p className="error">{formError || error}</p>}
    </div>
  )
}

export default AuthPage
