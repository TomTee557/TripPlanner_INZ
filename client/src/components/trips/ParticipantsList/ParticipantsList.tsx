import type { TripParticipant } from '@types';
import './ParticipantsList.scss';

interface Owner {
  id: number;
  email: string;
  name: string;
  surname: string;
}

interface ParticipantsListProps {
  participants: TripParticipant[];
  tripTitle: string;
  owner?: Owner | null;
}

const statusConfig: Record<string, { icon: string; label: string; className: string }> = {
  ACCEPTED: { icon: '✅', label: 'Accepted', className: 'accepted' },
  REJECTED: { icon: '❌', label: 'Rejected', className: 'rejected' },
  PENDING: { icon: '⏳', label: 'Pending', className: 'pending' },
};

export const ParticipantsList = ({ participants, tripTitle, owner }: ParticipantsListProps) => {
  const visibleParticipants = participants.filter((p) => p.status !== 'REJECTED');
  const totalCount = (owner ? 1 : 0) + visibleParticipants.length;

  if (totalCount === 0) {
    return (
      <div className="participants-list participants-list--empty">
        <p>No participants for this trip.</p>
      </div>
    );
  }

  return (
    <div className="participants-list">
      <p className="participants-list__subtitle">
        {totalCount} participant{totalCount !== 1 ? 's' : ''} in "{tripTitle}"
      </p>
      <div className="participants-list__items">
        {/* Owner always first */}
        {owner && (
          <div className="participants-list__item">
            <div className="participants-list__item-avatar participants-list__item-avatar--owner">
              {owner.name.charAt(0).toUpperCase()}
              {owner.surname.charAt(0).toUpperCase()}
            </div>
            <div className="participants-list__item-info">
              <span className="participants-list__item-name">
                {owner.name} {owner.surname}
              </span>
              <span className="participants-list__item-email">{owner.email}</span>
            </div>
            <div className="participants-list__item-status participants-list__item-status--owner">
              <span className="participants-list__item-status-icon">👑</span>
              <span className="participants-list__item-status-label">Owner</span>
            </div>
          </div>
        )}

        {/* Invited participants (excluding rejected) */}
        {visibleParticipants.map((participant) => {
          const config = statusConfig[participant.status] || statusConfig.PENDING;
          return (
            <div key={participant.id} className="participants-list__item">
              <div className="participants-list__item-avatar">
                {participant.name.charAt(0).toUpperCase()}
                {participant.surname.charAt(0).toUpperCase()}
              </div>
              <div className="participants-list__item-info">
                <span className="participants-list__item-name">
                  {participant.name} {participant.surname}
                </span>
                <span className="participants-list__item-email">
                  {participant.email}
                </span>
              </div>
              <div className={`participants-list__item-status participants-list__item-status--${config.className}`}>
                <span className="participants-list__item-status-icon">{config.icon}</span>
                <span className="participants-list__item-status-label">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
