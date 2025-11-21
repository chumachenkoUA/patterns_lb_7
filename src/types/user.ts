export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export type SafeUser = {
  id: number
  publicId: string
  name: string
  email: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
  public_id?: string
}
