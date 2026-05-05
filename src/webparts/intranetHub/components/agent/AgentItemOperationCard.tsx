import * as React from 'react';

type ItemOpType = 'create' | 'update' | 'delete' | 'query' | 'attach' | 'view';

const ITEM_OP_CONFIG: Record<ItemOpType, { label: string; icon: string; bg: string; color: string }> = {
  create: { label: 'Create Item',  icon: '+',  bg: '#dcfce7', color: '#15803d' },
  update: { label: 'Update Item',  icon: '✎',  bg: '#fef9c3', color: '#854d0e' },
  delete: { label: 'Delete Item',  icon: '✕',  bg: '#fee2e2', color: '#b91c1c' },
  query:  { label: 'Query Items',  icon: '◎',  bg: '#eff6ff', color: '#1d4ed8' },
  attach: { label: 'Attachment',   icon: '⊘',  bg: '#f5f3ff', color: '#6d28d9' },
  view:   { label: 'View Items',   icon: '▤',  bg: '#f1f5f9', color: '#334155' },
};

export interface IAgentItemOperationCardProps {
  operationType: ItemOpType;
  listName?: string;
  itemCount?: number;
  fieldValues?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const AgentItemOperationCard: React.FC<IAgentItemOperationCardProps> = ({
  operationType,
  listName,
  itemCount,
  fieldValues,
}) => {
  const cfg = ITEM_OP_CONFIG[operationType] ?? ITEM_OP_CONFIG.view;
  const noun = itemCount === 1 ? 'item' : 'items';

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
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 6,
          background: cfg.bg, color: cfg.color,
          fontWeight: 700, fontSize: 13,
        }}>
          {cfg.icon}
        </span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{cfg.label}</span>
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {listName && <DetailRow label="List" value={listName} />}
        {itemCount !== undefined && (
          <DetailRow label="Items" value={`${itemCount} ${noun}`} />
        )}

        {fieldValues && Object.keys(fieldValues).length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fields</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(fieldValues).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#64748b', minWidth: 100, flexShrink: 0 }}>{key}</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
    <span style={{ color: '#64748b', minWidth: 60, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 500 }}>{value}</span>
  </div>
);
