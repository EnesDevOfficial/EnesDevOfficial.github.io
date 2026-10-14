import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { markBooted, shouldBoot } from '../boot'
import { useContent } from '../content'

export default function Boot() {
  const { profile, projects, skills } = useContent()
  const [visible, setVisible] = useState(shouldBoot)
  const lines = [
    `> ssh ${profile.name.toLowerCase()}@dev`,
    `> loaded ${projects.length} projects`,
    `> loaded ${new Set(skills.flatMap((group) => group.items)).size} tools`,
    '> ready',
  ]

  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => {
      setVisible(false)
      markBooted()
    }, 1500)
    return () => clearTimeout(timeout)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="boot" aria-hidden="true" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}>
          {lines.map((line, i) => (
            <motion.p key={line} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.28, duration: 0.2 }}>
              {line}
            </motion.p>
          ))}
          <motion.div className="boot-bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.3, ease: 'linear' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
