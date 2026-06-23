import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const { asPath } = useRouter();
  return (
    <AnimatePresence mode="wait" exitBeforeEnter>
      <motion.div
        key={asPath}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
