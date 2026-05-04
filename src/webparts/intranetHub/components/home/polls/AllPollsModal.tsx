import * as React from 'react';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { PollsService } from '../../../services/PollsService';
import { IPollItem } from '../../../models/IPollItem';

interface IProps { isOpen: boolean; onClose: () => void; isAdmin: boolean; onRefresh: () => void; }

const AllPollsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames } = useWebPartContext();
  const [items, setItems] = React.useState<IPollItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new PollsService(sp, listNames.polls);
    void svc.getAllPolls().then(setItems).finally(() => setIsLoading(false));
  }, [sp, listNames.polls, isOpen]);

  const handleSetLatest = async (id: number): Promise<void> => {
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.setLatest(id);
    const data = await svc.getAllPolls();
    setItems(data);
    onRefresh();
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.deletePoll(id);
    const data = await svc.getAllPolls();
    setItems(data);
    onRefresh();
  };

  const handleToggleVisibility = async (id: number, visible: boolean): Promise<void> => {
    if (!sp) return;
    const svc = new PollsService(sp, listNames.polls);
    await svc.toggleVisibility(id, visible);
    const data = await svc.getAllPolls();
    setItems(data);
    onRefresh();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Polls" size="large">
      {isLoading ? <LoadingSpinner count={4} type="list" /> : items.length === 0 ? <EmptyState title="No polls yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.Id} style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', background: item.IsLatest ? '#eff6ff' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong style={{ fontSize: 14 }}>{item.Title}</strong>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.IsLatest && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#dbeafe', color: '#2563eb' }}>Latest</span>}
                  {!item.IsVisible && <span style={{ fontSize: 11, color: '#ef4444' }}>Hidden</span>}
                </div>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#64748b' }}>Votes: {item.TotalVotes || 0}</p>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!item.IsLatest && <button onClick={() => handleSetLatest(item.Id)} style={{ padding: '4px 10px', border: '1px solid #93c5fd', borderRadius: 6, background: '#eff6ff', fontSize: 11, cursor: 'pointer', color: '#2563eb' }}>Set as Latest</button>}
                  <button onClick={() => handleToggleVisibility(item.Id, !item.IsVisible)} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', fontSize: 11, cursor: 'pointer' }}>{item.IsVisible ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleDelete(item.Id)} style={{ padding: '4px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', fontSize: 11, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AllPollsModal;
