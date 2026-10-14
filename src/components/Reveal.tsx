import { motion } from 'motion/react'

const word = { hidden: { y: '110%' }, shown: { y: 0, transition: { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] } } } as const

export default function Reveal({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" initial="hidden" whileInView="shown" viewport={{ once: true }} transition={{ staggerChildren: 0.07, delayChildren: delay }}>
        {text.split(' ').map((part, i) => (
          <span key={i}>
            <span className="word">
              <motion.span variants={word}>{part}</motion.span>
            </span>{' '}
          </span>
        ))}
      </motion.span>
    </>
  )
}
