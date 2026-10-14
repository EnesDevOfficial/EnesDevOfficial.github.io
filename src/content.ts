import { useSyncExternalStore } from 'react'
import published from './content.json'

export type Link = { label: string; href: string }

export type Project = {
  title: string
  description: string
  url: string
  links: Link[]
  image: string
  featured: boolean
}

export type Content = {
  site: { name: string; description: string }
  profile: { name: string; handle: string; headline: string; tagline: string; story: string; avatar: string; favicon: string }
  pages: typeof published.pages
  socials: Link[]
  contacts: { label: string; value: string; href: string }[]
  projects: Project[]
  about: string[]
  timeline: { year: string; title: string; text: string }[]
  skills: { area: string; items: string[] }[]
}

export const publishedContent = published as Content

let content = publishedContent
const listeners = new Set<() => void>()

export const setContent = (next: Content | ((current: Content) => Content)) => {
  content = typeof next === 'function' ? next(content) : next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useContent = () => useSyncExternalStore(subscribe, () => content)

export const previews = new Map<string, string>()

export const assetUrl = (src: string) => previews.get(src) ?? (/^(https?:|blob:|data:)/.test(src) ? src : import.meta.env.BASE_URL + src.replace(/^\//, ''))
