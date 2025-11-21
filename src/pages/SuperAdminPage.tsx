import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { SafeUser, UserRole } from '../types/user'
import { UsersService } from '../services/userService'

const roles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN']

function SuperAdminPage() {
  const [users, setUsers] = useState<SafeUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
  })
  const [submitting, setSubmitting] = useState(false)

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

  const handleRoleChange = async (publicId: string, role: UserRole) => {
    try {
      const target = users.find(
        (user) => (user.public_id || user.publicId || user.id) === publicId,
      )
      if (!target) {
        alert('Користувача не знайдено в списку')
        return
      }

      await UsersService.updateUserRole(publicId, role, target)
      setUsers((prev) =>
        prev.map((user) => {
          const id = user.public_id || user.publicId || user.id
          return id === publicId ? { ...user, role } : user
        }),
      )
    } catch (err: unknown) {
      console.error('Failed to update role', err)
      alert('Не вдалося оновити роль')
    }
  }

  const handleDelete = async (publicId: string) => {
    try {
      await UsersService.deleteUser(publicId)
      setUsers((prev) =>
        prev.filter((user) => (user.public_id || user.publicId || user.id) !== publicId),
      )
    } catch (err: unknown) {
      console.error('Failed to delete user', err)
      alert('Не вдалося видалити користувача')
    }
  }

  const handleCreateChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setCreateForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!UsersService.isValidEmail(createForm.email)) {
      alert('Введіть коректний email')
      return
    }
    if (!UsersService.isStrongPassword(createForm.password)) {
      alert('Пароль має містити щонайменше 6 символів')
      return
    }
    setSubmitting(true)
    try {
      await UsersService.createUser(createForm)
      setCreateForm({ name: '', email: '', password: '', role: 'USER' })
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

  return (
    <section className="grid">
      <div className="card">
        <div className="card-title">
          <div>
            <p className="eyebrow">SUPER_ADMIN</p>
            <h2>Повний контроль</h2>
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
              const identifier = String(user.public_id || user.publicId || user.id)
              return (
                <div key={identifier} className="table-row">
                  <span>{user.name}</span>
                  <span>{user.email}</span>
                  <span>
                    <select
                      value={user.role}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        handleRoleChange(identifier, event.target.value as UserRole)
                      }
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span>
                    <button className="danger" onClick={() => handleDelete(identifier)}>
                      Видалити
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
            <p className="eyebrow">SUPER_ADMIN</p>
            <h2>Створити користувача</h2>
          </div>
        </div>

        <form className="form" onSubmit={handleCreateSubmit}>
          <label>
            Ім&apos;я
            <input
              type="text"
              name="name"
              value={createForm.name}
              onChange={handleCreateChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={createForm.email}
              onChange={handleCreateChange}
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
              value={createForm.password}
              onChange={handleCreateChange}
              required
              minLength={6}
              placeholder="Мінімум 6 символів"
            />
          </label>
          <label>
            Роль
            <select name="role" value={createForm.role} onChange={handleCreateChange}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
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

export default SuperAdminPage
