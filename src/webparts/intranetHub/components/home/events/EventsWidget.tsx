import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Events.module.scss';
import { IEventItem, EVENT_CATEGORY_COLORS } from '../../../models/IEventItem';
import { EventsService } from '../../../services/EventsService';
import { useWebPartContext } from '../../../context/WebPartContext';
import { UserRole } from '../../../utils/roleUtils';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import AddEventModal from './AddEventModal';
import AllEventsModal from './AllEventsModal';

const EventsWidget: React.FC = () => {
  const { sp, userRole, listNames } = useWebPartContext();
  const [events, setEvents] = React.useState<IEventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new EventsService(sp, listNames.events);
      const items = await svc.getUpcomingEvents(5);
      setEvents(items);
    } catch (err) {
      setError((err as Error).message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.events]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const formatMonth = (d: string): string => new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const formatDay = (d: string): string => new Date(d).getDate().toString().padStart(2, '0');
  const formatTime = (d: string, e?: string): string => {
    const start = new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (e) {
      const end = new Date(e).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${start} – ${end}`;
    }
    return start;
  };
  const formatFullDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Events</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.showAllBtn} onClick={() => setShowAllModal(true)}>Show All</button>
          {isAdmin && (
            <motion.button className={styles.addBtn} onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              + Add
            </motion.button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? <LoadingSpinner count={3} /> : error ? <ErrorState message={error} onRetry={loadData} /> : events.length === 0 ? (
          <EmptyState title="No upcoming events" description="Check back later for new events." />
        ) : (
          <AnimatePresence>
            {events.map((item, i) => {
              const catColor = EVENT_CATEGORY_COLORS[item.Category || 'Company'] || '#3b82f6';
              return (
                <motion.div key={item.Id} className={styles.eventCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={styles.dateBlock} style={{ background: `${catColor}15`, color: catColor }}>
                    <span className={styles.dateMonth}>{formatMonth(item.EventDate)}</span>
                    <span className={styles.dateDay}>{formatDay(item.EventDate)}</span>
                  </div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventTop}>
                      <h3 className={styles.eventTitle}>{item.Title}</h3>
                      {item.Category && (
                        <span className={styles.eventBadge} style={{ background: `${catColor}15`, color: catColor }}>
                          {item.Category}
                        </span>
                      )}
                    </div>
                    <p className={styles.eventDate}>{formatFullDate(item.EventDate)}</p>
                    <p className={styles.eventTime}>{formatTime(item.EventDate, item.EndDate)}</p>
                    {item.Location && <p className={styles.eventLocation}>📍 {item.Location}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AddEventModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
      <AllEventsModal isOpen={showAllModal} onClose={() => setShowAllModal(false)} isAdmin={isAdmin} onRefresh={loadData} />
    </div>
  );
};

export default EventsWidget;
