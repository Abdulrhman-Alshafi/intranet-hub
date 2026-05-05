import * as React from 'react';
import { IProvisioningPreview } from '../../models/IAgentModels';

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW:    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  MEDIUM: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  HIGH:   { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
};

const opIcons: Record<string, string> = { create: '➕', update: '✏️', delete: '🗑️' };

export interface IAgentPreviewCardProps {
  preview: IProvisioningPreview;
}

export const AgentPreviewCard: React.FC<IAgentPreviewCardProps> = ({ preview }) => {
  const risk = riskColors[preview.risk_level] || riskColors.MEDIUM;

  return (
    <div style={{
      marginTop: 10,
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      background: '#ffffff',
      overflow: 'hidden',
      fontSize: 13,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #6366f115, #8b5cf615)',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{opIcons[preview.operation_type] || '⚙️'}</span>
          <span style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>
            {preview.operation_type} Preview
          </span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 10px', borderRadius: 999,
          background: risk.bg, color: risk.text, border: `1px solid ${risk.border}`,
          fontWeight: 600, fontSize: 11,
        }}>
          {preview.risk_level} RISK
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Resources */}
        {preview.resources && preview.resources.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#334155', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Affected Resources
            </p>
            {preview.resources.map((r, i) => (
              <div key={i} style={{
                padding: '8px 12px', borderRadius: 8,
                background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: r.diff ? 6 : 0 }}>
                  <span style={{
                    padding: '1px 8px', borderRadius: 999,
                    background: '#6366f115', color: '#6366f1', fontWeight: 600, fontSize: 11,
                  }}>
                    {r.resource_type}
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.resource_name}</span>
                  <span style={{ color: '#64748b', marginLeft: 'auto' }}>{r.action}</span>
                </div>
                {r.diff && r.diff.length > 0 && (
                  <ul style={{ margin: '0', paddingLeft: 16, color: '#64748b', fontSize: 12 }}>
                    {r.diff.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {preview.warnings && preview.warnings.length > 0 && (
          <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#fef9c3', border: '1px solid #fde047' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#854d0e', fontSize: 12 }}>⚠️ Warnings</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#854d0e', fontSize: 12 }}>
              {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {/* Dependencies */}
        {preview.dependencies && preview.dependencies.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155', fontSize: 12 }}>Dependencies</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#64748b', fontSize: 12 }}>
              {preview.dependencies.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}

        {/* Duration */}
        <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>
          ⏱️ Estimated duration: <strong style={{ color: '#334155' }}>{preview.estimated_duration}</strong>
        </p>
      </div>
    </div>
  );
};

