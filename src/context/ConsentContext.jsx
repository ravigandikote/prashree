import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Cookie consent, remembered per browser. Analytics only loads once the
 * visitor accepts; nothing else on the site sets a cookie, so declining costs
 * them nothing. `null` means "not asked yet" — that is what shows the banner.
 */

const STORAGE_KEY = 'prashree-cookie-consent'

const ConsentContext = createContext({ consent: null, accept: () => { }, decline: () => { } })

function read() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null // private mode / storage blocked → ask again next visit
  }
}

function write(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch { /* nothing we can do; the choice just won't persist */ }
}

export function ConsentProvider({ children }) {
  // read() is safe at first render — this app is client-only, no SSR
  const [consent, setConsent] = useState(read)

  const accept = useCallback(() => { write('granted'); setConsent('granted') }, [])
  const decline = useCallback(() => { write('denied'); setConsent('denied') }, [])

  const value = useMemo(() => ({ consent, accept, decline }), [consent, accept, decline])

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  return useContext(ConsentContext)
}
