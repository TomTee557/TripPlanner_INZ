import type { Trip } from '@types';
import { formatDate, calculateDaysBetween, formatCurrency, parseTags } from '@utils/helpers';
import { tripTypeLabels } from '@utils/constants';
import type { TripType } from '@utils/constants';
import './TripCard.scss';

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
  onViewExpenses?: (trip: Trip) => void;
  onViewPacking?: (trip: Trip) => void;
  onViewTodos?: (trip: Trip) => void;
  canEdit?: boolean;
}

export const TripCard = ({ trip, onEdit, onDelete, onViewExpenses, onViewPacking, onViewTodos, canEdit = false }: TripCardProps) => {
  const days = calculateDaysBetween(trip.dateFrom, trip.dateTo);
  const tags = parseTags(trip.tags || '');
  
  // Handle tripType as array or string
  const tripTypeArray = Array.isArray(trip.tripType) ? trip.tripType : [trip.tripType];
  const tripTypeLabel = tripTypeArray.map(type => tripTypeLabels[type as TripType] || type).join(', ');

  // Fix image path - remove /public/assets/ or /public/ prefix for Vite
  let imagePath = (trip.image || trip.picture || '');
  imagePath = imagePath.replace('/public/assets/', '/').replace('/public/', '/');

  return (
    <div className="trip-card">
      <div
        className="trip-card__image"
        style={{ backgroundImage: `url(${imagePath})` }}
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
          <span className="trip-card__price">{trip.budget || (trip.price ? formatCurrency(trip.price) : '')}</span>
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
        
        <div className="trip-card__actions">
          {onViewExpenses && (
            <button
              className="trip-card__button trip-card__button--expenses"
              onClick={() => onViewExpenses(trip)}
              title="View Expenses"
            >
              💰 Expenses
            </button>
          )}
          {onViewPacking && (
            <button
              className="trip-card__button trip-card__button--packing"
              onClick={() => onViewPacking(trip)}
              title="Packing List"
            >
              🎒 Packing
            </button>
          )}
          {onViewTodos && (
            <button
              className="trip-card__button trip-card__button--todos"
              onClick={() => onViewTodos(trip)}
              title="To-Do List"
            >
              ✓ To-Do
            </button>
          )}
          {canEdit && onEdit && (
            <button
              className="trip-card__button trip-card__button--edit"
              onClick={() => onEdit(trip)}
              aria-label="Edit trip"
            >
              <img src="/edit.png" alt="Edit" />
            </button>
          )}
          {canEdit && onDelete && (
            <button
              className="trip-card__button trip-card__button--delete"
              onClick={() => onDelete(trip.id)}
              aria-label="Delete trip"
            >
              <img src="/delete.png" alt="Delete" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
