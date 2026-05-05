import { useEffect, useState, useCallback } from 'react';
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
import { AccountSettings } from '@components/common/AccountSettings/AccountSettings';
import { ExpensesList } from '@components/trips/ExpensesList/ExpensesList';
import { PackingList } from '@components/trips/PackingList/PackingList';
import { TodoList } from '@components/trips/TodoList/TodoList';
import { ParticipantsList } from '@components/trips/ParticipantsList/ParticipantsList';
import { TransferOwnerDialog } from '@components/trips/TransferOwnerDialog/TransferOwnerDialog';
import { BudgetOverview } from '@components/trips/BudgetOverview/BudgetOverview';
import { getNotificationCount, getExpiringSoon } from '@services/account.service';
import api from '@services/api';
import '@styles/mainApp.scss';

const MainAppPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { trips, loading } = useSelector((state: RootState) => state.trips);

  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isTransferOwnerOpen, setIsTransferOwnerOpen] = useState(false);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isTodosModalOpen, setIsTodosModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState<TripFilters>({});
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(true); // Desktop always true, mobile controlled
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasExpiringDocuments, setHasExpiringDocuments] = useState(false);

  const fetchExpiringSoon = useCallback(async () => {
    try {
      const res = await getExpiringSoon();
      setHasExpiringDocuments(res.data?.hasExpiring ?? false);
    } catch {
      // non-critical
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotificationCount();
      if (res.data) {
        setNotificationCount(res.data.total);
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      // Fetch trips on mount
      dispatch(fetchTripsRequest());
      // Fetch notifications immediately and every 2 minutes
      fetchNotifications();
      fetchExpiringSoon();
      const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
    }, [isAuthenticated, navigate, dispatch, fetchNotifications, fetchExpiringSoon]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleSearch = (newFilters: TripFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAddTrip = (data: CreateTripData | UpdateTripData) => {
    dispatch(createTripRequest(data as CreateTripData));
    setIsAddTripModalOpen(false);
  };

  const handleEditTrip = (data: CreateTripData | UpdateTripData) => {
    console.log('MainAppPage: handleEditTrip called with data:', data);
    console.log('MainAppPage: selectedTrip:', selectedTrip);
    if (selectedTrip) {
      const updateData: any = { ...data, id: selectedTrip.id };
      console.log('MainAppPage: Dispatching updateTripRequest with:', updateData);
      dispatch(updateTripRequest(updateData));
      setIsEditTripModalOpen(false);
      setSelectedTrip(null);
    } else {
      console.log('MainAppPage: No selectedTrip!');
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    const trip = trips.find((t: Trip) => t.id === tripId);
    // If owner and there are accepted participants — show transfer dialog first
    if (trip && trip.isOwner !== false) {
      const hasAcceptedParticipants = trip.participants?.some((p) => p.status === 'ACCEPTED');
      if (hasAcceptedParticipants) {
        setTripToDelete(tripId);
        setIsTransferOwnerOpen(true);
        return;
      }
    }
    setTripToDelete(tripId);
    setIsDeleteConfirmOpen(true);
  };

  const handleTransferOwnerSuccess = () => {
    setIsTransferOwnerOpen(false);
    setTripToDelete(null);
    dispatch(fetchTripsRequest());
    setTimeout(fetchNotifications, 800);
  };

  const handleDeleteFromTransferDialog = () => {
    setIsTransferOwnerOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (tripToDelete) {
      dispatch(deleteTripRequest(tripToDelete));
      setIsDeleteConfirmOpen(false);
      setTripToDelete(null);
      // Refresh notification count after delete (owner notifies participants; participant notifies owner)
      setTimeout(fetchNotifications, 800);
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setIsTransferOwnerOpen(false);
    setTripToDelete(null);
  };

  const handleEditClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditTripModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditTripModalOpen(false);
    setSelectedTrip(null);
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsViewDetailsModalOpen(true);
  };

  const handleCloseViewDetails = () => {
    setIsViewDetailsModalOpen(false);
    setSelectedTrip(null);
  };

  const handleViewExpenses = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsExpensesModalOpen(true);
  };

  const handleViewPacking = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsPackingModalOpen(true);
  };

  const handleViewTodos = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTodosModalOpen(true);
  };

  const handleCloseExpenses = () => {
    setIsExpensesModalOpen(false);
    setSelectedTrip(null);
  };

  const handleClosePacking = () => {
    setIsPackingModalOpen(false);
    setSelectedTrip(null);
  };

  const handleCloseTodos = () => {
    setIsTodosModalOpen(false);
    setSelectedTrip(null);
  };

  const handleViewParticipants = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsParticipantsModalOpen(true);
  };

  const handleCloseParticipants = () => {
    setIsParticipantsModalOpen(false);
    setSelectedTrip(null);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedTrip) return;
    try {
      await api.delete(`/trips/${selectedTrip.id}/participants/${participantId}`);
      dispatch(fetchTripsRequest());
      // Update modal data immediately so list refreshes without closing
      setSelectedTrip((prev) =>
        prev
          ? { ...prev, participants: (prev.participants || []).filter((p) => p.id !== participantId) }
          : prev
      );
    } catch (error: any) {
      console.error('Failed to remove participant:', error);
    }
  };

  // Filter trips based on search criteria
  const filteredTrips = trips.filter((trip: Trip) => {
    if (!trip) return false;
    if (filters.title && trip.title && !trip.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.country && trip.country && !trip.country.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    if (filters.tripTypes && filters.tripTypes.length > 0) {
      const tripTypeArray = Array.isArray(trip.tripType) ? trip.tripType : [trip.tripType];
      if (!tripTypeArray.some(type => filters.tripTypes?.includes(type))) {
        return false;
      }
    }
    if (filters.tags && trip.tags) {
      const tagsString = Array.isArray(trip.tags) ? trip.tags.join(',') : trip.tags;
      if (!tagsString.toLowerCase().includes(filters.tags.toLowerCase())) {
        return false;
      }
    }
    if (filters.dateFrom && trip.dateFrom && trip.dateFrom < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && trip.dateTo && trip.dateTo > filters.dateTo) {
      return false;
    }
    if (filters.groupFilter) {
      const hasParticipants = (trip.participants?.length ?? 0) > 0;
      const isGroupTrip = hasParticipants || trip.isOwner === false;
      const isGroupOwner = hasParticipants && trip.isOwner !== false;
      if (filters.groupFilter === 'group_only' && !isGroupTrip) return false;
      if (filters.groupFilter === 'owner_only' && !isGroupOwner) return false;
      if (filters.groupFilter === 'solo_only' && isGroupTrip) return false;
    }
    const isArchival = trip.dateTo ? new Date(trip.dateTo) < new Date() : false;
    if (filters.archiveFilter === 'archive_only' && !isArchival) {
      return false;
    }
    if (filters.archiveFilter === 'no_archive' && isArchival) {
      return false;
    }
    return true;
  });

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN';
  const userInitials = user ? `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase() : '??';
  const isLeaveAction = tripToDelete ? trips.find((t: Trip) => t.id === tripToDelete)?.isOwner === false : false;

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
          <Header isMobile={true} />
        </div>

        {/* Desktop Header with Clock */}
        <div className="main-app__header">
          <div className="header-account">
            <div className="header-account__avatar">{userInitials}</div>
            <button
              className="header-account__settings-btn"
              onClick={() => setIsAccountSettingsOpen(true)}
            >
              ⚙ Settings
              {notificationCount > 0 && (
                <span className="header-account__badge">{notificationCount}</span>
              )}
              {hasExpiringDocuments && (
                <span className="header-account__badge header-account__badge--warn">!</span>
              )}
            </button>
          </div>
          <Header />
        </div>

        {/* Trips Section */}
        <div className="main-app__trips">
          <div className="main-app__trips-header">
            <h2 className="main-app__trips-title">
              {showBudget ? 'My Budget' : 'All trips:'}
            </h2>
            <div className="main-app__trips-actions">
              {isAdmin && (
                <button 
                  className="main-app__manage-users-btn" 
                  onClick={() => setIsUserManagementOpen(true)}
                >
                  Manage users
                </button>
              )}
              <button
                className="main-app__budget-btn"
                onClick={() => setShowBudget((v) => !v)}
                title={showBudget ? 'Open trips panel' : 'Open my budget summary'}
              >
                <span>{showBudget ? 'My Trips' : 'My Budget'}</span>
              </button>
              <button className="main-app__add-trip" onClick={() => setIsAddTripModalOpen(true)}>
                <span>Add trip</span>
                <span>+</span>
              </button>
            </div>
          </div>

          {showBudget ? (
            <BudgetOverview trips={filteredTrips} />
          ) : (
            <TripList
              trips={filteredTrips}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteTrip}
              onViewExpenses={handleViewExpenses}
              onViewPacking={handleViewPacking}
              onViewTodos={handleViewTodos}
              onViewParticipants={handleViewParticipants}
              onViewDetails={handleViewDetails}
              canEdit={true}
            />
          )}
        </div>
      </div>

      {/* Add Trip Modal */}
      <Modal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        title="Add trip"
        size="large"
        closeOnOverlayClick={false}
      >
        <TripForm onSubmit={handleAddTrip} onCancel={() => setIsAddTripModalOpen(false)} />
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={isEditTripModalOpen}
        onClose={handleCloseEditModal}
        title="Edit trip"
        size="large"
        closeOnOverlayClick={false}
      >
        {selectedTrip && (
          <TripForm
            initialData={selectedTrip}
            onSubmit={handleEditTrip}
            onCancel={handleCloseEditModal}
            currentUserId={user?.id}
          />
        )}
      </Modal>

      {/* View Details Modal (read-only for non-owner participants) */}
      <Modal
        isOpen={isViewDetailsModalOpen}
        onClose={handleCloseViewDetails}
        title={`Trip Details - ${selectedTrip?.title || ''}`}
        size="large"
        closeOnOverlayClick={true}
      >
        {selectedTrip && (
          <TripForm
            initialData={selectedTrip}
            onSubmit={() => {}}
            onCancel={handleCloseViewDetails}
            readOnly={true}
            currentUserId={user?.id}
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
          closeOnOverlayClick={false}
        >
          <UserManagement />
        </Modal>
      )}

      {/* Transfer Ownership Dialog */}
      {isTransferOwnerOpen && tripToDelete && (() => {
        const trip = trips.find((t: Trip) => t.id === tripToDelete);
        return trip ? (
          <TransferOwnerDialog
            trip={trip}
            onTransferred={handleTransferOwnerSuccess}
            onDeleteInstead={handleDeleteFromTransferDialog}
            onCancel={cancelDelete}
          />
        ) : null;
      })()}

      {/* Delete / Leave Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={cancelDelete}
        title={isLeaveAction ? 'Leave Trip' : 'Delete Trip'}
        size="small"
        closeOnOverlayClick={false}
      >
        <div style={{ padding: '1rem' }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#333' }}>
            {isLeaveAction
              ? "Are you sure you want to leave this trip? Your data will be removed and you won't be able to rejoin unless invited again."
              : 'Are you sure you want to delete this trip? This action cannot be undone.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={cancelDelete}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#333',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: '#dc3545',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {isLeaveAction ? 'Leave' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Expenses Modal */}
      <Modal
        isOpen={isExpensesModalOpen}
        onClose={handleCloseExpenses}
        title={`Expenses - ${selectedTrip?.title || ''}`}
        size="large"
        closeOnOverlayClick={false}
      >
        {selectedTrip && <ExpensesList tripId={selectedTrip.id} isGroupTrip={!!(selectedTrip.isOwner === false || selectedTrip.participants?.some(p => p.status === 'ACCEPTED'))} currentUserId={user?.id} />}
      </Modal>

      {/* Packing List Modal */}
      <Modal
        isOpen={isPackingModalOpen}
        onClose={handleClosePacking}
        title={`Packing List - ${selectedTrip?.title || ''}`}
        size="large"
        closeOnOverlayClick={false}
      >
        {selectedTrip && <PackingList tripId={selectedTrip.id} isGroupTrip={!!(selectedTrip.participants && selectedTrip.participants.length > 0)} currentUserId={user?.id} />}
      </Modal>

      {/* Todo List Modal */}
      <Modal
        isOpen={isTodosModalOpen}
        onClose={handleCloseTodos}
        title={`To-Do List - ${selectedTrip?.title || ''}`}
        size="large"
        closeOnOverlayClick={false}
      >
        {selectedTrip && <TodoList tripId={selectedTrip.id} isGroupTrip={!!(selectedTrip.participants && selectedTrip.participants.length > 0)} currentUserId={user?.id} />}
      </Modal>

      {/* Participants Modal */}
      <Modal
        isOpen={isParticipantsModalOpen}
        onClose={handleCloseParticipants}
        title={`Participants - ${selectedTrip?.title || ''}`}
        size="medium"
        closeOnOverlayClick={true}
      >
        {selectedTrip && selectedTrip.participants && (
          <ParticipantsList
            participants={selectedTrip.participants}
            tripTitle={selectedTrip.title}
            owner={selectedTrip.owner}
            isOwner={selectedTrip.isOwner}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        title="Account Settings"
        size="large"
        closeOnOverlayClick={true}
      >
        <AccountSettings
          notificationCount={notificationCount}
          onNotificationChange={fetchNotifications}
          onTripListChange={() => dispatch(fetchTripsRequest())}
          hasExpiringDocuments={hasExpiringDocuments}
          onExpiringDocumentsChange={setHasExpiringDocuments}
          onAccountDeleted={handleLogout}
        />
      </Modal>
    </div>
  );
};

export default MainAppPage;
