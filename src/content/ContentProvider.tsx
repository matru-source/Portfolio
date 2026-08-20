import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { CONTENT_ID, CONTENT_TABLE } from '@/admin/config'
import { defaultContent } from './defaults'
import type { SiteContent } from './types'

function isPlaceholder(url?: string | null): boolean {
  if (!url) return true
  return (
    url.startsWith('/certificates/') ||
    url.startsWith('/gallery/') ||
    url === '/profile.jpg' ||
    url.trim() === ''
  )
}

function mergeItems<T extends { key?: string; image?: string; images?: string[] }>(
  baseList: T[],
  overrideList?: T[],
): T[] {
  if (!overrideList) return baseList
  return overrideList.map((item) => {
    const baseMatch = baseList.find((b) => b.key === item.key)
    if (!baseMatch) return item
    const next = { ...item }
    if (isPlaceholder(item.image) && baseMatch.image && !isPlaceholder(baseMatch.image)) {
      next.image = baseMatch.image
    }
    if ((!item.images || item.images.length === 0) && baseMatch.images && baseMatch.images.length > 0) {
      next.images = baseMatch.images
    }
    return next
  })
}

function merge(base: SiteContent, override: Partial<SiteContent> | null | undefined): SiteContent {
  if (!override) return base
  return {
    profile: {
      ...base.profile,
      ...(override.profile ?? {}),
      photo: isPlaceholder(override.profile?.photo)
        ? base.profile.photo
        : override.profile?.photo || base.profile.photo,
      photos:
        override.profile?.photos && override.profile.photos.length > 0
          ? override.profile.photos
          : base.profile.photos,
    },
    site: { ...base.site, ...(override.site ?? {}) },
    projects: mergeItems(base.projects, override.projects),
    skills: override.skills ?? base.skills,
    experience: override.experience ?? base.experience,
    certifications: mergeItems(base.certifications, override.certifications),
    achievements: override.achievements ?? base.achievements,
    achievementsGallery: mergeItems(base.achievementsGallery, override.achievementsGallery),
    events: mergeItems(base.events, override.events),
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
