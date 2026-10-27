import { siBluesky, siDiscord, siFacebook, siGithub, siInstagram, siReddit, siRoblox, siSnapchat, siSpotify, siTelegram, siThreads, siTiktok, siTwitch, siWhatsapp, siX, siYoutube } from 'simple-icons'
import type { CSSProperties } from 'react'

const icons = [
  [/github/, siGithub],
  [/youtu/, siYoutube],
  [/discord/, siDiscord],
  [/instagram/, siInstagram],
  [/threads/, siThreads],
  [/tiktok/, siTiktok],
  [/twitch/, siTwitch],
  [/reddit/, siReddit],
  [/roblox/, siRoblox],
  [/snapchat/, siSnapchat],
  [/spotify/, siSpotify],
  [/facebook/, siFacebook],
  [/bsky|bluesky/, siBluesky],
  [/telegram|t\.me/, siTelegram],
  [/whatsapp|wa\.me/, siWhatsapp],
  [/twitter|x\.com|^x\b/, siX],
] as const

export const shortUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const luminance = (hex: string) => [0, 2, 4].reduce((sum, i, j) => sum + parseInt(hex.slice(i, i + 2), 16) * [0.2126, 0.7152, 0.0722][j], 0) / 255

export const platform = (text: string) => {
  const lower = text.toLowerCase()
  const icon = icons.find(([pattern]) => pattern.test(lower))?.[1]
  return {
    path: icon?.path,
    mail: !icon && /@|mail/.test(lower),
    style: { '--brand': icon && luminance(icon.hex) > 0.12 ? `#${icon.hex}` : 'var(--text)' } as CSSProperties,
  }
}
