import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Kudos.module.scss';
import { IKudosItem } from '../../../models/IKudosItem';
import { IEmployeeOfMonthItem } from '../../../models/IEmployeeOfMonthItem';
import { KudosService } from '../../../services/KudosService';
import { EmployeeOfMonthService } from '../../../services/EmployeeOfMonthService';
import { useWebPartContext } from '../../../context/WebPartContext';
import { UserRole } from '../../../utils/roleUtils';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import EmployeeOfMonth from './EmployeeOfMonth';
import KudosCard from './KudosCard';
import GiveKudosModal from './GiveKudosModal';
import AllKudosModal from './AllKudosModal';
import SetEOMModal from './SetEOMModal';

const RecognitionWall: React.FC = () => {
  const { sp, wpContext, userRole, listNames, currentUserId } = useWebPartContext();
  const [kudos, setKudos] = React.useState<IKudosItem[]>([]);
  const [eom, setEom] = React.useState<IEmployeeOfMonthItem | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showGiveModal, setShowGiveModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);
  const [showEOMModal, setShowEOMModal] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;
  const siteUrl = wpContext?.pageContext.web.absoluteUrl || '';

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const kudosSvc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      const eomSvc = new EmployeeOfMonthService(sp, listNames.employeeOfMonth);
      const [items, currentEOM] = await Promise.all([kudosSvc.getKudos(3, currentUserId), eomSvc.getCurrentEOM()]);
      setKudos(items);
      setEom(currentEOM);
    } catch (err) {
      setError((err as Error).message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.kudos, listNames.kudosLikes, listNames.employeeOfMonth, currentUserId]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    setKudos(prev => prev.filter(k => k.Id !== id));
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      await svc.deleteKudos(id);
    } catch { /* swallow */ }
  };

  const handleHide = async (id: number, hidden: boolean): Promise<void> => {
    if (!sp) return;
    setKudos(prev => prev.map(k => k.Id === id ? { ...k, IsHidden: hidden } : k));
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      await svc.hideKudos(id, hidden);
    } catch { /* swallow */ }
  };

  const handleEOMDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    setEom(undefined);
    try {
      const svc = new EmployeeOfMonthService(sp, listNames.employeeOfMonth);
      await svc.deleteEOM(id);
    } catch { /* swallow */ }
  };

  const handleEOMHide = async (id: number, hidden: boolean): Promise<void> => {
    if (!sp) return;
    setEom(prev => prev ? { ...prev, IsHidden: hidden } : prev);
    try {
      const svc = new EmployeeOfMonthService(sp, listNames.employeeOfMonth);
      await svc.hideEOM(id, hidden);
    } catch { /* swallow */ }
  };

  const visibleKudos = isAdmin ? kudos : kudos.filter(k => !k.IsHidden);
  const displayedKudos = visibleKudos.slice(0, eom ? 2 : 3);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recognition Wall</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <button className={styles.eomBtn} onClick={() => setShowEOMModal(true)}>
              Employee of Month
            </button>
          )}
          <motion.button className={styles.giveBtn} onClick={() => setShowGiveModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Give Kudos
          </motion.button>
        </div>
      </div>
      {isLoading ? <LoadingSpinner count={3} /> : error ? <ErrorState message={error} onRetry={loadData} /> : (
        <>
          <div className={styles.body}>
            {eom && (
              <div className={styles.cardSlot}>
              <EmployeeOfMonth item={eom} siteUrl={siteUrl} isAdmin={isAdmin} onDelete={handleEOMDelete} onHide={handleEOMHide} />
              </div>
            )}
            {displayedKudos.length === 0 && !eom ? (
              <EmptyState title="No kudos yet" description="Be the first to give kudos!" />
            ) : (
              <AnimatePresence>
                {displayedKudos.map((item, i) => (
                  <motion.div
                    key={item.Id}
                    className={styles.cardSlot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <KudosCard
                      item={item}
                      isAdmin={isAdmin}
                      siteUrl={siteUrl}
                      onDelete={handleDelete}
                      onHide={handleHide}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          <button className={styles.seeAllBtn} onClick={() => setShowAllModal(true)}>
            See all kudos →
          </button>
        </>
      )}
      <GiveKudosModal isOpen={showGiveModal} onClose={() => setShowGiveModal(false)} onAdded={loadData} />
      <AllKudosModal isOpen={showAllModal} onClose={() => setShowAllModal(false)} onRefresh={loadData} />
      <SetEOMModal isOpen={showEOMModal} onClose={() => setShowEOMModal(false)} onSet={loadData} />
    </div>
  );
};

export default RecognitionWall;
