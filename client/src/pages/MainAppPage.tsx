import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTripsRequest, createTripRequest, updateTripRequest, deleteTripRequest } from '@store/slices/tripsSlice';
import { logout } from '@store/slices/authSlice';
import type { RootState } from '@store';
import type { Trip, CreateTripData, UpdateTripData, TripFilters } from '@types';
import { Header } from '@components/layout/Header/Header';
import { SearchPanel } from '@components/layout/SearchPanel/SearchPanel';
import { TripList } from '@components/trips/TripList/TripList';
import { TripForm } from '@components/trips/TripForm/TripForm';
import { UserManagement } from '@components/admin/UserManagement/UserManagement';
import { Modal } from '@components/common/Modal/Modal';
import '@styles/mainApp.scss';

const MainAppPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { trips, loading } = useSelector((state: RootState) => state.trips);

  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filters, setFilters] = useState<TripFilters>({});
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      // Fetch trips on mount
      dispatch(fetchTripsRequest());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleSearch = (newFilters: TripFilters) => {
    setFilters(newFilters);
    // In a real app, you'd dispatch a filtered fetch request
    // For now, we'll filter client-side in TripList component
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAddTrip = (data: CreateTripData | UpdateTripData) => {
    dispatch(createTripRequest(data as CreateTripData));
    setIsAddTripModalOpen(false);
  };

  const handleEditTrip = (data: CreateTripData | UpdateTripData) => {
    if (selectedTrip) {
      dispatch(updateTripRequest({ id: selectedTrip.id, ...(data as Partial<CreateTripData>) }));
      setIsEditTripModalOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleDeleteTrip = (tripId: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      dispatch(deleteTripRequest(tripId));
    }
  };

  const handleEditClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditTripModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditTripModalOpen(false);
    setSelectedTrip(null);
  };

  // Filter trips based on search criteria
  const filteredTrips = trips.filter((trip: Trip) => {
    if (filters.title && !trip.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.country && !trip.country.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    if (filters.tripTypes && filters.tripTypes.length > 0 && !filters.tripTypes.includes(trip.tripType)) {
      return false;
    }
    if (filters.tags && !trip.tags.toLowerCase().includes(filters.tags.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && trip.dateFrom < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && trip.dateTo > filters.dateTo) {
      return false;
    }
    return true;
  });

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="main-app">
      <SearchPanel
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        isOpen={isSearchPanelOpen}
        onToggle={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
        onLogout={handleLogout}
      />

      <div className="main-app__content">
        {/* Mobile logo */}
        <div className="main-app__mobile-logo-container">
          <img src="/logo-white.png" alt="Trip Planner Logo" className="main-app__mobile-logo" />
        </div>

        {/* Mobile header with search button and clock */}
        <div className="main-app__mobile-header">
          <button className="main-app__toggle-search" onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}>
            {isSearchPanelOpen ? 'Hide search panel' : 'Show search panel'}
          </button>
        </div>

        <Header userName={user?.name} onLogout={handleLogout} />

        {/* Trips Section */}
        <div className="main-app__trips">
          <div className="main-app__trips-header">
            <h2 className="main-app__trips-title">All trips:</h2>
            <div className="main-app__trips-actions">
              {isAdmin && (
                <button 
                  className="main-app__manage-users-btn" 
                  onClick={() => setIsUserManagementOpen(true)}
                >
                  Manage users
                </button>
              )}
              <button className="main-app__add-trip" onClick={() => setIsAddTripModalOpen(true)}>
                <span>Add trip</span>
                <span>+</span>
              </button>
            </div>
          </div>

          <TripList
            trips={filteredTrips}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteTrip}
            canEdit={true}
          />
        </div>
      </div>

      {/* Add Trip Modal */}
      <Modal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        title="Add trip"
        size="large"
      >
        <TripForm onSubmit={handleAddTrip} onCancel={() => setIsAddTripModalOpen(false)} />
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={isEditTripModalOpen}
        onClose={handleCloseEditModal}
        title="Edit trip"
        size="large"
      >
        {selectedTrip && (
          <TripForm
            initialData={selectedTrip}
            onSubmit={handleEditTrip}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      {/* User Management Modal (Admin only) */}
      {isAdmin && (
        <Modal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          title="User Management"
          size="fullscreen"
        >
          <UserManagement />
        </Modal>
      )}
    </div>
  );
};

export default MainAppPage;
