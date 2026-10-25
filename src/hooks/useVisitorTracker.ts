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
    const timer = setTimeout(() => controller.abort(), 3500)

    fetch('https://ipwho.is/', { signal: controller.signal })
      .then((res) => res.json())
      .then(async (data) => {
        clearTimeout(timer)
        if (data && data.success) {
          await supabase?.from('visitor_logs').insert({
            ip: data.ip || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || '',
            country: data.country || 'Unknown',
            country_code: data.country_code || '',
            flag: data.flag?.img || '',
            isp: data.connection?.isp || data.connection?.org || '',
            page: window.location.pathname || '/',
            user_agent: ua,
            device,
            browser,
          })
        }
      })
      .catch(() => {
        // Silently ignore if blocked by client privacy extensions or offline
      })

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])
}
