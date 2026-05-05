import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IChatMessage } from '../../models/IAgentModels';
import { AgentPreviewCard } from './AgentPreviewCard';
import { AgentAnalysisCard } from './AgentAnalysisCard';
import { AgentDeletionImpactCard } from './AgentDeletionImpactCard';
import { AgentFileOperationCard } from './AgentFileOperationCard';
import { AgentItemOperationCard } from './AgentItemOperationCard';
import { AgentSiteOperationCard } from './AgentSiteOperationCard';
import styles from './AgentPanel.module.scss';

const IconBot: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v2a2 2 0 0 1-2 2h-1v1a1 1 0 0 1-2 0v-1H8v1a1 1 0 0 1-2 0v-1H5a2 2 0 0 1-2-2v-2a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

export interface IAgentChatMessageProps {
  message: IChatMessage;
  isLatestAssistantMessage?: boolean;
  onActionClick: (action: string) => void;
}

export const AgentChatMessage: React.FC<IAgentChatMessageProps> = ({
  message,
  isLatestAssistantMessage = false,
  onActionClick,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.userMsg : styles.botMsg}`}>
      {!isUser && (
        <div className={styles.msgAvatar}><IconBot size={16} /></div>
      )}

      <div className={`${styles.msgBubble} ${isUser ? styles.userBubble : styles.botBubble}`}>
        {/* Message text with markdown for assistant */}
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div className={styles.markdownContent}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Progress indicator */}
        {message.requiresInput && message.progress && (
          <div style={{ marginTop: 8, padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', fontSize: 12 }}>
            {message.progress}
          </div>
        )}

        {/* Field options (interactive gathering) */}
        {isLatestAssistantMessage && message.fieldOptions && message.fieldOptions.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>Select an option</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {message.fieldOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => onActionClick(opt)}
                  style={{
                    padding: '5px 14px', borderRadius: 999,
                    border: '1px solid #c7d2fe', background: '#f5f3ff',
                    color: '#4f46e5', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick suggestions (when no field options) */}
        {isLatestAssistantMessage && !message.fieldOptions?.length && message.quickSuggestions && message.quickSuggestions.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>Quick suggestions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {message.quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onActionClick(s)}
                  style={{
                    padding: '5px 14px', borderRadius: 999,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#334155', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Structured error */}
        {message.errorCode && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 8,
            background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c',
          }}>
            <strong style={{ fontSize: 12 }}>
              {message.errorCategory === 'internal'
                ? 'System Error'
                : message.errorCategory
                  ? `${message.errorCategory.charAt(0).toUpperCase() + message.errorCategory.slice(1)} Error (${message.errorCode})`
                  : `Error (${message.errorCode})`}
            </strong>
            {message.recoveryHint && (
              <p style={{ margin: '4px 0 0', fontSize: 12 }}>{message.recoveryHint}</p>
            )}
            {message.correlationId && (
              <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: 'monospace', opacity: 0.7 }}>
                Ref: {message.correlationId}
              </p>
            )}
          </div>
        )}

        {/* Specification preview */}
        {message.specificationPreview && Object.keys(message.specificationPreview).length > 0 && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#334155', fontSize: 12 }}>Current specification</p>
            {Object.entries(message.specificationPreview).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ color: '#64748b', minWidth: 80 }}>{key}:</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Resource links */}
        {message.resourceLinks && message.resourceLinks.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {message.resourceLinks.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  color: '#1d4ed8', fontSize: 12, fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                View Resource ↗
              </a>
            ))}
          </div>
        )}

        {/* Query source link */}
        {message.intent === 'query' && message.resourceLink && (
          <div style={{ marginTop: 8 }}>
            <a
              href={message.resourceLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 12px', borderRadius: 999,
                background: '#eff6ff', border: '1px solid #bfdbfe',
                color: '#1d4ed8', fontSize: 12, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {message.sourceList || 'Source'} ↗
            </a>
          </div>
        )}

        {/* Warnings (when no preview/deletion card) */}
        {message.requiresConfirmation && message.warnings && message.warnings.length > 0 && !message.preview && !message.deletionImpact && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#fef9c3', border: '1px solid #fde047' }}>
            <strong style={{ color: '#854d0e', fontSize: 12 }}>Confirmation Required</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: '#854d0e', fontSize: 12 }}>
              {message.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {/* Preview Card */}
        {message.preview && (
          <AgentPreviewCard
            preview={message.preview}
          />
        )}

        {/* Analysis Card */}
        {message.analysis && (
          <AgentAnalysisCard analysis={message.analysis} />
        )}

        {/* Deletion Impact Card */}
        {message.deletionImpact && (
          <AgentDeletionImpactCard
            deletionImpact={message.deletionImpact}
            confirmationText={message.confirmationText}
          />
        )}

        {/* Web Part Decision */}
        {message.webPartDecision && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Web Part Recommendation</p>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 999, marginBottom: 6,
              background: message.webPartDecision.decision === 'builtin' ? '#dcfce7' : '#eff6ff',
              color: message.webPartDecision.decision === 'builtin' ? '#15803d' : '#1d4ed8',
              fontWeight: 600, fontSize: 12,
            }}>
              {message.webPartDecision.decision === 'builtin' ? '✓ Built-in' : '🔧 Custom'}
            </span>
            {message.webPartDecision.web_part_title && (
              <p style={{ margin: '0 0 4px', color: '#334155', fontWeight: 500 }}>{message.webPartDecision.web_part_title}</p>
            )}
            <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>{message.webPartDecision.reasoning}</p>
            {message.webPartDecision.alternative_options && message.webPartDecision.alternative_options.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <strong style={{ fontSize: 12, color: '#334155' }}>Alternatives:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: '#64748b', fontSize: 12 }}>
                  {message.webPartDecision.alternative_options.map((alt, i) => <li key={i}>{alt}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Context Summary */}
        {message.contextSummary && Object.keys(message.contextSummary).length > 0 && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155', fontSize: 12 }}>Auto-filled from context</p>
            {Object.entries(message.contextSummary).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ color: '#64748b', minWidth: 80 }}>{key}:</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* File Operation Card */}
        {message.intent === 'file_operation' && message.dataSummary && (
          <AgentFileOperationCard
            operationType={message.dataSummary.operation || 'download'}
            fileName={message.dataSummary.name || message.dataSummary.file_name}
            sourceLibrary={message.dataSummary.library_name}
            destinationLibrary={message.dataSummary.destination_library_name}
            fileSize={message.dataSummary.size_mb ? `${message.dataSummary.size_mb} MB` : undefined}
            webUrl={message.dataSummary.web_url}
          />
        )}

        {/* Item Operation Card */}
        {message.intent === 'item_operation' && message.dataSummary && (
          <AgentItemOperationCard
            operationType={message.dataSummary.operation || 'query'}
            listName={message.sourceList || message.dataSummary.list_name}
            itemCount={message.dataSummary.count || message.dataSummary.items?.length}
            fieldValues={message.dataSummary.fields || message.dataSummary.field_values}
          />
        )}

        {/* Site Operation Card */}
        {message.intent === 'site_operation' && message.dataSummary && (
          <AgentSiteOperationCard
            operationType={message.dataSummary.operation || 'create'}
            siteName={message.dataSummary.displayName || message.dataSummary.site_name}
            siteUrl={message.dataSummary.webUrl || message.dataSummary.web_url}
            userEmail={message.dataSummary.user_email}
            navigationItems={message.dataSummary.navigation_items}
            storageInfo={message.dataSummary.used !== undefined ? {
              used: message.dataSummary.used,
              total: message.dataSummary.total,
              remaining: message.dataSummary.remaining,
            } : undefined}
            analytics={message.dataSummary.views !== undefined ? {
              views: message.dataSummary.views,
              visitors: message.dataSummary.visitors,
            } : undefined}
          />
        )}

        {/* Suggested actions — last */}
        {isLatestAssistantMessage && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested Actions
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {message.suggestedActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => onActionClick(action)}
                  style={{
                    padding: '5px 14px', borderRadius: 999,
                    border: '1px solid #c7d2fe', background: '#f5f3ff',
                    color: '#4f46e5', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
