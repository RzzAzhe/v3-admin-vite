export interface OperationLog {
  id: string
  username: string
  module: string
  action: string
  description: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
  timestamp: string
}

export type OperationLogAction = "create" | "update" | "delete" | "view" | "login" | "logout" | "export" | "import"

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
