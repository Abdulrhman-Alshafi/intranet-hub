import * as React from 'react';
import { IContentAnalysis } from '../../models/IAgentModels';

export interface IAgentAnalysisCardProps {
  analysis: IContentAnalysis;
}

export const AgentAnalysisCard: React.FC<IAgentAnalysisCardProps> = ({ analysis }) => {
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
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #6366f115, #8b5cf615)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>🔍</span>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
            {analysis.resource_name}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{analysis.resource_type}</p>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Summary */}
        <p style={{ margin: '0 0 12px', color: '#334155', lineHeight: 1.6 }}>{analysis.summary}</p>

        {/* Purpose & Audience */}
        {(analysis.purpose || analysis.audience) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {analysis.purpose && (
              <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purpose</p>
                <p style={{ margin: 0, color: '#64748b' }}>{analysis.purpose}</p>
              </div>
            )}
            {analysis.audience && (
              <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audience</p>
                <p style={{ margin: 0, color: '#64748b' }}>{analysis.audience}</p>
              </div>
            )}
          </div>
        )}

        {/* Topics */}
        {analysis.topics && analysis.topics.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#334155', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Topics</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysis.topics.map((t, i) => (
                <span key={i} style={{
                  padding: '2px 10px', borderRadius: 999,
                  background: '#6366f115', color: '#6366f1',
                  border: '1px solid #6366f130', fontWeight: 500, fontSize: 12,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Features */}
        {analysis.key_features && analysis.key_features.length > 0 && (
          <div style={{ marginBottom: analysis.recommendations ? 12 : 0 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#334155', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Key Features</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#64748b', lineHeight: 1.8 }}>
              {analysis.key_features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1e40af', fontSize: 12 }}>💡 Recommendations</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: '#1e40af', lineHeight: 1.8 }}>
              {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
