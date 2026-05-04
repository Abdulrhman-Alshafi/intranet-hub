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

const PollsWidget: React.FC = () => {
  const { sp, userRole, listNames, currentUserId } = useWebPartContext();
  const [poll, setPoll] = React.useState<IPollItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [unanswered, setUnanswered] = React.useState(0);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showAllModal, setShowAllModal] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new PollsService(sp, listNames.polls);
      const [latest, count] = await Promise.all([
        svc.getLatestPoll(),
        svc.getUnansweredCount(currentUserId),
      ]);
      setPoll(latest);
      setUnanswered(count);
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

  const handleVote = async (index: number): Promise<void> => {
    if (!sp || !poll || hasVoted) return;
    try {
      const svc = new PollsService(sp, listNames.polls);
      await svc.vote(poll.Id, index, currentUserId);
      setHasVoted(true);
      await loadData();
    } catch { /* swallow */ }
  };

  const options: IPollOption[] = poll ? (() => { try { return JSON.parse(poll.Options); } catch { return []; } })() : [];
  const totalVotes = poll?.TotalVotes || options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.number}>3.</span> Polls
          {unanswered > 0 && <Badge count={unanswered} />}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.showAllBtn} onClick={() => setShowAllModal(true)}>Show all</button>
          {isAdmin && (
            <motion.button className={styles.addBtn} onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              + Add Poll
            </motion.button>
          )}
        </div>
      </div>

      {isLoading ? <LoadingSpinner count={2} /> : error ? <ErrorState message={error} onRetry={loadData} /> : !poll ? (
        <EmptyState title="No active polls" description="There are no polls to display right now." />
      ) : (
        <div className={styles.pollContent}>
          <h3 className={styles.pollQuestion}>{poll.Title}</h3>
          <div className={styles.options}>
            {options.map((opt, i) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={i}
                  className={`${styles.option} ${hasVoted ? styles.voted : ''}`}
                  onClick={() => handleVote(i)}
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
          <p className={styles.totalVotes}>Total votes: {totalVotes}</p>
        </div>
      )}

      <AddPollModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
      <AllPollsModal isOpen={showAllModal} onClose={() => setShowAllModal(false)} isAdmin={isAdmin} onRefresh={loadData} />
    </div>
  );
};

export default PollsWidget;
