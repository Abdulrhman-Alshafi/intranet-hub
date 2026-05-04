import * as React from 'react';
import Modal from '../../common/Modal';
import SearchFilter from '../../common/SearchFilter';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { AnnouncementsService } from '../../../services/AnnouncementsService';
import { IAnnouncementItem, ANNOUNCEMENT_CATEGORIES } from '../../../models/IAnnouncementItem';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onRefresh: () => void;
}

const AllAnnouncementsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames } = useWebPartContext();
  const [items, setItems] = React.useState<IAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');

  const loadAll = React.useCallback(async () => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      const data = await svc.getAllAnnouncements();
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.announcements, isOpen]);

  React.useEffect(() => { void loadAll(); }, [loadAll]);

  const filtered = items.filter(item => {
    const matchSearch = !search || item.Title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.Category === category;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    const svc = new AnnouncementsService(sp, listNames.announcements);
    await svc.deleteAnnouncement(id);
    await loadAll();
    onRefresh();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Announcements" size="large">
      <SearchFilter searchValue={search} onSearchChange={setSearch} categories={ANNOUNCEMENT_CATEGORIES} selectedCategory={category} onCategoryChange={setCategory} placeholder="Search announcements..." />
      {isLoading ? <LoadingSpinner count={5} type="list" /> : error ? <ErrorState message={error} onRetry={loadAll} /> : filtered.length === 0 ? <EmptyState title="No announcements found" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => (
            <div key={item.Id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{item.Title}</strong>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#eff6ff', color: '#2563eb', marginLeft: 8 }}>{item.Category}</span>
              </div>
              {isAdmin && <button onClick={() => handleDelete(item.Id)} style={{ padding: '6px 12px', border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Delete</button>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AllAnnouncementsModal;
