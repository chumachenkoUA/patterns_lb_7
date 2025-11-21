import { useEffect, useState } from 'react'
import client from '../api/client'
import type { SafeUser } from '../types/user'

function UserPage() {
  const [users, setUsers] = useState<SafeUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await client.get<{ users: SafeUser[] }>('/users', {
          params: { role: 'USER' },
        })
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

    fetchUsers()
  }, [])

  return (
    <section className="card">
      <div className="card-title">
        <div>
          <p className="eyebrow">USER</p>
          <h2>Список звичайних користувачів</h2>
        </div>
      </div>

      {loading && <p className="muted">Завантаження...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table">
          <div className="table-head">
            <span>Ім&apos;я</span>
            <span>Email</span>
            <span>Роль</span>
          </div>
          {users.map((user) => {
            const id = user.publicId || user.public_id || user.id
            return (
              <div key={String(id)} className="table-row">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span className="pill">{user.role}</span>
              </div>
            )
          })}
          {users.length === 0 && (
            <div className="table-row">
              <span className="muted">Немає користувачів з роллю USER</span>
              <span />
              <span />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default UserPage
