// Admin configuration.

/** Only these emails may sign in to the admin and write content (also enforced by RLS). */
export const ADMIN_EMAILS = [
  'itsmatruprasad@gmail.com',
  'matruprasadpanda497@gmail.com',
]

/** Supabase Storage bucket for uploaded images (must match the bucket you created). */
export const MEDIA_BUCKET = 'Media'

/** Single content row id. */
export const CONTENT_ID = 'site'
export const CONTENT_TABLE = 'site_content'

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
