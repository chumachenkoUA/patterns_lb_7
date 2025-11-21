import { useEffect, useState, type ChangeEvent } from 'react'
import client from '../api/client'
import type { SafeUser, UserRole } from '../types/user'

const roles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN']

function SuperAdminPage() {
  const [users, setUsers] = useState<SafeUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await client.get<{ users: SafeUser[] }>('/users')
      setUsers(response.data?.users || [])
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

      await client.put(`/users/${publicId}`, {
        name: target.name,
        email: target.email,
        role,
      })
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
      await client.delete(`/users/${publicId}`)
      setUsers((prev) =>
        prev.filter((user) => (user.public_id || user.publicId || user.id) !== publicId),
      )
    } catch (err: unknown) {
      console.error('Failed to delete user', err)
      alert('Не вдалося видалити користувача')
    }
  }

  return (
    <section className="card">
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
    </section>
  )
}

export default SuperAdminPage
