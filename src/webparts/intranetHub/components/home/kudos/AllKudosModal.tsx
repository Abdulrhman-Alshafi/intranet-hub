import * as React from 'react';
import Modal from '../../common/Modal';
import SearchFilter from '../../common/SearchFilter';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import { useWebPartContext } from '../../../context/WebPartContext';
import { KudosService } from '../../../services/KudosService';
import { IKudosItem } from '../../../models/IKudosItem';

interface IProps { isOpen: boolean; onClose: () => void; }

const AllKudosModal: React.FC<IProps> = ({ isOpen, onClose }) => {
  const { sp, listNames, currentUserId } = useWebPartContext();
  const [items, setItems] = React.useState<IKudosItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [onlyMine, setOnlyMine] = React.useState(false);

  React.useEffect(() => {
    if (!sp || !isOpen) return;
    setIsLoading(true);
    const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
    void svc.getKudos(100).then(setItems).finally(() => setIsLoading(false));
  }, [sp, listNames.kudos, listNames.kudosLikes, isOpen]);

  const filtered = items.filter(item => {
    if (search && !item.Title.toLowerCase().includes(search.toLowerCase())) return false;
    if (onlyMine && item.GivenById !== currentUserId) return false;
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Kudos" size="large">
      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search kudos...">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
          Show only kudos I gave
        </label>
      </SearchFilter>
      {isLoading ? <LoadingSpinner count={5} type="list" /> : filtered.length === 0 ? <EmptyState title="No kudos found" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => (
            <div key={item.Id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
              <div style={{ flex: 1 }}>
                <strong>{item.GivenBy?.Title}</strong> → <strong>{item.Recipient?.Title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{item.Title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AllKudosModal;
