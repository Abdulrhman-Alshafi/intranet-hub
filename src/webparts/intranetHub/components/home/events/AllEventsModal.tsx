import * as React from 'react';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { EventsService } from '../../../services/EventsService';
import { IEventItem, EVENT_CATEGORY_COLORS } from '../../../models/IEventItem';
import EventDetailModal from './EventDetailModal';

const IconTrash: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

interface IProps { isOpen: boolean; onClose: () => void; isAdmin: boolean; onRefresh: () => void; }

const PAGE_SIZE = 5;

const AllEventsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames } = useWebPartContext();
  const [items, setItems] = React.useState<IEventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<IEventItem | null>(null);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new EventsService(sp, listNames.events);
    void svc.getAllEvents().then(setItems).finally(() => setIsLoading(false));
  }, [sp, listNames.events, isOpen]);

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    await new EventsService(sp, listNames.events).deleteEvent(id);
    setItems(prev => prev.filter(e => e.Id !== id));
    onRefresh();
  };

  const fmt = (d: string): string => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const adminBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer',
    borderRadius: 6, color: '#94a3b8', flexShrink: 0,
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="All Events" size="large">
        {isLoading ? <LoadingSpinner count={4} type="list" /> : items.length === 0 ? <EmptyState title="No events yet" /> : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pageItems.map(item => {
                const color = EVENT_CATEGORY_COLORS[item.Category || 'Company'] || '#3b82f6';
                return (
                  <div
                    key={item.Id}
                    onClick={() => setSelectedItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelectedItem(item)}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                      border: '1px solid #e2e8f0', background: '#fff',
                      alignItems: 'center', cursor: 'pointer', minWidth: 0,
                    }}
                  >
                    <div style={{ width: 8, height: 40, borderRadius: 4, background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, width: 0 }}>
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>
                        {item.Title}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>{fmt(item.EventDate)}</span>
                        {item.Category && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${color}15`, color, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.Category}</span>}
                        {item.Location && <span style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>· {item.Location}</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          style={adminBtnStyle}
                          title="Delete"
                          onClick={() => void handleDelete(item.Id)}
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
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: safePage === 1 ? '#f8fafc' : '#fff', cursor: safePage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: safePage === 1 ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1 }}
                  aria-label="Previous page"
                >‹</button>
                <span style={{ fontSize: 13, color: '#64748b' }}>{safePage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: safePage === totalPages ? '#f8fafc' : '#fff', cursor: safePage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: safePage === totalPages ? '#cbd5e1' : '#475569', fontSize: 16, lineHeight: 1 }}
                  aria-label="Next page"
                >›</button>
              </div>
            )}
          </>
        )}
      </Modal>
      {selectedItem && (
        <EventDetailModal event={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
};

export default AllEventsModal;
