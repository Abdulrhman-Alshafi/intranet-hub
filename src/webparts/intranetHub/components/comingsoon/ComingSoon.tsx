import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './ComingSoon.module.scss';

interface IComingSoonProps {
  tabName: string;
}

const ComingSoon: React.FC<IComingSoonProps> = ({ tabName }) => {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className={styles.iconWrap}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="20" fill="url(#cs-grad)" fillOpacity="0.1"/>
            <path d="M32 20V32L38 38" stroke="url(#cs-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="32" cy="32" r="14" stroke="url(#cs-grad)" strokeWidth="3"/>
            <defs>
              <linearGradient id="cs-grad" x1="12" y1="12" x2="52" y2="52">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Coming Soon
        </motion.h2>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          The <strong>{tabName}</strong> section is under construction.
          <br />
          We&apos;re working to bring you something amazing!
        </motion.p>

        <motion.div
          className={styles.dots}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className={styles.dot}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
