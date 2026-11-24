import type { Transition, Variants } from 'framer-motion';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
};

export const fadeInSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: springTransition 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: 0.12 } 
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};
