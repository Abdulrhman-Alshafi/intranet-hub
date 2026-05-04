import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { EmployeeOfMonthService } from '../../../services/EmployeeOfMonthService';
import { SPHttpClient } from '@microsoft/sp-http';
import '@pnp/sp/webs';
import '@pnp/sp/site-users';

interface IUserSuggestion {
  displayName: string;
  loginName: string;
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSet: () => void;
}

const SetEOMModal: React.FC<IProps> = ({ isOpen, onClose, onSet }) => {
  const { sp, wpContext, listNames } = useWebPartContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<IUserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<IUserSuggestion | null>(null);
  const [notes, setNotes] = React.useState('');
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
    setSearchQuery(''); setSelectedUser(null);
    setSuggestions([]); setError(''); setNotes('');
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!sp || !selectedUser) {
      setError('Please select an employee.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const ensured = await sp.web.ensureUser(selectedUser.loginName);
      const svc = new EmployeeOfMonthService(sp, listNames.employeeOfMonth);
      await svc.setEOM(ensured.Id, notes.trim() || undefined);
      handleClose();
      onSet();
    } catch {
      setError('Failed to set Employee of the Month. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Set Employee of the Month">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Employee *</label>
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            style={fieldStyle}
            placeholder="Search for employee..."
            autoComplete="off"
          />
          {isSearching && (
            <div style={{ position: 'absolute', right: 12, top: 36, fontSize: 12, color: '#94a3b8' }}>Searching...</div>
          )}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginTop: 4, overflow: 'hidden',
            }}>
              {suggestions.map(s => (
                <button
                  key={s.loginName}
                  onClick={() => handleSelect(s)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', border: 'none', background: 'none',
                    fontSize: 13, cursor: 'pointer', color: '#0f172a',
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'none'; }}
                >
                  {s.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
            placeholder="Why are they Employee of the Month?"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={handleClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: 10,
              background: isSubmitting || !selectedUser ? '#fcd34d' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isSubmitting || !selectedUser ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Saving...' : 'Set as Employee of Month'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SetEOMModal;
