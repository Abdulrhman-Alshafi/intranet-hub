import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './HomePage.module.scss';
import AnnouncementsWidget from './announcements/AnnouncementsWidget';
import RecognitionWall from './kudos/RecognitionWall';
import PollsWidget from './polls/PollsWidget';
import EventsWidget from './events/EventsWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

const HomePage: React.FC = () => {
  return (
    <motion.div
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.topLeft} variants={itemVariants}>
        <AnnouncementsWidget />
      </motion.div>
      <motion.div className={styles.topRight} variants={itemVariants}>
        <RecognitionWall />
      </motion.div>
      <motion.div className={styles.bottomLeft} variants={itemVariants}>
        <PollsWidget />
      </motion.div>
      <motion.div className={styles.bottomRight} variants={itemVariants}>
        <EventsWidget />
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
