import * as React from 'react';
import Modal from '../../common/Modal';
import SearchFilter from '../../common/SearchFilter';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import AnnouncementDetailModal from './AnnouncementDetailModal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { AnnouncementsService } from '../../../services/AnnouncementsService';
import { IAnnouncementItem, ANNOUNCEMENT_CATEGORIES, CATEGORY_COLORS } from '../../../models/IAnnouncementItem';

const IconPin: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
);
const IconEyeOff: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconEye: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconTrash: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onRefresh: () => void;
}

const PAGE_SIZE = 5;

const AllAnnouncementsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames } = useWebPartContext();
  const [items, setItems] = React.useState<IAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [selectedItem, setSelectedItem] = React.useState<IAnnouncementItem | null>(null);
  const [page, setPage] = React.useState(1);

  const loadAll = React.useCallback(async () => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    setError(null);
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
    const q = search.toLowerCase();
    const matchSearch = !search || item.Title.toLowerCase().includes(q) || item.Description.toLowerCase().includes(q);
    const matchCat = category === 'All' || item.Category === category;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, category]);

  const handlePin = async (id: number, pinned: boolean): Promise<void> => {
    setItems(prev => prev.map(a => a.Id === id ? { ...a, IsPinned: pinned } : a));
    setSelectedItem(prev => prev?.Id === id ? { ...prev, IsPinned: pinned } : prev);
    if (!sp) return;
    try { await new AnnouncementsService(sp, listNames.announcements).togglePin(id, pinned); onRefresh(); } catch { /* swallow */ }
  };

  const handleHide = async (id: number, hidden: boolean): Promise<void> => {
    setItems(prev => prev.map(a => a.Id === id ? { ...a, IsHidden: hidden } : a));
    setSelectedItem(prev => prev?.Id === id ? { ...prev, IsHidden: hidden } : prev);
    if (!sp) return;
    try { await new AnnouncementsService(sp, listNames.announcements).toggleHide(id, hidden); onRefresh(); } catch { /* swallow */ }
  };

  const handleDelete = async (id: number): Promise<void> => {
    setItems(prev => prev.filter(a => a.Id !== id));
    setSelectedItem(prev => prev?.Id === id ? null : prev);
    if (!sp) return;
    try { await new AnnouncementsService(sp, listNames.announcements).deleteAnnouncement(id); onRefresh(); } catch { /* swallow */ }
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const adminBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer',
    borderRadius: 6, color: '#94a3b8', flexShrink: 0,
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="All Announcements" size="large">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          categories={ANNOUNCEMENT_CATEGORIES}
          selectedCategory={category}
          onCategoryChange={setCategory}
          placeholder="Search announcements..."
        />
        {isLoading ? (
          <LoadingSpinner count={5} type="list" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadAll} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No announcements found" />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pageItems.map(item => {
              const color = CATEGORY_COLORS[item.Category] || '#6b7280';
              return (
                <div
                  key={item.Id}
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedItem(item)}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                    border: '1px solid #e2e8f0', background: item.IsHidden ? '#f8fafc' : '#fff',
                    alignItems: 'center', cursor: 'pointer', opacity: item.IsHidden ? 0.6 : 1, minWidth: 0,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, width: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1, minWidth: 0 }}>
                        {item.Title}
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.Category}
                      </span>
                    </div>
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                      {stripHtml(item.Description)}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {formatDate(item.Created)} · {item.Author?.Title || 'Admin'}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button
                        style={adminBtnStyle}
                        title={item.IsPinned ? 'Unpin' : 'Pin'}
                        onClick={() => handlePin(item.Id, !item.IsPinned)}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#d97706'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                      >
                        <IconPin filled={item.IsPinned} />
                      </button>
                      <button
                        style={adminBtnStyle}
                        title={item.IsHidden ? 'Show' : 'Hide'}
                        onClick={() => handleHide(item.Id, !item.IsHidden)}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                      >
                        {item.IsHidden ? <IconEye /> : <IconEyeOff />}
                      </button>
                      <button
                        style={adminBtnStyle}
                        title="Delete"
                        onClick={() => handleDelete(item.Id)}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: safePage === 1 ? '#f8fafc' : '#fff', cursor: safePage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: safePage === 1 ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1 }}
                aria-label="Previous page"
              >&#8592;</button>
              <span style={{ fontSize: 13, color: '#64748b' }}>{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: safePage === totalPages ? '#f8fafc' : '#fff', cursor: safePage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: safePage === totalPages ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1 }}
                aria-label="Next page"
              >&#8594;</button>
            </div>
          )}
          </>
        )}
      </Modal>

      <AnnouncementDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        isAdmin={isAdmin}
        onPin={handlePin}
        onHide={handleHide}
        onDelete={handleDelete}
      />
    </>
  );
};

export default AllAnnouncementsModal;
