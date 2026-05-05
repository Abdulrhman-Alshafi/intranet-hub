import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './Polls.module.scss';
import { IPollItem, IPollOption } from '../../../models/IPollItem';
import { PollsService } from '../../../services/PollsService';
import { useWebPartContext } from '../../../context/WebPartContext';
import { UserRole } from '../../../utils/roleUtils';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import Badge from '../../common/Badge';
import AddPollModal from './AddPollModal';
import AllPollsModal from './AllPollsModal';
import PollDetailModal from './PollDetailModal';

const PollsWidget: React.FC = () => {
  const { sp, userRole, listNames, currentUserId } = useWebPartContext();
  const [poll, setPoll] = React.useState<IPollItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [unanswered, setUnanswered] = React.useState(0);
  const [totalVisible, setTotalVisible] = React.useState(0);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new PollsService(sp, listNames.polls);
      const [latest, count, visCount] = await Promise.all([
        svc.getLatestPoll(),
        svc.getUnansweredCount(currentUserId),
        svc.getVisibleCount(),
      ]);
      setPoll(latest);
      setUnanswered(count);
      setTotalVisible(visCount);
      if (latest) {
        const votedUsers: number[] = latest.VotedUsers ? JSON.parse(latest.VotedUsers) : [];
        setHasVoted(votedUsers.includes(currentUserId));
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames.polls, currentUserId]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const options: IPollOption[] = poll ? (() => { try { return JSON.parse(poll.Options); } catch { return []; } })() : [];
  const totalVotes = poll?.TotalVotes || options.reduce((s, o) => s + o.votes, 0);
  const visibleOptions = options.slice(0, 3);
  const hasMoreOptions = options.length > 3;

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Polls
          {unanswered > 0 && <Badge count={unanswered} />}
        </h2>
        {isAdmin && (
          <motion.button className={styles.addBtn} onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            + Add Poll
          </motion.button>
        )}
      </div>

      {isLoading ? <LoadingSpinner count={2} /> : error ? <ErrorState message={error} onRetry={loadData} /> : !poll ? (
        <EmptyState title="No active polls" description="There are no polls to display right now." />
      ) : (
        <div className={styles.pollContent}>
          <h3 className={styles.pollQuestion}>
            {poll.Title}
            {!hasVoted && <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#d97706', fontWeight: 600, verticalAlign: 'middle' }}>Not voted</span>}
          </h3>
          <div className={styles.options}>
            {visibleOptions.map((opt, i) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={i}
                  className={`${styles.option} ${hasVoted ? styles.voted : ''}`}
                  onClick={() => void (async () => {
                    if (!sp || !poll || hasVoted) return;
                    try {
                      await new PollsService(sp, listNames.polls).vote(poll.Id, i, currentUserId);
                      setHasVoted(true);
                      await loadData();
                    } catch { /* swallow */ }
                  })()}
                  disabled={hasVoted}
                >
                  <div className={styles.optionInfo}>
                    <span className={styles.optionText}>{opt.text}</span>
                    <span className={styles.optionPct}>{pct}%</span>
                  </div>
                  <div className={styles.optionBarBg}>
                    <motion.div
                      className={styles.optionBar}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          {hasMoreOptions && (
            <button className={styles.showAllOptionsBtn} onClick={() => setShowDetailModal(true)}>
              Show all options ({options.length} total)
            </button>
          )}
        </div>
      )}

      {totalVisible > 1 && (
        <button className={styles.seeAllBtn} onClick={() => setShowAllModal(true)}>See all polls →</button>
      )}

      {poll && (
        <PollDetailModal
          poll={poll}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          currentUserId={currentUserId}
          onVoted={async () => { await loadData(); }}
        />
      )}

      <AddPollModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
      <AllPollsModal isOpen={showAllModal} onClose={() => setShowAllModal(false)} isAdmin={isAdmin} onRefresh={loadData} />
    </div>
  );
};

export default PollsWidget;
