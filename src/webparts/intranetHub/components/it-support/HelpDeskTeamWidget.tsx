import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './HelpDeskTeamWidget.module.scss';
import { useWebPartContext } from '../../context/WebPartContext';
import { ITSupportService } from '../../services/ITSupportService';
import { IHelpDeskTeamMember } from '../../models/IITSupportModels';
import { UserRole } from '../../utils/roleUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import AddTeamMemberModal from './AddTeamMemberModal';

const HelpDeskTeamWidget: React.FC = () => {
  const { sp, wpContext, listNames, userRole } = useWebPartContext();
  const [members, setMembers] = React.useState<IHelpDeskTeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.MainAdmin;

  const loadData = React.useCallback(async () => {
    if (!sp) return;
    setIsLoading(true);
    setError(null);
    try {
      const svc = new ITSupportService(sp, listNames.helpDeskFaqs, listNames.helpDeskTeam);
      const items = await svc.getHelpDeskTeam();
      setMembers(items);
    } catch (err) {
      setError((err as Error).message || 'Failed to load Help Desk Team');
    } finally {
      setIsLoading(false);
    }
  }, [sp, listNames]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const handleRemove = async (id: number) => {
    if (!sp || !isAdmin) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const svc = new ITSupportService(sp, listNames.helpDeskFaqs, listNames.helpDeskTeam);
      await svc.removeTeamMember(id);
      loadData();
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Help Desk Team</h2>
        {isAdmin && (
          <motion.button 
            onClick={() => setShowAddModal(true)}
            style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            + Add Member
          </motion.button>
        )}
      </div>
      
      <div className={styles.content} style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? <LoadingSpinner count={2} /> : error ? <ErrorState message={error} onRetry={loadData} /> : members.length === 0 ? (
          <EmptyState title="No Team Members" description="Add members to the Help Desk team." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.map(member => {
              const email = member.Member?.EMail || '';
              const photoSrc = email ? `${wpContext?.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(email)}` : '';
              return (
                <div key={member.Id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                  {photoSrc ? (
                    <img src={photoSrc} alt={member.Member?.Title} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                      {(member.Member?.Title || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{member.Member?.Title || 'Unknown User'}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{member.Role || 'IT Support'}</p>
                    {email && (
                      <a href={`mailto:${email}`} style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email}
                      </a>
                    )}
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleRemove(member.Id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove Member"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddTeamMemberModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={loadData} />
    </div>
  );
};

export default HelpDeskTeamWidget;
