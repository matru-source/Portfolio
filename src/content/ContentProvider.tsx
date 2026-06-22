import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { CONTENT_ID, CONTENT_TABLE } from '@/admin/config'
import { defaultContent } from './defaults'
import type { SiteContent } from './types'

function merge(base: SiteContent, override: Partial<SiteContent> | null | undefined): SiteContent {
  if (!override) return base
  return {
    profile: { ...base.profile, ...(override.profile ?? {}) },
    site: { ...base.site, ...(override.site ?? {}) },
    projects: override.projects ?? base.projects,
    skills: override.skills ?? base.skills,
    experience: override.experience ?? base.experience,
    certifications: override.certifications ?? base.certifications,
    achievements: override.achievements ?? base.achievements,
    achievementsGallery: override.achievementsGallery ?? base.achievementsGallery,
    events: override.events ?? base.events,
    leadership: override.leadership ?? base.leadership,
    research: override.research ?? base.research,
    timeline: override.timeline ?? base.timeline,
  }
}

interface ContentContextValue {
  content: SiteContent
  loading: boolean
  reload: () => Promise<void>
  save: (next: SiteContent) => Promise<{ error: string | null }>
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!supabase) {
      setContent(defaultContent)
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from(CONTENT_TABLE)
        .select('data')
        .eq('id', CONTENT_ID)
        .maybeSingle()
      if (!error && data && data.data) {
        setContent(merge(defaultContent, data.data as Partial<SiteContent>))
      } else {
        setContent(defaultContent)
      }
    } catch {
      setContent(defaultContent)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (next: SiteContent) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const { error } = await supabase
      .from(CONTENT_TABLE)
      .upsert({ id: CONTENT_ID, data: next, updated_at: new Date().toISOString() })
    if (!error) setContent(next)
    return { error: error ? error.message : null }
  }, [])

  const value = useMemo<ContentContextValue>(
    () => ({ content, loading, reload, save }),
    [content, loading, reload, save],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

function useContentContext(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within <ContentProvider>')
  return ctx
}

/** Public pages: read the live (or fallback) content. */
export function useContent(): SiteContent {
  return useContentContext().content
}

/** Admin: full control surface (content + save + reload). */
export function useContentAdmin(): ContentContextValue {
  return useContentContext()
}
