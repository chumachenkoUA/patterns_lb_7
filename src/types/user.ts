export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export type SafeUser = {
  id: number
  publicId: string
  name: string
  email: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
  // підтримуємо старий snake_case для сумісності, якщо бекенд поверне public_id
  public_id?: string
}
