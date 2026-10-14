import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const glyphs = '01<>/\\{}[]#$%&*+=?_'

const scramble = (text: string, revealed: number) =>
  [...text].map((char, i) => (i < revealed || char === ' ' ? char : glyphs[(Math.random() * glyphs.length) | 0])).join('')

type Props = { text: string; charsPerSecond?: number; delay?: number }

export default function Scramble({ text, charsPerSecond = 36, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!inView || reduceMotion) return
    let id = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const revealed = Math.max(0, ((now - start) / 1000) * charsPerSecond)
      setShown(scramble(text, revealed))
      if (revealed < text.length) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [inView, reduceMotion, text, charsPerSecond, delay])

  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduceMotion ? text : shown}</span>
    </span>
  )
}
