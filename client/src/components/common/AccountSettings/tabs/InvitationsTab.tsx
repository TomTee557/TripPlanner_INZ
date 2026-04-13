import { useState, useEffect } from 'react';
import type { ReceivedInvitation, SentInvitation, ConfirmationInvitation } from '@types';
import {
  getInvitations,
  acceptInvitation,
  declineInvitation,
  confirmInvitation,
} from '@services/account.service';

interface InvitationsTabProps {
  onNotificationChange: () => void;
  onTripListChange: () => void;
}

export const InvitationsTab = ({ onNotificationChange, onTripListChange }: InvitationsTabProps) => {
  const [received, setReceived] = useState<ReceivedInvitation[]>([]);
  const [sent, setSent] = useState<SentInvitation[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getInvitations();
      if (res.data) {
        setReceived(res.data.received);
        setSent(res.data.sent);
        setConfirmations(res.data.confirmations);
      }
    } catch {
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await acceptInvitation(id);
      fetchAll();
      onNotificationChange();
      onTripListChange();
    } catch {
      setError('Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    try {
      await declineInvitation(id);
      fetchAll();
      onNotificationChange();
      onTripListChange();
    } catch {
      setError('Failed to decline invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await confirmInvitation(id);
      fetchAll();
      onNotificationChange();
    } catch {
      setError('Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const statusConfig: Record<string, { icon: string; label: string; className: string }> = {
    ACCEPTED: { icon: '✅', label: 'Accepted', className: 'accepted' },
    REJECTED: { icon: '❌', label: 'Rejected', className: 'rejected' },
    PENDING: { icon: '⏳', label: 'Pending', className: 'pending' },
  };

  if (loading) return <p className="invitations-tab__loading">Loading invitations...</p>;

  const unreadConfirmations = confirmations.filter((c) => !c.ownerSeen);

  return (
    <div className="invitations-tab">
      <div className="invitations-tab__actions-bar">
        <button className="invitations-tab__refresh" onClick={fetchAll}>
          🔄 Refresh Now
        </button>
      </div>

      {error && <div className="invitations-tab__error">{error}</div>}

      {/* Confirmations — responses from invited users that owner needs to acknowledge */}
      {confirmations.length > 0 && (
        <div className="invitations-tab__section">
          <h3 className="invitations-tab__section-title">
            Confirmations ({confirmations.length})
            {unreadConfirmations.length > 0 && (
              <span className="invitations-tab__section-badge">{unreadConfirmations.length} new</span>
            )}
          </h3>
          <div className="invitations-tab__list">
            {confirmations.map((inv) => {
              const config = statusConfig[inv.status];
              return (
                <div
                  key={inv.id}
                  className={`invitations-tab__item ${!inv.ownerSeen ? 'invitations-tab__item--highlight' : ''}`}
                >
                  <div className="invitations-tab__item-info">
                    <span className="invitations-tab__item-trip">{inv.tripTitle}</span>
                    <span className="invitations-tab__item-details">
                      {inv.participant.name} {inv.participant.surname} ({inv.participant.email})
                    </span>
                  </div>
                  <div className="invitations-tab__item-actions">
                    <span className={`invitations-tab__status invitations-tab__status--${config.className}`}>
                      {config.icon} {config.label}
                    </span>
                    {!inv.ownerSeen && (
                      <button
                        className="invitations-tab__btn invitations-tab__btn--confirm"
                        onClick={() => handleMarkAsRead(inv.id)}
                        disabled={actionLoading === inv.id}
                      >
                        {actionLoading === inv.id ? '...' : '✓ Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Received invitations */}
      <div className="invitations-tab__section">
        <h3 className="invitations-tab__section-title">
          Received Invitations ({received.length})
        </h3>
        {received.length === 0 ? (
          <p className="invitations-tab__empty">No invitations received.</p>
        ) : (
          <div className="invitations-tab__list">
            {received.map((inv) => {
              const config = statusConfig[inv.status];
              return (
                <div key={inv.id} className="invitations-tab__item">
                  <div className="invitations-tab__item-info">
                    <span className="invitations-tab__item-trip">{inv.tripTitle}</span>
                    <span className="invitations-tab__item-details">
                      {inv.tripCountry} · {inv.tripDateFrom} → {inv.tripDateTo}
                    </span>
                    <span className="invitations-tab__item-from">
                      From: {inv.invitedBy.name} {inv.invitedBy.surname} ({inv.invitedBy.email})
                    </span>
                  </div>
                  <div className="invitations-tab__item-actions">
                    {inv.status === 'PENDING' ? (
                      <>
                        <button
                          className="invitations-tab__btn invitations-tab__btn--accept"
                          onClick={() => handleAccept(inv.id)}
                          disabled={actionLoading === inv.id}
                        >
                          {actionLoading === inv.id ? '...' : 'Accept'}
                        </button>
                        <button
                          className="invitations-tab__btn invitations-tab__btn--decline"
                          onClick={() => handleDecline(inv.id)}
                          disabled={actionLoading === inv.id}
                        >
                          {actionLoading === inv.id ? '...' : 'Decline'}
                        </button>
                      </>
                    ) : (
                      <span className={`invitations-tab__status invitations-tab__status--${config.className}`}>
                        {config.icon} {config.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sent invitations (pending only) */}
      <div className="invitations-tab__section">
        <h3 className="invitations-tab__section-title">
          Sent Invitations ({sent.length})
        </h3>
        {sent.length === 0 ? (
          <p className="invitations-tab__empty">No pending invitations sent.</p>
        ) : (
          <div className="invitations-tab__list">
            {sent.map((inv) => (
              <div key={inv.id} className="invitations-tab__item">
                <div className="invitations-tab__item-info">
                  <span className="invitations-tab__item-trip">{inv.tripTitle}</span>
                  <span className="invitations-tab__item-details">
                    To: {inv.participant.name} {inv.participant.surname} ({inv.participant.email})
                  </span>
                </div>
                <div className="invitations-tab__item-actions">
                  <span className="invitations-tab__status invitations-tab__status--pending">
                    ⏳ Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
