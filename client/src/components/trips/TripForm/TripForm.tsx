import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { Dropdown } from '@components/common/Dropdown';
import { formatDateToInput } from '@utils/helpers';
import { tripTypeLabels, availablePictures } from '@utils/constants';
import type { Trip, CreateTripData, UpdateTripData } from '@types';
import type { PictureKey } from '@utils/constants';
import './TripForm.scss';

interface TripFormProps {
  initialData?: Trip;
  onSubmit: (data: CreateTripData | UpdateTripData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const TripForm = ({ initialData: trip, onSubmit, onCancel, loading = false }: TripFormProps) => {
  const isEditMode = !!trip;
  
  const [formData, setFormData] = useState({
    title: trip?.title || '',
    country: trip?.country || '',
    dateFrom: trip ? formatDateToInput(trip.dateFrom) : '',
    dateTo: trip ? formatDateToInput(trip.dateTo) : '',
    price: trip?.price?.toString() || '',
    tripType: trip?.tripType || '',
    picture: trip?.picture || '',
    description: trip?.description || '',
    tags: trip?.tags || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPictureModal, setShowPictureModal] = useState(false);

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
    
    if (!validateForm()) return;

    const tripData: CreateTripData | UpdateTripData = {
      title: formData.title.trim(),
      country: formData.country.trim(),
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      price: parseFloat(formData.price),
      tripType: formData.tripType,
      picture: formData.picture,
      description: formData.description.trim() || undefined,
      tags: formData.tags.trim() || undefined
    };

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
        placeholder="Summer Adventure"
        fullWidth
      />

      <Input
        label="Country *"
        value={formData.country}
        onChange={(e) => handleInputChange('country', e.target.value)}
        error={errors.country}
        placeholder="France"
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
        placeholder="1500"
        fullWidth
      />

      <Dropdown
        label="Trip Type *"
        options={tripTypeOptions}
        value={formData.tripType ? [formData.tripType as string] : []}
        onChange={(selected) => handleInputChange('tripType', selected[0] || '')}
        placeholder="Select trip type"
      />

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
          placeholder="Describe your trip..."
          rows={4}
        />
      </div>

      <Input
        label="Tags"
        value={formData.tags}
        onChange={(e) => handleInputChange('tags', e.target.value)}
        placeholder="beach, summer, family"
        fullWidth
      />

      <div className="trip-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Update Trip' : 'Create Trip'}
        </Button>
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
    </form>
  );
};
