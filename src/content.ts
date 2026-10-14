import { useSyncExternalStore } from 'react'
import published from './content.json'

export const titles = { '': 'Home', projects: 'Projects', about: 'About', socials: 'Socials' }

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
  profile: { name: string; handle: string; tagline: string; story: string; avatar: string; favicon: string }
  socials: Link[]
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
