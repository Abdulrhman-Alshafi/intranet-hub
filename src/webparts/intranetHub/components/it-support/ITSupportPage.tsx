import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './ITSupportPage.module.scss';
import HelpDeskTeamWidget from './HelpDeskTeamWidget';
import TicketLinksWidget from './TicketLinksWidget';
import FAQWidget from './FAQWidget';

const ITSupportPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.topLeft} variants={itemVariants}>
        <HelpDeskTeamWidget />
      </motion.div>
      
      <motion.div className={styles.topRight} variants={itemVariants}>
        <TicketLinksWidget />
      </motion.div>

      <motion.div className={styles.bottomFull} variants={itemVariants}>
        <FAQWidget />
      </motion.div>
    </motion.div>
  );
};

export default ITSupportPage;
