import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useVisitorTracker() {
  useEffect(() => {
    // 1. Don't track if Supabase is not configured
    if (!supabase) return

    // 2. Don't track if browsing admin
    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/admin')) return

    // 3. Deduplicate visit tracking for 30 minutes in the same session
    const SESSION_KEY = 'matru_visitor_session'
    const lastTracked = sessionStorage.getItem(SESSION_KEY)
    if (lastTracked) return

    sessionStorage.setItem(SESSION_KEY, String(Date.now()))

    // 4. Detect device & browser
    const ua = navigator.userAgent
    let browser = 'Browser'
    if (ua.includes('Edg/')) browser = 'Edge'
    else if (ua.includes('Chrome/')) browser = 'Chrome'
    else if (ua.includes('Firefox/')) browser = 'Firefox'
    else if (ua.includes('Safari/')) browser = 'Safari'

    let device = 'Desktop'
    if (/Mobi|Android/i.test(ua)) device = 'Mobile'
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet'

    // 5. Fetch approximate location from ipwho.is (fast, free, no API key needed)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)

    fetch('https://ipwho.is/', { signal: controller.signal })
      .then((res) => res.json())
      .then(async (data) => {
        clearTimeout(timer)
        const isSuccess = data && data.success !== false
        const payload = {
          ip: data?.ip || 'Direct',
          city: (isSuccess && data?.city) || 'Local / Direct',
          region: (isSuccess && data?.region) || '',
          country: (isSuccess && data?.country) || 'Local',
          country_code: (isSuccess && data?.country_code) || '',
          flag: (isSuccess && data?.flag?.img) || '',
          isp: (isSuccess && (data?.connection?.isp || data?.connection?.org)) || 'Direct Connection',
          page: window.location.pathname || '/',
          user_agent: ua,
          device,
          browser,
        }

        if (!supabase) return
        const { error } = await supabase.from('visitor_logs').insert(payload)
        if (!error) {
          sessionStorage.setItem(SESSION_KEY, String(Date.now()))
        }
      })
      .catch(async () => {
        // Fallback: log device & page even if geolocation provider was blocked
        try {
          if (!supabase) return
          const { error } = await supabase.from('visitor_logs').insert({
            ip: 'Direct',
            city: 'Unknown',
            region: '',
            country: 'Unknown',
            country_code: '',
            flag: '',
            isp: 'Direct',
            page: window.location.pathname || '/',
            user_agent: ua,
            device,
            browser,
          })
          if (!error) {
            sessionStorage.setItem(SESSION_KEY, String(Date.now()))
          }
        } catch {
          // ignore
        }
      })

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])
}
