const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include', // sends HttpOnly cookie
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed', code: 'UNKNOWN' }))
      throw new APIError(res.status, error.error || 'Request failed', error.code)
    }
    return res.json()
  }

  async get<T>(path: string) {
    return this.request<T>(path)
  }

  async post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  async patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }

  async delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export class APIError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message)
    this.name = 'APIError'
  }
}

export const api = new APIClient()
