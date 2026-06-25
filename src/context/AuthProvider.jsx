import { createContext, useContext, useEffect, useState } from 'react'
import * as authDb from '../lib/db/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authDb.getSession().then((s) => {
      if (active) {
        setSession(s)
        setLoading(false)
      }
    })
    const unsub = authDb.onAuthChange((s) => setSession(s))
    return () => {
      active = false
      unsub?.()
    }
  }, [])

  const value = {
    session,
    loading,
    signIn: async (email, password) => {
      const s = await authDb.signIn(email, password)
      setSession(s)
      return s
    },
    signOut: async () => {
      await authDb.signOut()
      setSession(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
