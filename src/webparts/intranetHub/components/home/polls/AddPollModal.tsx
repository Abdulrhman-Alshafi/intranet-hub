import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { PollsService } from '../../../services/PollsService';
import { IPollOption } from '../../../models/IPollItem';

interface IProps { isOpen: boolean; onClose: () => void; onAdded: () => void; }

const AddPollModal: React.FC<IProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, listNames } = useWebPartContext();
  const [question, setQuestion] = React.useState('');
  const [options, setOptions] = React.useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addOption = (): void => setOptions([...options, '']);
  const updateOption = (i: number, val: string): void => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };
  const removeOption = (i: number): void => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!sp || !question.trim() || options.filter(o => o.trim()).length < 2) return;
    setIsSubmitting(true);
    try {
      const svc = new PollsService(sp, listNames.polls);
      const pollOptions: IPollOption[] = options.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: 0 }));
      await svc.addPoll({ Title: question, Options: pollOptions });
      setQuestion(''); setOptions(['', '']);
      onAdded(); onClose();
    } finally { setIsSubmitting(false); }
  };

  const f: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Poll" size="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Question *</label>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)} style={f} placeholder="What would you like to ask?" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Options *</label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} style={{ ...f, flex: 1 }} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && <button onClick={() => removeOption(i)} style={{ padding: '0 10px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', cursor: 'pointer', color: '#dc2626' }}>×</button>}
            </div>
          ))}
          <button onClick={addOption} style={{ padding: '6px 14px', border: '1px dashed #cbd5e1', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#64748b' }}>+ Add option</button>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPollModal;
