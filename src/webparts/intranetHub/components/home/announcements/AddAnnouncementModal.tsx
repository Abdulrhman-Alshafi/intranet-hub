import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { AnnouncementsService } from '../../../services/AnnouncementsService';
import { ANNOUNCEMENT_CATEGORIES } from '../../../models/IAnnouncementItem';

interface IAddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const AddAnnouncementModal: React.FC<IAddAnnouncementModalProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, listNames } = useWebPartContext();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('Company');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!sp || !title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const svc = new AnnouncementsService(sp, listNames.announcements);
      await svc.addAnnouncement({ Title: title, Description: description, Category: category });
      setTitle('');
      setDescription('');
      setCategory('Company');
      onAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#1e293b', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Announcement" size="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} placeholder="Enter announcement title" />
        </div>
        <div>
          <label style={labelStyle}>Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={fieldStyle}>
            {ANNOUNCEMENT_CATEGORIES.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...fieldStyle, minHeight: 120 }} placeholder="Enter announcement details" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer', color: '#334155' }}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Announcement'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddAnnouncementModal;
