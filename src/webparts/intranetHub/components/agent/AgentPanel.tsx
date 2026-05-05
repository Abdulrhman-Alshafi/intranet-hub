import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AgentPanel.module.scss';
import { IAgentPanelProps } from './IAgentPanelProps';
import { AgentApiService, ISharePointContext } from '../../services/AgentApiService';
import { IChatMessage, IAttachedFile, IApiResponse, IChatHistoryItem } from '../../models/IAgentModels';
import { AgentChatMessage } from './AgentChatMessage';

const HISTORY_DEPTH = 10;

const IconBot: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v2a2 2 0 0 1-2 2h-1v1a1 1 0 0 1-2 0v-1H8v1a1 1 0 0 1-2 0v-1H5a2 2 0 0 1-2-2v-2a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

const IconAttach: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15 9.5L8.5 16C7.12 17.38 4.88 17.38 3.5 16C2.12 14.62 2.12 12.38 3.5 11L10 4.5C10.83 3.67 12.17 3.67 13 4.5C13.83 5.33 13.83 6.67 13 7.5L7 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconSend: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconX: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconTrash: React.FC = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const SUGGESTIONS = [
  { text: "What's happening this week?" },
  { text: 'Find company policies' },
  { text: 'How do I request PTO?' },
];

function buildHistory(messages: IChatMessage[]): IChatHistoryItem[] {
  return messages
    .slice(-HISTORY_DEPTH)
    .map(m => ({ role: m.role, content: m.content }));
}

function mapResponseToMessage(res: IApiResponse, id: string): IChatMessage {
  return {
    id,
    role: 'assistant',
    content: res.reply,
    timestamp: new Date(),
    intent: res.intent,
    sourceList: res.source_list,
    resourceLink: res.resource_link,
    dataSummary: res.data_summary,
    suggestedActions: res.suggested_actions,
    resourceLinks: res.resource_links,
    blueprint: res.blueprint,
    requiresConfirmation: res.requires_confirmation,
    warnings: res.warnings,
    requiresInput: res.requires_input,
    sessionId: res.session_id,
    questionPrompt: res.question_prompt,
    currentField: res.current_field,
    fieldType: res.field_type,
    fieldOptions: res.field_options,
    progress: res.progress ? `${res.progress.current} / ${res.progress.total}` : undefined,
    specificationPreview: res.specification_preview,
    quickSuggestions: res.quick_suggestions,
    preview: res.preview,
    analysis: res.analysis,
    deletionImpact: res.deletion_impact,
    webPartDecision: res.web_part_decision,
    contextSummary: res.context_summary,
    confirmationText: res.confirmation_text,
    errorCode: res.error_code,
    errorCategory: res.error_category,
    recoveryHint: res.recovery_hint,
    correlationId: res.correlation_id,
  };
}

const AgentPanel: React.FC<IAgentPanelProps> = (props) => {
  const { backendUrl, backendClientId, aadHttpClientFactory, siteId, siteUrl, siteName, pageUrl, pageTitle } = props;

  const [messages, setMessages] = React.useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | undefined>(undefined);
  const [attachedFiles, setAttachedFiles] = React.useState<IAttachedFile[]>([]);
  const [pendingFileId, setPendingFileId] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const chatAreaRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Service created synchronously — never null on first render
  const apiService = React.useMemo<AgentApiService | null>(
    () => (backendUrl && backendClientId ? new AgentApiService(backendUrl, backendClientId, aadHttpClientFactory) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [backendUrl, backendClientId]
  );

  // Stable ref — hoisted before the capture-phase effect so the closure is always valid
  const handleSendRef = React.useRef<(text?: string) => Promise<void>>(async () => undefined);

  // Health check (side-effect only, separate from service creation)
  React.useEffect(() => {
    if (!apiService) {
      setError('AI agent not configured. Set the backend URL in the property pane.');
      return;
    }
    setError(undefined);
    apiService.healthCheck().then(ok => {
      if (!ok) setError('AI agent backend is unavailable. Please check the backend URL.');
    }).catch(() => setError('Unable to reach the AI agent backend.'));
  }, [apiService]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Capture-phase Enter handler — fires before SharePoint page listeners
  // (handleSendRef is declared above so the closure is always valid)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && !e.shiftKey && document.activeElement === textareaRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        void handleSendRef.current();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSpContext = (): ISharePointContext => ({
    site: { id: siteId, url: siteUrl, name: siteName },
    page: { url: pageUrl, title: pageTitle },
  });

  const handleSend = async (text?: string): Promise<void> => {
    const msg = (text !== undefined ? text : inputValue).trim();
    if (!msg && attachedFiles.length === 0) return;
    if (!apiService) return;

    const filesToSend = [...attachedFiles];
    const msgToSend = msg;

    const displayText = msgToSend || `[${filesToSend.map(f => f.name).join(', ')}]`;
    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: displayText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    const history = buildHistory(messages);
    const context = getSpContext();
    const currentPendingFileId = pendingFileId;
    const currentSessionId = sessionId;

    try {
      let res: IApiResponse;

      if (filesToSend.length > 0) {
        res = await apiService.sendMessageWithFiles(
          msgToSend,
          filesToSend.map(f => ({ file: f.file, name: f.name })),
          history,
          currentSessionId,
          currentPendingFileId,
          context
        );
      } else {
        res = await apiService.sendMessage(
          msgToSend,
          history,
          currentSessionId,
          currentPendingFileId,
          context
        );
      }

      if (res.session_id) setSessionId(res.session_id);
      setPendingFileId(res.pending_file_id || undefined);

      const botMsg = mapResponseToMessage(res, (Date.now() + 1).toString());
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'An unexpected error occurred.';
      const errMsg: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errText}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Keep handleSendRef current on every render
  React.useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleActionClick = (action: string): void => { void handleSend(action); };


  const handleClearHistory = (): void => {
    setMessages([]);
    setError(undefined);
    setSessionId(undefined);
    setPendingFileId(undefined);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleAttachClick = (): void => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    const newAttached: IAttachedFile[] = files.map(f => ({ file: f, name: f.name, size: f.size, type: f.type }));
    setAttachedFiles(prev => [...prev, ...newAttached]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number): void => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const latestAssistantIndex = messages.reduce((last, m, i) => m.role === 'assistant' ? i : last, -1);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <IconBot size={18} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>AI Assistant</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {messages.length > 0 && (
            <button
              className={styles.clearButton}
              onClick={handleClearHistory}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(undefined)} className={styles.errorDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Chat Area */}
      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <motion.div
              className={styles.welcomeInner}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.botAvatar}>
                <IconBot size={32} />
              </div>
              <div className={styles.headerText}>
                <h3 className={styles.headerTitle}>Hi! I&apos;m your AI assistant.</h3>
                <p className={styles.headerSub}>How can I help you today?</p>
              </div>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    className={styles.suggestionBtn}
                    onClick={() => void handleSend(s.text)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{s.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AgentChatMessage
                message={msg}
                isLatestAssistantMessage={idx === latestAssistantIndex}
                onActionClick={handleActionClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className={`${styles.message} ${styles.botMsg}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.msgAvatar}><IconBot size={16} /></div>
            <div className={styles.typingIndicator}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        {/* Attached file chips */}
        {attachedFiles.length > 0 && (
          <div className={styles.attachedFilesRow}>
            {attachedFiles.map((f, i) => (
              <div key={i} className={styles.fileChip}>
                <span className={styles.fileChipName}>{f.name}</span>
                <button
                  className={styles.removeFileBtn}
                  onClick={() => handleRemoveFile(i)}
                  aria-label={`Remove ${f.name}`}
                >
                  <IconX />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            className={styles.inputField}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              // Prevent default Enter (actual send handled by document capture listener)
              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault();
            }}
            placeholder="Ask your SharePoint AI assistant..."
            rows={1}
          />
          <div className={styles.inputActions}>
            <button
              className={styles.attachBtn}
              onClick={handleAttachClick}
              title="Attach file"
              aria-label="Attach file"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 9.5L8.5 16C7.12 17.38 4.88 17.38 3.5 16C2.12 14.62 2.12 12.38 3.5 11L10 4.5C10.83 3.67 12.17 3.67 13 4.5C13.83 5.33 13.83 6.67 13 7.5L7 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className={`${styles.sendBtn} ${(inputValue.trim() || attachedFiles.length > 0) ? styles.active : ''}`}
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() && attachedFiles.length === 0}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default AgentPanel;

