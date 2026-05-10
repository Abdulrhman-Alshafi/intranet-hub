import * as React from 'react';
import Modal from '../common/Modal';
import { useWebPartContext } from '../../context/WebPartContext';
import { ITSupportService } from '../../services/ITSupportService';
import styles from './FAQWidget.module.scss';

interface IProps { isOpen: boolean; onClose: () => void; onAdded: () => void; }

const AddFaqModal: React.FC<IProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, listNames } = useWebPartContext();
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!question.trim()) { setError('Question is required.'); return; }
    if (!answer.trim()) { setError('Answer is required.'); return; }
    if (!sp) { setError('SharePoint connection not ready.'); return; }

    setError('');
    setIsSubmitting(true);
    try {
      const svc = new ITSupportService(sp, listNames.helpDeskFaqs, listNames.helpDeskTeam);
      await svc.addFaq({
        Title: 'FAQ',
        Question: question.trim(),
        Answer: answer.trim(),
        Order: 0,
        IsActive: true
      });
      setQuestion(''); setAnswer('');
      onAdded();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to add FAQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add FAQ" size="medium">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>⚠ {error}</p>}
        
        <div>
          <label className={styles.label}>Question *</label>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className={styles.input} placeholder="e.g., How do I reset my password?" />
        </div>


        
        <div>
          <label className={styles.label}>Answer *</label>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} className={`${styles.input} ${styles.textarea}`} placeholder="Provide the answer..." />
        </div>
        
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? 'Adding...' : 'Add FAQ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFaqModal;
