import type { Trip } from '@types';
import { formatDate, calculateDaysBetween, formatCurrency, parseTags } from '@utils/helpers';
import { tripTypeLabels } from '@utils/constants';
import type { TripType } from '@utils/constants';
import './TripCard.scss';

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: number) => void;
  canEdit?: boolean;
}

export const TripCard = ({ trip, onEdit, onDelete, canEdit = false }: TripCardProps) => {
  const days = calculateDaysBetween(trip.dateFrom, trip.dateTo);
  const tags = parseTags(trip.tags || '');
  const tripTypeLabel = tripTypeLabels[trip.tripType as TripType] || trip.tripType;

  return (
    <div className="trip-card">
      <div
        className="trip-card__image"
        style={{ backgroundImage: `url(${trip.picture})` }}
      >
        <span className="trip-card__type">{tripTypeLabel}</span>
      </div>
      
      <div className="trip-card__content">
        <h3 className="trip-card__title">{trip.title}</h3>
        <p className="trip-card__country">{trip.country}</p>
        
        <div className="trip-card__dates">
          <span>{formatDate(trip.dateFrom)}</span>
          <span>→</span>
          <span>{formatDate(trip.dateTo)}</span>
        </div>
        
        <div className="trip-card__info">
          <span className="trip-card__days">{days} days</span>
          <span className="trip-card__price">{formatCurrency(trip.price)}</span>
        </div>
        
        {trip.description && (
          <p className="trip-card__description">{trip.description}</p>
        )}
        
        {tags.length > 0 && (
          <div className="trip-card__tags">
            {tags.map((tag, index) => (
              <span key={index} className="trip-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {canEdit && (
          <div className="trip-card__actions">
            {onEdit && (
              <button
                className="trip-card__button trip-card__button--edit"
                onClick={() => onEdit(trip)}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="trip-card__button trip-card__button--delete"
                onClick={() => onDelete(trip.id)}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
