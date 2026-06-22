import { Github, Mail, Linkedin, Link as LinkIcon, type LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = { Github, Mail, Linkedin }

export function socialIcon(name: string): LucideIcon {
  return map[name] ?? LinkIcon
}
