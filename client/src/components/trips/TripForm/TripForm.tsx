import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { Dropdown } from '@components/common/Dropdown';
import { Modal } from '@components/common/Modal';
import { CurrencyConverter } from '@components/common/CurrencyConverter';
import { ParticipantSearch } from '@components/trips/ParticipantSearch/ParticipantSearch';
import { formatDateToInput } from '@utils/helpers';
import { tripTypeLabels, availablePictures } from '@utils/constants';
import type { Trip, CreateTripData, UpdateTripData } from '@types';
import type { PictureKey } from '@utils/constants';
import './TripForm.scss';

interface ParticipantUser {
  id: number;
  email: string;
  name: string;
  surname: string;
}

interface TripFormProps {
  initialData?: Trip;
  onSubmit: (data: CreateTripData | UpdateTripData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const TripForm = ({ initialData: trip, onSubmit, onCancel, loading = false }: TripFormProps) => {
  const isEditMode = !!trip;
  
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    dateFrom: '',
    dateTo: '',
    price: '',
    tripType: '',
    picture: '',
    description: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const [participants, setParticipants] = useState<ParticipantUser[]>([]);

  // Initialize form data when trip changes
  useEffect(() => {
    if (trip) {
      // Parse price from budget string (e.g., "$3,000" -> "3000")
      let priceValue = '';
      if (trip.budget) {
        priceValue = trip.budget.replace(/[^0-9.]/g, '');
      } else if (trip.price) {
        priceValue = trip.price.toString();
      }

      // Handle tripType as array or string
      let tripTypeValue = '';
      if (trip.tripType) {
        tripTypeValue = Array.isArray(trip.tripType) ? trip.tripType[0] : trip.tripType;
      }

      // Handle tags as array or string
      let tagsValue = '';
      if (trip.tags) {
        tagsValue = Array.isArray(trip.tags) ? trip.tags.join(', ') : trip.tags;
      }

      // Handle picture path - remove /public/assets/ or /public/ prefix
      let pictureValue = '';
      if (trip.image) {
        pictureValue = trip.image.replace(/^\/public\/assets\//, '/').replace(/^\/public\//, '/');
      } else if (trip.picture) {
        pictureValue = trip.picture.replace(/^\/public\/assets\//, '/').replace(/^\/public\//, '/');
      }

      setFormData({
        title: trip.title || '',
        country: trip.country || '',
        dateFrom: formatDateToInput(trip.dateFrom),
        dateTo: formatDateToInput(trip.dateTo),
        price: priceValue,
        tripType: tripTypeValue,
        picture: pictureValue,
        description: trip.description || '',
        tags: tagsValue
      });
    }
  }, [trip]);

  const tripTypeOptions = Object.entries(tripTypeLabels).map(([value, label]) => ({
    value,
    label
  }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.dateFrom) newErrors.dateFrom = 'Start date is required';
    if (!formData.dateTo) newErrors.dateTo = 'End date is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.tripType) newErrors.tripType = 'Trip type is required';
    if (!formData.picture) newErrors.picture = 'Picture is required';

    if (formData.dateFrom && formData.dateTo && formData.dateFrom > formData.dateTo) {
      newErrors.dateTo = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('TripForm: Validation failed');
      return;
    }

    const tripData: any = {
      title: formData.title.trim(),
      country: formData.country.trim(),
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      budget: `€${parseFloat(formData.price).toFixed(2)}`,
      tripType: formData.tripType,
      image: formData.picture,
      description: formData.description.trim() || undefined,
      tags: formData.tags ? formData.tags.trim() : undefined
    };

    // Include participant IDs if any
    if (participants.length > 0) {
      tripData.participants = participants.map(p => p.id);
    }

    // Add id for edit mode
    if (isEditMode && trip) {
      tripData.id = trip.id;
    }

    console.log('TripForm: Submitting data:', tripData);
    console.log('TripForm: isEditMode:', isEditMode);
    onSubmit(tripData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectPicture = (pictureKey: PictureKey) => {
    handleInputChange('picture', availablePictures[pictureKey].path);
    setShowPictureModal(false);
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <Input
        label="Title *"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
        fullWidth
      />

      <Input
        label="Country *"
        value={formData.country}
        onChange={(e) => handleInputChange('country', e.target.value)}
        error={errors.country}
        fullWidth
      />

      <div className="trip-form__row">
        <Input
          label="Date From *"
          type="date"
          value={formData.dateFrom}
          onChange={(e) => handleInputChange('dateFrom', e.target.value)}
          error={errors.dateFrom}
          fullWidth
        />

        <Input
          label="Date To *"
          type="date"
          value={formData.dateTo}
          onChange={(e) => handleInputChange('dateTo', e.target.value)}
          error={errors.dateTo}
          fullWidth
        />
      </div>

      <Input
        label="Price (EUR) *"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => handleInputChange('price', e.target.value)}
        error={errors.price}
        fullWidth
      />

      <Dropdown
        label="Trip Type *"
        options={tripTypeOptions}
        value={formData.tripType ? [formData.tripType as string] : []}
        onChange={(selected) => handleInputChange('tripType', selected[0] || '')}
        placeholder="Select trip type"
        error={errors.tripType}
      />

      <div className="trip-form__group-trip">
        <div className="trip-form__group-trip-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowParticipantSearch(true)}
          >
            Plan a group trip
          </Button>
          {participants.length > 0 && (
            <div className="trip-form__participants-tags">
              {participants.map(p => (
                <span key={p.id} className="trip-form__participant-tag">
                  {p.name} {p.surname}
                  <button
                    type="button"
                    className="trip-form__participant-tag-remove"
                    onClick={() => setParticipants(prev => prev.filter(x => x.id !== p.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="trip-form__picture">
        <label>Picture *</label>
        {formData.picture ? (
          <div className="trip-form__picture-preview">
            <img src={formData.picture} alt="Selected" />
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => setShowPictureModal(true)}
            >
              Change Picture
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPictureModal(true)}
            fullWidth
          >
            Choose Picture
          </Button>
        )}
        {errors.picture && <span className="trip-form__error">{errors.picture}</span>}
      </div>

      <div className="trip-form__field">
        <label>Description</label>
        <textarea
          className="trip-form__textarea"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
        />
      </div>

      <Input
        label="Tags"
        value={formData.tags}
        onChange={(e) => handleInputChange('tags', e.target.value)}
        fullWidth
      />

      <div className="trip-form__actions">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => setShowCurrencyConverter(true)}
        >
          Currency Converter
        </Button>
        <div className="trip-form__actions-right">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditMode ? 'Update Trip' : 'Create Trip'}
          </Button>
        </div>
      </div>

      {showPictureModal && (
        <div className="trip-form__picture-modal" onClick={() => setShowPictureModal(false)}>
          <div className="trip-form__picture-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Picture</h3>
            <div className="trip-form__picture-grid">
              {Object.entries(availablePictures).map(([key, { name, path }]) => (
                <div
                  key={key}
                  className="trip-form__picture-option"
                  onClick={() => selectPicture(key as PictureKey)}
                >
                  <img src={path} alt={name} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" onClick={() => setShowPictureModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCurrencyConverter}
        onClose={() => setShowCurrencyConverter(false)}
        title="Currency Converter"
        size="medium"
        closeOnOverlayClick={false}
      >
        <CurrencyConverter onClose={() => setShowCurrencyConverter(false)} />
      </Modal>

      {showParticipantSearch && (
        <ParticipantSearch
          participants={participants}
          onSave={(updated) => {
            setParticipants(updated);
            setShowParticipantSearch(false);
          }}
          onCancel={() => setShowParticipantSearch(false)}
        />
      )}
    </form>
  );
};
