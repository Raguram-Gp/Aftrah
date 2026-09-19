import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EntityNotFoundProps {
  entityLabel: string;
  backLabel: string;
  onBack: () => void;
}

export const EntityNotFound: React.FC<EntityNotFoundProps> = ({
  entityLabel,
  backLabel,
  onBack,
}) => {
  return (
    <div className="entity-not-found">
      <AlertCircle size={28} />
      <p className="entity-not-found-title">This {entityLabel} was not found</p>
      <button type="button" className="afrah-app-back-btn" onClick={onBack}>
        {backLabel}
      </button>
    </div>
  );
};
