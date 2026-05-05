import * as React from 'react';

type FileOpType = 'upload' | 'download' | 'copy' | 'move' | 'delete';

const FILE_OP_CONFIG: Record<FileOpType, { icon: string; color: string; label: string }> = {
  upload:   { icon: '📤', color: '#15803d', label: 'Upload' },
  download: { icon: '📥', color: '#0369a1', label: 'Download' },
  copy:     { icon: '📋', color: '#15803d', label: 'Copy' },
  move:     { icon: '➡️', color: '#b45309', label: 'Move' },
  delete:   { icon: '🗑️', color: '#b91c1c', label: 'Delete' },
};

export interface IAgentFileOperationCardProps {
  operationType: FileOpType;
  fileName?: string;
  sourceLibrary?: string;
  destinationLibrary?: string;
  fileSize?: string;
  webUrl?: string;
}

export const AgentFileOperationCard: React.FC<IAgentFileOperationCardProps> = ({
  operationType,
  fileName,
  sourceLibrary,
  destinationLibrary,
  fileSize,
  webUrl,
}) => {
  const cfg = FILE_OP_CONFIG[operationType] || { icon: '📄', color: '#64748b', label: operationType };

  return (
    <div style={{
      marginTop: 10,
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      background: '#ffffff',
      overflow: 'hidden',
      fontSize: 13,
    }}>
      <div style={{
        padding: '10px 16px',
        borderLeft: `4px solid ${cfg.color}`,
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>{cfg.icon}</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>File {cfg.label}</span>
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fileName && <DetailRow label="📄 File" value={fileName} />}
        {sourceLibrary && <DetailRow label="📁 Source" value={sourceLibrary} />}
        {destinationLibrary && <DetailRow label="📂 Destination" value={destinationLibrary} />}
        {fileSize && <DetailRow label="📦 Size" value={fileSize} />}
        {webUrl && (
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none', fontSize: 13 }}
          >
            🔗 View File ↗
          </a>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
    <span style={{ color: '#64748b', minWidth: 100, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 500 }}>{value}</span>
  </div>
);
