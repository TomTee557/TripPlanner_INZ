import type { Trip } from '@types';
import { TripCard } from '../TripCard';
import './TripList.scss';

interface TripListProps {
  trips: Trip[];
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
  canEdit?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export const TripList = ({
  trips,
  onEdit,
  onDelete,
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
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};
