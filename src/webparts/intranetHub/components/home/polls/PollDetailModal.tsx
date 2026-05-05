import * as React from 'react';
import { motion } from 'framer-motion';
import Modal from '../../common/Modal';
import { IPollItem, IPollOption } from '../../../models/IPollItem';
import { PollsService } from '../../../services/PollsService';
import { useWebPartContext } from '../../../context/WebPartContext';
import styles from './Polls.module.scss';

interface IProps {
  poll: IPollItem;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  onVoted?: () => Promise<void>;
}

const PollDetailModal: React.FC<IProps> = ({ poll: initialPoll, isOpen, onClose, currentUserId, onVoted }) => {
  const { sp, listNames } = useWebPartContext();
  const [poll, setPoll] = React.useState<IPollItem>(initialPoll);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [votedIndex, setVotedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setPoll(initialPoll);
    const votedUsers: number[] = (() => { try { return JSON.parse(initialPoll.VotedUsers || '[]'); } catch { return []; } })();
    const alreadyVoted = votedUsers.includes(currentUserId);
    setHasVoted(alreadyVoted);
    // Only reset votedIndex when user hasn't voted — preserves voted option at top after data refreshes
    if (!alreadyVoted) setVotedIndex(null);
  }, [initialPoll, currentUserId]);

  const options: IPollOption[] = (() => { try { return JSON.parse(poll.Options || '[]'); } catch { return []; } })();
  const totalVotes = poll.TotalVotes || options.reduce((s, o) => s + o.votes, 0);

  // After voting, show voted option first
  const sortedOptions = hasVoted && votedIndex !== null
    ? [options[votedIndex], ...options.filter((_, i) => i !== votedIndex)]
    : options;

  const handleVote = async (index: number): Promise<void> => {
    if (!sp || hasVoted) return;
    try {
      const svc = new PollsService(sp, listNames.polls);
      await svc.vote(poll.Id, index, currentUserId);
      setVotedIndex(index);
      setHasVoted(true);
      if (onVoted) await onVoted();
    } catch { /* swallow */ }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={poll.Title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedOptions.map((opt) => {
          const originalIndex = options.findIndex(o => o.text === opt.text);
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isVotedOption = hasVoted && votedIndex === originalIndex;
          return (
            <button
              key={opt.text}
              className={`${styles.option} ${hasVoted ? styles.voted : ''}`}
              onClick={() => void handleVote(originalIndex)}
              disabled={hasVoted}
              style={isVotedOption ? { borderColor: '#93c5fd', background: '#eff6ff' } : undefined}
            >
              <div className={styles.optionInfo}>
                <span className={styles.optionText}>{opt.text}{isVotedOption && <span style={{ marginLeft: 6, fontSize: 11, color: '#2563eb' }}>✓ Your vote</span>}</span>
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
      <p className={styles.totalVotes} style={{ marginTop: 16 }}>Total votes: {totalVotes}</p>
    </Modal>
  );
};

export default PollDetailModal;
