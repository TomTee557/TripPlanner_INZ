import { useState } from 'react';
import type { Trip } from '@types';
import api from '@services/api';
import './TransferOwnerDialog.scss';

interface TransferOwnerDialogProps {
  trip: Trip;
  onTransferred: () => void;
  onDeleteInstead: () => void;
  onCancel: () => void;
}

export const TransferOwnerDialog = ({
  trip,
  onTransferred,
  onDeleteInstead,
  onCancel,
}: TransferOwnerDialogProps) => {
  const acceptedParticipants = (trip.participants ?? []).filter(
    (p) => p.status === 'ACCEPTED'
  );

  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    acceptedParticipants.length > 0 ? acceptedParticipants[0].userId : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/trips/${trip.id}/transfer-owner`, { newOwnerId: selectedUserId });
      onTransferred();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to transfer ownership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-dialog-overlay" onClick={onCancel}>
      <div className="transfer-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="transfer-dialog__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h3 className="transfer-dialog__title">Delete trip "{trip.title}"?</h3>
        <p className="transfer-dialog__subtitle">
          This trip has <strong>{acceptedParticipants.length}</strong> accepted participant
          {acceptedParticipants.length !== 1 ? 's' : ''}. Choose an action:
        </p>

        {/* Option 1 — transfer ownership */}
        <div className="transfer-dialog__section">
          <p className="transfer-dialog__section-label">
            Transfer ownership to a participant and leave the trip:
          </p>
          <select
            className="transfer-dialog__select"
            value={selectedUserId ?? ''}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            disabled={loading || acceptedParticipants.length === 0}
          >
            {acceptedParticipants.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.name} {p.surname} ({p.email})
              </option>
            ))}
          </select>
          {error && <p className="transfer-dialog__error">{error}</p>}
          <button
            className="transfer-dialog__btn transfer-dialog__btn--transfer"
            onClick={handleTransfer}
            disabled={loading || !selectedUserId}
          >
            {loading ? 'Transferring...' : 'Transfer ownership & leave'}
          </button>
        </div>

        <div className="transfer-dialog__divider">or</div>

        {/* Option 2 — delete entirely */}
        <div className="transfer-dialog__section">
          <p className="transfer-dialog__section-label">
            Delete the trip entirely — all data will be permanently removed and all participants
            will receive a notification.
          </p>
          <button
            className="transfer-dialog__btn transfer-dialog__btn--delete"
            onClick={onDeleteInstead}
            disabled={loading}
          >
            Delete trip for everyone
          </button>
        </div>

        <button
          className="transfer-dialog__btn transfer-dialog__btn--cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
