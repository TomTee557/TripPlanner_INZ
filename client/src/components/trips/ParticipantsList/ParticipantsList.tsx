import type { TripParticipant } from '@types';
import './ParticipantsList.scss';

interface ParticipantsListProps {
  participants: TripParticipant[];
  tripTitle: string;
}

const statusConfig: Record<string, { icon: string; label: string; className: string }> = {
  ACCEPTED: { icon: '✅', label: 'Accepted', className: 'accepted' },
  REJECTED: { icon: '❌', label: 'Rejected', className: 'rejected' },
  PENDING: { icon: '⏳', label: 'Pending', className: 'pending' },
};

export const ParticipantsList = ({ participants, tripTitle }: ParticipantsListProps) => {
  if (participants.length === 0) {
    return (
      <div className="participants-list participants-list--empty">
        <p>No participants for this trip.</p>
      </div>
    );
  }

  return (
    <div className="participants-list">
      <p className="participants-list__subtitle">
        {participants.length} participant{participants.length !== 1 ? 's' : ''} in "{tripTitle}"
      </p>
      <div className="participants-list__items">
        {participants.map((participant) => {
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
