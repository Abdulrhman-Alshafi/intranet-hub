import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Kudos.module.scss';
import { IKudosItem } from '../../../models/IKudosItem';
import { KudosService } from '../../../services/KudosService';
import { useWebPartContext } from '../../../context/WebPartContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import EmployeeOfMonth from './EmployeeOfMonth';
import KudosCard from './KudosCard';
import GiveKudosModal from './GiveKudosModal';
import AllKudosModal from './AllKudosModal';

const RecognitionWall: React.FC = () => {
  const { sp, listNames } = useWebPartContext();
  const [kudos, setKudos] = React.useState<IKudosItem[]>([]);
  const [eom, setEom] = React.useState<IKudosItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showGiveModal, setShowGiveModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      const [items, employee] = await Promise.all([svc.getKudos(10), svc.getEmployeeOfMonth()]);
      setKudos(items);
      setEom(employee);
    } catch (err) {
      setError((err as Error).message || 'Failed to load kudos');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.kudos, listNames.kudosLikes]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}><span className={styles.number}>2.</span> Recognition Wall</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.seeAllBtn} onClick={() => setShowAllModal(true)}>Kudos</button>
          <motion.button className={styles.giveBtn} onClick={() => setShowGiveModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Give Kudos</motion.button>
        </div>
      </div>
      {isLoading ? <LoadingSpinner count={3} /> : error ? <ErrorState message={error} onRetry={loadData} /> : (
        <div className={styles.body}>
          {eom && <EmployeeOfMonth item={eom} />}
          <div className={styles.kudosFeed}>
            {kudos.length === 0 ? <EmptyState title="No kudos yet" description="Be the first to give kudos!" actionLabel="Give Kudos" onAction={() => setShowGiveModal(true)} /> : (
              <AnimatePresence>
                {kudos.map((item, i) => (
                  <motion.div key={item.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <KudosCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
      <GiveKudosModal isOpen={showGiveModal} onClose={() => setShowGiveModal(false)} onAdded={loadData} />
      <AllKudosModal isOpen={showAllModal} onClose={() => setShowAllModal(false)} />
    </div>
  );
};

export default RecognitionWall;
