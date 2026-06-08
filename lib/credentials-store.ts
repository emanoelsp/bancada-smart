"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SeniorCredentials {
  baseUrl: string
  clientId: string
  tenant: string
  authMethod: "userpass" | "appkey"
  username: string
  password: string
  appKey: string
  appSecret: string
}

interface CredentialsStore {
  credentials: SeniorCredentials | null
  setCredentials: (creds: SeniorCredentials) => void
  clearCredentials: () => void
  isConfigured: () => boolean
}

export const useCredentialsStore = create<CredentialsStore>()(
  persist(
    (set, get) => ({
      credentials: null,
      setCredentials: (creds) => set({ credentials: creds }),
      clearCredentials: () => set({ credentials: null }),
      isConfigured: () => {
        const { credentials } = get()
        if (
          !credentials?.baseUrl ||
          !credentials?.clientId ||
          !credentials?.tenant ||
          !credentials?.authMethod
        ) {
          return false
        }
        if (credentials.authMethod === "userpass") {
          return !!(credentials.username && credentials.password)
        }
        if (credentials.authMethod === "appkey") {
          return !!(credentials.appKey && credentials.appSecret)
        }
        return false
      },
    }),
    { name: "senior-credentials" },
  ),
)
