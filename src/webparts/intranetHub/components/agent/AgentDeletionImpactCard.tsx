import * as React from 'react';
import { IDeletionImpact } from '../../models/IAgentModels';

export interface IAgentDeletionImpactCardProps {
  deletionImpact: IDeletionImpact;
  confirmationText?: string;
}

export const AgentDeletionImpactCard: React.FC<IAgentDeletionImpactCardProps> = ({
  deletionImpact,
  confirmationText,
}) => {
  const confirmPrompt =
    (confirmationText && confirmationText.trim())
      ? confirmationText
      : `Are you sure you want to delete ${deletionImpact.resource_name}? If yes, type "yes, say so".`;

  return (
    <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6 }}>
      <div>{deletionImpact.risk_level}</div>
      <div>{confirmPrompt}</div>
    </div>
  );
};

