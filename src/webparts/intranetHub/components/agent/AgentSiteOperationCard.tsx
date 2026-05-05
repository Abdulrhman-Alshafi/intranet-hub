import * as React from 'react';

type SiteOpType =
  | 'create' | 'delete' | 'update_theme' | 'add_member' | 'add_owner'
  | 'remove_member' | 'navigation' | 'recycle_bin' | 'empty_recycle_bin'
  | 'restore_item' | 'get_storage' | 'get_analytics';

const SITE_OP_CONFIG: Record<SiteOpType, { icon: string; color: string }> = {
  create:            { icon: '🏗️', color: '#15803d' },
  delete:            { icon: '🗑️', color: '#b91c1c' },
  update_theme:      { icon: '🎨', color: '#7c3aed' },
  add_member:        { icon: '👥', color: '#15803d' },
  add_owner:         { icon: '👥', color: '#15803d' },
  remove_member:     { icon: '👤', color: '#b91c1c' },
  navigation:        { icon: '🧭', color: '#0369a1' },
  recycle_bin:       { icon: '♻️', color: '#b45309' },
  empty_recycle_bin: { icon: '♻️', color: '#b91c1c' },
  restore_item:      { icon: '♻️', color: '#15803d' },
  get_storage:       { icon: '💾', color: '#0369a1' },
  get_analytics:     { icon: '📊', color: '#6366f1' },
};

export interface IAgentSiteOperationCardProps {
  operationType: SiteOpType;
  siteName?: string;
  siteUrl?: string;
  userEmail?: string;
  navigationItems?: Array<{ Title: string; Url: string }>;
  storageInfo?: { used: number; total: number; remaining: number };
  analytics?: { views: number; visitors: number };
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const AgentSiteOperationCard: React.FC<IAgentSiteOperationCardProps> = ({
  operationType,
  siteName,
  siteUrl,
  userEmail,
  navigationItems,
  storageInfo,
  analytics,
}) => {
  const cfg = SITE_OP_CONFIG[operationType] ?? { icon: '🏢', color: '#64748b' };
  const opLabel = operationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
        padding: '10px 16px',
        borderLeft: `4px solid ${cfg.color}`,
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>{cfg.icon}</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Site {opLabel}</span>
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {siteName && <DetailRow label="🏢 Site" value={siteName} />}
        {siteUrl && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#64748b', minWidth: 80, flexShrink: 0 }}>🔗 URL</span>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all' }}>
              {siteUrl} ↗
            </a>
          </div>
        )}
        {userEmail && <DetailRow label="👤 User" value={userEmail} />}

        {/* Navigation Items */}
        {navigationItems && navigationItems.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Navigation</p>
            {navigationItems.map((nav, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#334155' }}>• {nav.Title}</span>
                <a href={nav.Url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12, marginLeft: 'auto' }}>
                  ↗
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Storage Info */}
        {storageInfo && (
          <div style={{ marginTop: 4 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Storage</p>
            <div style={{ background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', height: 8, marginBottom: 4 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (storageInfo.used / storageInfo.total) * 100)}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                borderRadius: 6,
              }} />
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>
              {formatBytes(storageInfo.used)} used of {formatBytes(storageInfo.total)} ({formatBytes(storageInfo.remaining)} remaining)
            </p>
          </div>
        )}

        {/* Analytics */}
        {analytics && (
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#6366f1' }}>{analytics.views.toLocaleString()}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>Views</p>
            </div>
            <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{analytics.visitors.toLocaleString()}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>Visitors</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
    <span style={{ color: '#64748b', minWidth: 80, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 500 }}>{value}</span>
  </div>
);
