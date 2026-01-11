import { useState } from 'react';
import type { FormEvent } from 'react';
import { Dropdown } from '@components/common/Dropdown';
import { tripTypeLabels } from '@utils/constants';
import type { TripFilters } from '@types';
import './SearchPanel.scss';

interface SearchPanelProps {
  onSearch: (filters: TripFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export const SearchPanel = ({
  onSearch,
  onClearFilters,
  isOpen,
  onToggle,
  onLogout
}: SearchPanelProps) => {
  const [filters, setFilters] = useState<TripFilters>({});

  const tripTypeOptions = Object.entries(tripTypeLabels).map(([value, label]) => ({
    value,
    label
  }));

  const handleInputChange = (field: keyof TripFilters, value: string | string[]) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  return (
    <div className={`main-app__search-panel ${isOpen ? 'main-app__search-panel--open' : ''}`} id="searchPanel">
      <button className="main-app__button main-app__button--search main-app__close-search--mobile" onClick={onToggle}>
        Hide search panel
      </button>
      
      <img src="/logo.png" alt="Trip Planner Logo" className="main-app__logo" />
      
      <form className="main-app__form" id="searchForm" onSubmit={handleSubmit}>
        <div className="main-app__field">
          <label className="main-app__label">Date from</label>
          <input
            type="date"
            className="main-app__input"
            value={filters.dateFrom || ''}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
          />
        </div>
        
        <div className="main-app__field">
          <label className="main-app__label">Date to</label>
          <input
            type="date"
            className="main-app__input"
            value={filters.dateTo || ''}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
          />
        </div>
        
        <div className="main-app__field">
          <label className="main-app__label">Trip type</label>
          <Dropdown
            options={tripTypeOptions}
            value={filters.tripTypes || []}
            onChange={(selected) => handleInputChange('tripTypes', selected)}
            placeholder="Select trip types"
            multiple
          />
        </div>
        
        <div className="main-app__field">
          <label className="main-app__label">Title</label>
          <input
            type="text"
            className="main-app__input"
            placeholder="My trip"
            value={filters.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>
        
        <div className="main-app__field">
          <label className="main-app__label">Country</label>
          <input
            type="text"
            className="main-app__input"
            placeholder="Country"
            value={filters.country || ''}
            onChange={(e) => handleInputChange('country', e.target.value)}
          />
        </div>
        
        <div className="main-app__field">
          <label className="main-app__label">Tags</label>
          <input
            type="text"
            className="main-app__input"
            placeholder="Holiday"
            value={filters.tags || ''}
            onChange={(e) => handleInputChange('tags', e.target.value)}
          />
        </div>
        
        <div className="main-app__button-group">
          <button type="button" className="main-app__button main-app__button--clear" onClick={handleClear}>
            Clear filters
          </button>
          <button type="submit" className="main-app__button main-app__button--search">
            Search
          </button>
        </div>
      </form>
      
      {/* Logout form */}
      <div className="main-app__logout-container">
        <button type="button" className="main-app__logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
