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

  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const nonAllCategories = ANNOUNCEMENT_CATEGORIES.filter(c => c !== 'All');
  const visibleCategories = ['All', ...nonAllCategories.slice(0, 4)];
  const overflowCategories = nonAllCategories.slice(4);

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
    setAnnouncements(prev => prev.map(a => a.Id === id ? { ...a, IsPinned: isPinned } : a));
    setSelectedAnnouncement(prev => prev?.Id === id ? { ...prev, IsPinned: isPinned } : prev);
    if (!sp) return;
    try {
      await new AnnouncementsService(sp, listNames.announcements).togglePin(id, isPinned);
    } catch { /* swallow */ }
  };

  const handleHide = async (id: number, hidden: boolean): Promise<void> => {
    setAnnouncements(prev => prev.map(a => a.Id === id ? { ...a, IsHidden: hidden } : a));
    setSelectedAnnouncement(prev => prev?.Id === id ? { ...prev, IsHidden: hidden } : prev);
    if (!sp) return;
    try {
      await new AnnouncementsService(sp, listNames.announcements).toggleHide(id, hidden);
    } catch { /* swallow */ }
  };

  const handleDelete = async (id: number): Promise<void> => {
    setAnnouncements(prev => prev.filter(a => a.Id !== id));
    setSelectedAnnouncement(prev => prev?.Id === id ? null : prev);
    if (!sp) return;
    try {
      await new AnnouncementsService(sp, listNames.announcements).deleteAnnouncement(id);
    } catch { /* swallow */ }
  };

  const displayItems = announcements.slice(0, 2);

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
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center', flexWrap: 'nowrap' }}>
        {visibleCategories.map(cat => (
          <button
            key={cat}
            className={`${styles.filterPill} ${selectedCategory === cat ? styles.activePill : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
        {overflowCategories.length > 0 && (
          <div
            style={{ position: 'relative', flexShrink: 0 }}
            onMouseEnter={() => setShowMoreMenu(true)}
            onMouseLeave={() => setShowMoreMenu(false)}
          >
            <button className={`${styles.filterPill} ${overflowCategories.includes(selectedCategory) ? styles.activePill : ''}`}>···</button>
            {showMoreMenu && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180 }}>
                {overflowCategories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.filterPill} ${selectedCategory === cat ? styles.activePill : ''}`}
                    onClick={() => { setSelectedCategory(cat); setShowMoreMenu(false); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content — 2 equal-height cards */}
      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner count={2} type="card" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : announcements.length === 0 ? (
          <EmptyState title="No announcements yet" description="There are no announcements to display." />
        ) : (
          <AnimatePresence>
            {displayItems.map((item, i) => (
              <motion.div
                key={item.Id}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <AnnouncementCard
                  item={item}
                  onClick={() => setSelectedAnnouncement(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {announcements.length > 0 && (
        <button className={styles.seeAllBtn} onClick={() => setShowAllModal(true)}>
          See all announcements →
        </button>
      )}

      <AddAnnouncementModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
      <AnnouncementDetailModal
        item={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        isAdmin={isAdmin}
        onPin={handlePin}
        onHide={handleHide}
        onDelete={handleDelete}
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

