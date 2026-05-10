import * as React from 'react';
import Modal from '../common/Modal';
import { useWebPartContext } from '../../context/WebPartContext';
import { ITSupportService } from '../../services/ITSupportService';
import { SPHttpClient } from '@microsoft/sp-http';

const SuggestionAvatar: React.FC<{ photoSrc: string; displayName: string }> = ({ photoSrc, displayName }) => {
  const [err, setErr] = React.useState(false);
  if (photoSrc && !err) {
    return (
      <img
        src={photoSrc}
        alt={displayName}
        onError={() => setErr(true)}
        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600, color: '#4f46e5', flexShrink: 0,
    }}>
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
};

interface IUserSuggestion {
  displayName: string;
  loginName: string;
}

interface IProps { isOpen: boolean; onClose: () => void; onAdded: () => void; }

const AddTeamMemberModal: React.FC<IProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, wpContext, listNames } = useWebPartContext();
  const [role, setRole] = React.useState('IT Support');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<IUserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<IUserSuggestion | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const searchTimer = React.useRef<number | undefined>(undefined);

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: 10, fontSize: 14, background: '#f8fafc', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const searchUsers = async (query: string): Promise<void> => {
    if (!wpContext) return;
    setIsSearching(true);
    try {
      const siteUrl = wpContext.pageContext.web.absoluteUrl;
      const url = `${siteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;
      const body = JSON.stringify({
        queryParams: {
          QueryString: query,
          MaximumEntitySuggestions: 6,
          AllowEmailAddresses: false,
          PrincipalType: 1,
          PrincipalSource: 15,
        },
      });
      const response = await wpContext.spHttpClient.post(
        url,
        SPHttpClient.configurations.v1,
        { headers: { 'Content-Type': 'application/json;odata=verbose', Accept: 'application/json;odata=verbose' }, body }
      );
      if (response.ok) {
        const json = await response.json();
        const raw = json.value ?? json.d?.ClientPeoplePickerSearchUser ?? '[]';
        const parsed: Array<{ DisplayText: string; Key: string }> =
          typeof raw === 'string' ? JSON.parse(raw) : raw;
        setSuggestions(
          parsed
            .filter(p => p.Key && p.DisplayText)
            .map(p => ({ displayName: p.DisplayText, loginName: p.Key }))
        );
      }
    } catch { /* silently ignore */ }
    setIsSearching(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedUser(null);
    setSuggestions([]);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (val.length >= 2) {
      searchTimer.current = window.setTimeout(() => {
        searchUsers(val).catch(() => { setIsSearching(false); });
      }, 350);
    }
  };

  const handleSelect = (user: IUserSuggestion): void => {
    setSelectedUser(user);
    setSearchQuery(user.displayName);
    setSuggestions([]);
  };

  const handleClose = (): void => {
    setRole('IT Support'); setSearchQuery(''); setSelectedUser(null);
    setSuggestions([]); setError('');
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!sp || !selectedUser) {
      setError('Please select a user to add to the team.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const ensured = await sp.web.ensureUser(selectedUser.loginName);
      const recipientId: number = ensured.Id;
      const svc = new ITSupportService(sp, listNames.helpDeskFaqs, listNames.helpDeskTeam);
      await svc.addTeamMember(recipientId, role);
      handleClose();
      onAdded();
    } catch {
      setError('Failed to add team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Help Desk Member" size="small">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Recipient search */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
            Search Tenant User *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                ...fieldStyle,
                paddingRight: selectedUser ? 36 : 14,
                borderColor: selectedUser ? '#86efac' : '#e2e8f0',
                background: selectedUser ? '#f0fdf4' : '#f8fafc',
              }}
              placeholder="Search by name or email..."
              autoComplete="off"
            />
            {selectedUser && (
              <button
                onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: 2 }}
                aria-label="Clear selection"
              >×</button>
            )}
          </div>

          {isSearching && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, paddingLeft: 2 }}>Searching...</div>
          )}

          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)', overflow: 'hidden', marginTop: 2,
            }}>
              {suggestions.map((u, i) => {
                const email = u.loginName.includes('|') ? u.loginName.split('|').pop() || '' : u.loginName;
                const photoSrc = email ? `${wpContext?.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(email)}` : '';
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(u)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 14px', border: 'none', background: 'none',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <SuggestionAvatar photoSrc={photoSrc} displayName={u.displayName} />
                    <span style={{ fontSize: 14, color: '#1e293b' }}>{u.displayName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Role (Optional)</label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            style={fieldStyle}
            placeholder="e.g. IT Support, Network Admin..."
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
          <button onClick={handleClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: 10,
              background: isSubmitting || !selectedUser ? '#93c5fd' : '#2563eb',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isSubmitting || !selectedUser ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddTeamMemberModal;
