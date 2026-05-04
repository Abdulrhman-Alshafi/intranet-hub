import * as React from 'react';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { EventsService } from '../../../services/EventsService';
import { IEventItem, EVENT_CATEGORY_COLORS } from '../../../models/IEventItem';

interface IProps { isOpen: boolean; onClose: () => void; isAdmin: boolean; onRefresh: () => void; }

const AllEventsModal: React.FC<IProps> = ({ isOpen, onClose, isAdmin, onRefresh }) => {
  const { sp, listNames } = useWebPartContext();
  const [items, setItems] = React.useState<IEventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new EventsService(sp, listNames.events);
    void svc.getAllEvents().then(setItems).finally(() => setIsLoading(false));
  }, [sp, listNames.events, isOpen]);

  const handleDelete = async (id: number): Promise<void> => {
    if (!sp) return;
    const svc = new EventsService(sp, listNames.events);
    await svc.deleteEvent(id);
    const data = await svc.getAllEvents();
    setItems(data);
    onRefresh();
  };

  const fmt = (d: string): string => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Events" size="large">
      {isLoading ? <LoadingSpinner count={4} type="list" /> : items.length === 0 ? <EmptyState title="No events yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => {
            const color = EVENT_CATEGORY_COLORS[item.Category || 'Company'] || '#3b82f6';
            return (
              <div key={item.Id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', alignItems: 'center' }}>
                <div style={{ width: 8, height: 40, borderRadius: 4, background: color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <strong style={{ fontSize: 14 }}>{item.Title}</strong>
                    {item.Category && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${color}15`, color }}>{item.Category}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{fmt(item.EventDate)}{item.Location ? ` · ${item.Location}` : ''}</span>
                </div>
                {isAdmin && <button onClick={() => handleDelete(item.Id)} style={{ padding: '6px 12px', border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Delete</button>}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default AllEventsModal;
