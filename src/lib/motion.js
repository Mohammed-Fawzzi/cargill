export const easeOut = [0.22, 1, 0.36, 1];

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: easeOut },
};

export const fadeUp = (delay = 0, y = 16) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.35, ease: easeOut, delay },
});

export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.05 },
  },
  viewport: { once: true, amount: 0.12 },
};

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut },
};
