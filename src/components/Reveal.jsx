import { motion } from 'framer-motion'
import { transition, fadeUp } from '../motion'
import { usePrefersReducedMotion } from '../shared'

export default function Reveal({ children, className, delay = 0 }) {
  const reduced = usePrefersReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  )
}
