import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { KudosService } from '../../../services/KudosService';

interface IProps { isOpen: boolean; onClose: () => void; onAdded: () => void; }

const GiveKudosModal: React.FC<IProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, listNames } = useWebPartContext();
  const [message, setMessage] = React.useState('');
  const [recipientId, setRecipientId] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!sp || !message.trim() || !recipientId) return;
    setIsSubmitting(true);
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      await svc.addKudos({ Title: message, RecipientId: parseInt(recipientId, 10) });
      setMessage(''); setRecipientId('');
      onAdded(); onClose();
    } finally { setIsSubmitting(false); }
  };

  const fieldStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Give Kudos 🎉" size="small">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Recipient User ID *</label>
          <input type="number" value={recipientId} onChange={e => setRecipientId(e.target.value)} style={fieldStyle} placeholder="Enter user ID" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Message *</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} style={{ ...fieldStyle, minHeight: 80 }} placeholder="Write your kudos message..." />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {isSubmitting ? 'Sending...' : 'Give Kudos'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GiveKudosModal;
