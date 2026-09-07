import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useConsent } from '../context/ConsentContext'
import { analyticsConfigured, loadAnalytics, trackPageView } from '../lib/analytics'

/**
 * Loads GA once consent is granted and reports every client-side navigation.
 * Renders nothing. Admin routes are left out — those are Monica's own visits.
 */
export default function Analytics() {
  const { consent } = useConsent()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (consent === 'granted') loadAnalytics()
  }, [consent])

  useEffect(() => {
    if (consent !== 'granted' || !analyticsConfigured) return
    if (pathname.startsWith('/admin')) return
    // let the page set its title (react-helmet runs after render) first
    const id = setTimeout(() => trackPageView(pathname + search), 250)
    return () => clearTimeout(id)
  }, [consent, pathname, search])

  return null
}
