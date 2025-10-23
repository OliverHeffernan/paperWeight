/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly VUE_APP_SUPABASE_URL: string
    readonly VUE_APP_SUPABASE_ANON_KEY: string
  }
}