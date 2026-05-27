import type { Variants } from "framer-motion";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const fadeSlideUp: Variants = reducedMotion
  ? { hidden: {}, visible: {} }
  : {
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } },
    };

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const cardVariant: Variants = reducedMotion
  ? { hidden: {}, visible: {} }
  : {
      hidden: { opacity: 0, y: 20, scale: 0.98 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
      },
    };

export const stepVariant: Variants = reducedMotion
  ? { hidden: {}, visible: {}, exit: {} }
  : {
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
      exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
    };
