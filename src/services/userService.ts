import client from '../api/client'
import type { SafeUser, UserRole } from '../types/user'

type Nullable<T> = T | null | undefined

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role?: UserRole
}

export class UsersService {
  static emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  static isValidEmail(email: Nullable<string>): boolean {
    return typeof email === 'string' && UsersService.emailPattern.test(email.trim())
  }

  static isStrongPassword(password: Nullable<string>): boolean {
    return typeof password === 'string' && password.length >= 6
  }

  static async fetchUsers(role?: UserRole): Promise<SafeUser[]> {
    const response = await client.get<{ users: SafeUser[] }>('/users', {
      params: role ? { role } : undefined,
    })
    return response.data?.users || []
  }

  static async createUser(payload: CreateUserPayload): Promise<void> {
    await client.post('/auth/register', {
      ...payload,
      role: payload.role || 'USER',
    })
  }

  static async deleteUser(publicId: string): Promise<void> {
    await client.delete(`/users/${publicId}`)
  }

  static async updateUserRole(publicId: string, role: UserRole, user: SafeUser): Promise<void> {
    await client.put(`/users/${publicId}`, {
      name: user.name,
      email: user.email,
      role,
    })
  }
}
