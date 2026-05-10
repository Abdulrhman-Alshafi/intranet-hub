import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQWidget.module.scss';
import { useWebPartContext } from '../../context/WebPartContext';
import { ITSupportService } from '../../services/ITSupportService';
import { IHelpDeskFaq } from '../../models/IITSupportModels';
import { UserRole } from '../../utils/roleUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import AddFaqModal from './AddFaqModal';

const FAQWidget: React.FC = () => {
  const { sp, listNames, userRole } = useWebPartContext();
  const [faqs, setFaqs] = React.useState<IHelpDeskFaq[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new ITSupportService(sp, listNames.helpDeskFaqs, listNames.helpDeskTeam);
      const items = await svc.getActiveFaqs();
      setFaqs(items);
    } catch (err) {
      setError((err as Error).message || 'Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const toggleFaq = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Help Desk FAQs</h2>
        {isAdmin && (
          <motion.button className={styles.addBtn} onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            + Add FAQ
          </motion.button>
        )}
      </div>

      <div className={styles.content}>
        {isLoading ? <LoadingSpinner count={3} /> : error ? <ErrorState message={error} onRetry={loadData} /> : faqs.length === 0 ? (
          <EmptyState title="No FAQs available" description="Frequently asked questions will appear here." />
        ) : (
          faqs.map(faq => (
            <div key={faq.Id} className={styles.faqItem}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(faq.Id)}>
                <span>{faq.Question}</span>
                <span>{expandedId === faq.Id ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {expandedId === faq.Id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.faqAnswer} dangerouslySetInnerHTML={{ __html: faq.Answer }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      <AddFaqModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
    </div>
  );
};

export default FAQWidget;
