import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { SafeUser, UserRole } from '../types/user'
import { UsersService } from '../services/userService'

type CreateUserForm = { name: string; email: string; password: string; role: UserRole }

const initialForm: CreateUserForm = { name: '', email: '', password: '', role: 'USER' }

function AdminPage() {
  const [users, setUsers] = useState<SafeUser[]>([])
  const [form, setForm] = useState<CreateUserForm>(initialForm)
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const list = await UsersService.fetchUsers()
      setUsers(list)
      setError('')
    } catch (err: unknown) {
      console.error('Failed to load users', err)
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
        || 'Помилка завантаження даних'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    if (!UsersService.isValidEmail(form.email)) {
      alert('Введіть коректний email')
      setSubmitting(false)
      return
    }
    if (!UsersService.isStrongPassword(form.password)) {
      alert('Пароль має містити щонайменше 6 символів')
      setSubmitting(false)
      return
    }
    try {
      await UsersService.createUser(form)
      setForm(initialForm)
      await fetchUsers()
    } catch (err: unknown) {
      console.error('Failed to create user', err)
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
        || 'Не вдалося створити користувача'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user: SafeUser) => {
    const publicId = user.public_id || user.publicId || user.id
    if (!publicId) {
      alert('Некоректний ідентифікатор користувача')
      return
    }
    const targetId = String(publicId)
    if (user.role !== 'USER') {
      alert('Адмін не може видаляти ADMIN або SUPER_ADMIN')
      return
    }
    try {
      await UsersService.deleteUser(targetId)
      await fetchUsers()
    } catch (err: unknown) {
      console.error('Failed to delete user', err)
      alert('Не вдалося видалити користувача')
    }
  }

  return (
    <section className="grid">
      <div className="card">
        <div className="card-title">
          <div>
            <p className="eyebrow">ADMIN</p>
            <h2>Керування користувачами</h2>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={fetchUsers}
            disabled={loading}
          >
            Оновити
          </button>
        </div>

        {loading && <p className="muted">Завантаження...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="table">
            <div className="table-head">
              <span>Ім&apos;я</span>
              <span>Email</span>
              <span>Роль</span>
              <span>Дії</span>
            </div>
            {users.map((user) => {
              const id = user.public_id || user.publicId || user.id
              const isProtected = user.role !== 'USER'
              return (
                <div key={String(id)} className="table-row">
                  <span>{user.name}</span>
                  <span>{user.email}</span>
                  <span className="pill">{user.role}</span>
                  <span>
                    <button
                      className="danger"
                      onClick={() => handleDelete(user)}
                      disabled={isProtected}
                      title={isProtected ? 'Можна видаляти тільки USER' : undefined}
                    >
                      {isProtected ? 'Захищено' : 'Видалити'}
                    </button>
                  </span>
                </div>
              )
            })}
            {users.length === 0 && (
              <div className="table-row">
                <span className="muted">Немає користувачів</span>
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          <div>
            <p className="eyebrow">Новий користувач</p>
            <h2>Створити</h2>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Ім&apos;я
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ім'я"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              pattern={UsersService.emailPattern.source}
              placeholder="user@example.com"
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Мінімум 6 символів"
            />
          </label>
          <label>
            Роль
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Створення...' : 'Створити'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AdminPage
