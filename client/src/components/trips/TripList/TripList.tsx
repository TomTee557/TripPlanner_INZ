import type { Trip } from '@types';
import { TripCard } from '../TripCard';
import './TripList.scss';

interface TripListProps {
  trips: Trip[];
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
  onViewExpenses?: (trip: Trip) => void;
  onViewPacking?: (trip: Trip) => void;
  onViewTodos?: (trip: Trip) => void;
  onViewParticipants?: (trip: Trip) => void;
  onViewDetails?: (trip: Trip) => void;
  canEdit?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export const TripList = ({
  trips,
  onEdit,
  onDelete,
  onViewExpenses,
  onViewPacking,
  onViewTodos,
  onViewParticipants,
  onViewDetails,
  canEdit = false,
  loading = false,
  emptyMessage = 'No trips found. Try adjusting your filters or create a new trip.'
}: TripListProps) => {
  if (loading) {
    return (
      <div className="trip-list trip-list--loading">
        <div className="trip-list__spinner" />
        <p>Loading trips...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="trip-list trip-list--empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="trip-list">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewExpenses={onViewExpenses}
          onViewPacking={onViewPacking}
          onViewTodos={onViewTodos}
          onViewParticipants={onViewParticipants}
          onViewDetails={onViewDetails}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};
