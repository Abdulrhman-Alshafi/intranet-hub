import * as React from 'react';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { PollsService } from '../../../services/PollsService';
import { IPollItem, IPollOption } from '../../../models/IPollItem';
import PollDetailModal from './PollDetailModal';

interface IProps { isOpen: boolean; onClose: () => void; isAdmin: boolean; onRefresh: () => void; }

const PAGE_SIZE = 5;

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

const adminBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer',
  borderRadius: 6, color: '#94a3b8', flexShrink: 0,
};

const AllPollsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames, currentUserId } = useWebPartContext();
  const [items, setItems] = React.useState<IPollItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [selectedPoll, setSelectedPoll] = React.useState<IPollItem | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new PollsService(sp, listNames.polls);
    const data = await svc.getAllPolls();
    // Pinned first, then newest
    const sorted = [...data].sort((a, b) => {
      if (a.IsLatest && !b.IsLatest) return -1;
      if (!a.IsLatest && b.IsLatest) return 1;
      return new Date(b.Created).getTime() - new Date(a.Created).getTime();
    });
    setItems(sorted);
    setIsLoading(false);
  }, [sp, listNames.polls, isOpen]);

  React.useEffect(() => { void loadItems(); }, [loadItems]);
  React.useEffect(() => { if (!isOpen) setPage(1); }, [isOpen]);

  const handleSetLatest = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation();
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.setLatest(id);
    await loadItems(); onRefresh();
  };

  const handleClearLatest = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation();
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.clearLatest(id);
    await loadItems(); onRefresh();
  };

  const handleDelete = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation();
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.deletePoll(id);
    await loadItems(); onRefresh();
  };

  const handleToggleVisibility = async (e: React.MouseEvent, id: number, visible: boolean): Promise<void> => {
    e.stopPropagation();
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.toggleVisibility(id, visible);
    await loadItems(); onRefresh();
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Polls" size="large">
      {isLoading ? <LoadingSpinner count={4} type="list" /> : items.length === 0 ? <EmptyState title="No polls yet" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pageItems.map(item => {
              const opts: IPollOption[] = (() => { try { return JSON.parse(item.Options || '[]'); } catch { return []; } })();
              const votedUsers: number[] = (() => { try { return JSON.parse(item.VotedUsers || '[]'); } catch { return []; } })();
              const hasVoted = votedUsers.includes(currentUserId);
              return (
                <div
                  key={item.Id}
                  onClick={() => setSelectedPoll(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedPoll(item)}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${item.IsLatest ? '#93c5fd' : '#e2e8f0'}`,
                    background: item.IsLatest ? '#f0f7ff' : '#fff',
                    alignItems: 'center', cursor: 'pointer', minWidth: 0,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, width: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1, minWidth: 0 }}>
                        {item.Title}
                      </div>
                      {item.IsLatest && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#dbeafe', color: '#2563eb', whiteSpace: 'nowrap', flexShrink: 0 }}>Pinned</span>}
                      {!hasVoted && item.IsVisible && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#d97706', whiteSpace: 'nowrap', flexShrink: 0 }}>Not voted</span>}
                      {!item.IsVisible && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#ef4444', whiteSpace: 'nowrap', flexShrink: 0 }}>Hidden</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {opts.length} option{opts.length !== 1 ? 's' : ''} · {item.TotalVotes || 0} vote{(item.TotalVotes || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button
                        style={adminBtnStyle}
                        title={item.IsLatest ? 'Unpin' : 'Pin to top'}
                        onClick={e => void (item.IsLatest ? handleClearLatest(e, item.Id) : handleSetLatest(e, item.Id))}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#d97706'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                      >
                        <IconPin filled={item.IsLatest} />
                      </button>
                      <button
                        style={adminBtnStyle}
                        title={item.IsVisible ? 'Hide' : 'Show'}
                        onClick={e => void handleToggleVisibility(e, item.Id, !item.IsVisible)}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                      >
                        {item.IsVisible ? <IconEyeOff /> : <IconEye />}
                      </button>
                      <button
                        style={adminBtnStyle}
                        title="Delete"
                        onClick={e => void handleDelete(e, item.Id)}
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: safePage === 1 ? 'default' : 'pointer', color: safePage === 1 ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
              >‹</button>
              <span style={{ fontSize: 13, color: '#64748b' }}>{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: safePage === totalPages ? 'default' : 'pointer', color: safePage === totalPages ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
              >›</button>
            </div>
          )}
        </>
      )}

      {selectedPoll && (
        <PollDetailModal
          poll={selectedPoll}
          isOpen={!!selectedPoll}
          onClose={() => setSelectedPoll(null)}
          currentUserId={currentUserId}
          onVoted={async () => { await loadItems(); onRefresh(); }}
        />
      )}
    </Modal>
  );
};

export default AllPollsModal;
