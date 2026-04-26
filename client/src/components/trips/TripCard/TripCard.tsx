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
  onViewParticipants?: (trip: Trip) => void;
  onViewDetails?: (trip: Trip) => void;
  canEdit?: boolean;
}

export const TripCard = ({ trip, onEdit, onDelete, onViewExpenses, onViewPacking, onViewTodos, onViewParticipants, onViewDetails, canEdit = false }: TripCardProps) => {
  const days = calculateDaysBetween(trip.dateFrom, trip.dateTo);
  const tags = parseTags(trip.tags || '');
  
  // Handle tripType as array or string
  const tripTypeArray = Array.isArray(trip.tripType) ? trip.tripType : [trip.tripType];
  const tripTypeLabel = tripTypeArray.map(type => tripTypeLabels[type as TripType] || type).join(', ');

  // Fix image path - remove /public/assets/ or /public/ prefix for Vite
  let imagePath = (trip.image || trip.picture || '');
  imagePath = imagePath.replace('/public/assets/', '/').replace('/public/', '/');

  const isGroupTrip = trip.isOwner === false || ((trip.participants?.length ?? 0) > 0);

  return (
    <div className="trip-card">
      <div
        className="trip-card__image"
        style={{ backgroundImage: `url(${imagePath})` }}
      >
        <span className="trip-card__type">{tripTypeLabel}</span>
        {isGroupTrip && (
          <span className="trip-card__group-badge">Group trip</span>
        )}
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
              <img src="/attach_money.png" alt="Expenses" />
              <span>Expenses</span>
            </button>
          )}
          {onViewPacking && (
            <button
              className="trip-card__button trip-card__button--packing"
              onClick={() => onViewPacking(trip)}
              title="Packing List"
            >
              <img src="/personal_bag.png" alt="Packing" />
              <span>Packing</span>
            </button>
          )}
          {onViewTodos && (
            <button
              className="trip-card__button trip-card__button--todos"
              onClick={() => onViewTodos(trip)}
              title="To-Do List"
            >
              <img src="/bookmark_check.png" alt="To-Do" />
              <span>To-Do</span>
            </button>
          )}
          {isGroupTrip && onViewParticipants && (
            <button
              className="trip-card__button trip-card__button--participants"
              onClick={() => onViewParticipants(trip)}
              title="Participants"
            >
              <img src="/group.svg" alt="Participants" />
              <span>Participants</span>
            </button>
          )}
          {canEdit && onEdit && trip.isOwner !== false && (
            <button
              className="trip-card__button trip-card__button--edit"
              onClick={() => onEdit(trip)}
              aria-label="Edit trip"
            >
              <img src="/edit.png" alt="Edit" />
            </button>
          )}
          {canEdit && onDelete && trip.isOwner !== false && (
            <button
              className="trip-card__button trip-card__button--delete"
              onClick={() => onDelete(trip.id)}
              aria-label="Delete trip"
            >
              <img src="/delete.png" alt="Delete" />
            </button>
          )}
          {trip.isOwner === false && onViewDetails && (
            <button
              className="trip-card__button trip-card__button--details"
              onClick={() => onViewDetails(trip)}
              title="View details"
            >
              <img src="/more_vert.png" alt="Details" />
              <span>Details</span>
            </button>
          )}
          {onDelete && trip.isOwner === false && (
            <button
              className="trip-card__button trip-card__button--delete"
              onClick={() => onDelete(trip.id)}
              aria-label="Leave trip"
              title="Leave trip"
            >
              <img src="/delete.png" alt="Leave" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
