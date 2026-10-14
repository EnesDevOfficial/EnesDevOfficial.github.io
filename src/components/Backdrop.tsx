import { motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import type { Field } from './FieldScene'

const FieldScene = lazy(() => import('./FieldScene'))

export default function Backdrop({ field, fixed }: { field: Field; fixed?: boolean }) {
  const backdrop = (
    <motion.div className={`backdrop ${field}`} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
      <Suspense fallback={null}>
        <FieldScene field={field} />
      </Suspense>
    </motion.div>
  )
  return fixed ? createPortal(backdrop, document.body) : backdrop
}
