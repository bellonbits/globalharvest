import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearApiCache, SESSION_EXPIRED_EVENT } from '../api/client'
import { can as canRole, type Permission } from '../rbac'
import { authService } from '../services'
import type { CurrentUser } from '../types'

interface AuthState {
  user: CurrentUser | null
  loading: boolean
  expired: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => Promise<void>
  can: (permission: Permission) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Refresh the session this long before it expires, while the admin is active. */
const REFRESH_MARGIN_MS = 10 * 60 * 1000
/** Never schedule further ahead than this (browser timers overflow above ~24.8 days). */
const MAX_REFRESH_DELAY_MS = 6 * 60 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Any 401 from the API means the session is gone (expired, revoked or suspended).
  useEffect(() => {
    const onExpired = () => {
      clearApiCache()
      setUser((u) => {
        if (u) setExpired(true)
        return null
      })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const refresh = useCallback(async () => {
    const r = await authService.refreshToken()
    setUser(r.user)
  }, [])

  // Sliding session: rotate the token shortly before expiry if the tab is in use.
  useEffect(() => {
    if (!user) return
    const msLeft = new Date(user.sessionExpiresAt).getTime() - Date.now()
    const t = window.setTimeout(() => {
      if (document.visibilityState === 'visible') refresh().catch(() => undefined)
    }, Math.min(MAX_REFRESH_DELAY_MS, Math.max(60_000, msLeft - REFRESH_MARGIN_MS)))
    return () => window.clearTimeout(t)
  }, [user, refresh])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const r = await authService.login(email, password, remember)
    setExpired(false)
    setUser(r.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined)
    clearApiCache()
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, loading, expired, login, logout, refresh, can: (p) => canRole(user?.role, p) }),
    [user, loading, expired, login, logout, refresh],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
