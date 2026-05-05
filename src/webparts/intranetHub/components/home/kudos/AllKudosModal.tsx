import * as React from 'react';
import Modal from '../../common/Modal';
import SearchFilter from '../../common/SearchFilter';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { KudosService } from '../../../services/KudosService';
import { IKudosItem } from '../../../models/IKudosItem';
import { UserRole } from '../../../utils/roleUtils';
import KudosCard from './KudosCard';

interface IProps { isOpen: boolean; onClose: () => void; onRefresh?: () => void; }

const AllKudosModal: React.FC<IProps> = ({ isOpen, onClose, onRefresh }) => {
  const { sp, wpContext, listNames, currentUserId, userRole } = useWebPartContext();
  const [items, setItems] = React.useState<IKudosItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [onlyMine, setOnlyMine] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 5;

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;
  const siteUrl = wpContext?.pageContext.web.absoluteUrl || '';

  React.useEffect(() => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
    void svc.getKudos(100, currentUserId).then(setItems).finally(() => setIsLoading(false));
  }, [sp, listNames.kudos, listNames.kudosLikes, isOpen, currentUserId]);

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    setItems(prev => prev.filter(k => k.Id !== id));
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      await svc.deleteKudos(id);
      onRefresh?.();
    } catch { /* swallow */ }
  };

  const handleHide = async (id: number, hidden: boolean): Promise<void> => {
    if (!sp) return;
    setItems(prev => prev.map(k => k.Id === id ? { ...k, IsHidden: hidden } : k));
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      await svc.hideKudos(id, hidden);
      onRefresh?.();
    } catch { /* swallow */ }
  };

  const filtered = items.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      const inMessage = item.Title.toLowerCase().includes(q);
      const inGiver = (item.GivenBy?.Title || '').toLowerCase().includes(q);
      const inRecipient = (item.Recipient?.Title || '').toLowerCase().includes(q);
      if (!inMessage && !inGiver && !inRecipient) return false;
    }
    if (onlyMine && item.GivenById !== currentUserId) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filter changes
  React.useEffect(() => { setPage(1); }, [search, onlyMine]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Kudos" size="large">
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search by message, giver or recipient...">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
          Show only kudos I gave
        </label>
      </SearchFilter>
      {isLoading ? <LoadingSpinner count={5} type="list" /> : filtered.length === 0 ? <EmptyState title="No kudos found" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pageItems.map(item => (
              <KudosCard
                key={item.Id}
                item={item}
                isAdmin={isAdmin}
                siteUrl={siteUrl}
                onDelete={handleDelete}
                onHide={handleHide}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0',
                  background: safePage <= 1 ? '#f8fafc' : '#fff', cursor: safePage <= 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: safePage <= 1 ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1,
                }}
                aria-label="Previous page"
              >&#8592;</button>

              <span style={{ fontSize: 13, color: '#64748b' }}>
                {safePage} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0',
                  background: safePage >= totalPages ? '#f8fafc' : '#fff', cursor: safePage >= totalPages ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: safePage >= totalPages ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1,
                }}
                aria-label="Next page"
              >&#8594;</button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default AllKudosModal;
