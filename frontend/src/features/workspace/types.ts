export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"

export interface Workspace {
  id: string
  name: string
  description: string
  role: Role
  inviteCode: string | null
}
