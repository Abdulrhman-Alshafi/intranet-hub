import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Announcements.module.scss';
import { IAnnouncementItem, ANNOUNCEMENT_CATEGORIES } from '../../../models/IAnnouncementItem';
import { AnnouncementsService } from '../../../services/AnnouncementsService';
import { useWebPartContext } from '../../../context/WebPartContext';
import { UserRole } from '../../../utils/roleUtils';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import AnnouncementCard from './AnnouncementCard';
import AddAnnouncementModal from './AddAnnouncementModal';
import AnnouncementDetailModal from './AnnouncementDetailModal';
import AllAnnouncementsModal from './AllAnnouncementsModal';

const AnnouncementsWidget: React.FC = () => {
  const { sp, userRole, listNames } = useWebPartContext();
  const [announcements, setAnnouncements] = React.useState<IAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<IAnnouncementItem | null>(null);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      const items = await svc.getAnnouncements(selectedCategory);
      setAnnouncements(items);
    } catch (err) {
      setError((err as Error).message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.announcements, selectedCategory]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const handlePin = async (id: number, isPinned: boolean): Promise<void> => {
    if (!sp) return;
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      await svc.togglePin(id, isPinned);
      await loadData();
    } catch { /* swallow */ }
  };

  const handleHide = async (id: number): Promise<void> => {
    if (!sp) return;
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      await svc.toggleHide(id, true);
      await loadData();
    } catch { /* swallow */ }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      await svc.deleteAnnouncement(id);
      await loadData();
    } catch { /* swallow */ }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Announcements</h2>
        {isAdmin && (
          <motion.button
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Add Announcement
          </motion.button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className={styles.filters}>
        {ANNOUNCEMENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.filterPill} ${selectedCategory === cat ? styles.activePill : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner count={3} type="card" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            description="There are no announcements to display."
          />
        ) : (
          <AnimatePresence>
            {announcements.slice(0, 5).map((item, i) => (
              <motion.div
                key={item.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <AnnouncementCard
                  item={item}
                  isAdmin={isAdmin}
                  onClick={() => setSelectedAnnouncement(item)}
                  onPin={handlePin}
                  onHide={handleHide}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* See all link */}
      {announcements.length > 0 && (
        <button className={styles.seeAllBtn} onClick={() => setShowAllModal(true)}>
          See all announcements →
        </button>
      )}

      {/* Modals */}
      <AddAnnouncementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={loadData}
      />
      <AnnouncementDetailModal
        item={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
      <AllAnnouncementsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        isAdmin={isAdmin}
        onRefresh={loadData}
      />
    </div>
  );
};

export default AnnouncementsWidget;
