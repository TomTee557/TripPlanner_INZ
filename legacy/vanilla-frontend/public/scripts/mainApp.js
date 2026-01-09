import { currencies, currencyConverter } from '/public/scripts/infrastructure/currencyConverterLogic.js';
import { availablePictures, tripTypeLabels, PictureSelectionContext, BREAKPOINTS, UserRole } from '/public/scripts/consts.js';
import { inactivityTimer } from '/public/scripts/helpers/InactivityTimer.js';
import { loadTripsFromAPI } from '/public/scripts/helpers/loadTripsFromAPI.js';
import { AddTripLogic } from '/public/scripts/infrastructure/AddTripLogic.js';
import { UpdateTripLogic } from '/public/scripts/infrastructure/UpdateTripLogic.js';
import { DeleteTripLogic } from '/public/scripts/infrastructure/DeleteTripLogic.js';
import { UserManagementLogic } from '/public/scripts/infrastructure/UserManagementLogic.js';

// Data for trips - will be loaded from API
let fetchedTrips = [];

let selectedPicture = null;
let pictureSelectionContext = PictureSelectionContext.ADD;
let filteredTrips = [];

// User management data
let currentUsers = [];
let currentUserRole = null;
let userToChangePassword = null;
let pendingRoleChange = null;
let userToDelete = null;

// DOM elements - will be initialized after DOM is loaded
let searchPanel, showSearchBtn, closeSearchBtn, searchForm, clearFiltersBtn, tripsList, addTripBtn, manageUsersBtn;

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize DOM elements
  searchPanel = document.getElementById('searchPanel');
  showSearchBtn = document.getElementById('showSearchBtn');
  closeSearchBtn = document.getElementById('closeSearchBtn');
  searchForm = document.getElementById('searchForm');
  clearFiltersBtn = document.getElementById('clearFiltersBtn');
  tripsList = document.getElementById('tripsList');
  addTripBtn = document.getElementById('addTripBtn');
  manageUsersBtn = document.getElementById('manageUsersBtn');
  
  // Initialize user role and UI permissions
  // setted to window scope by php 
  currentUserRole = window.currentUserRole || 'USER';
  console.log('Window.currentUserRole from PHP:', window.currentUserRole);
  console.log('CurrentUserRole assigned:', currentUserRole);

  initializeUserRoleUI();
  
  initializeClock();
  
  // Load trips from API and render them
  const loadResult = await loadTripsFromAPI(null, showPopup);
  if (loadResult.success) {
    fetchedTrips = loadResult.trips;
    filteredTrips = [...fetchedTrips];
    renderTrips(); // Render after loading
  }
  
  setupEventListeners();
  
  // Show search panel on desktop by default, hide on mobile
  if (window.innerWidth > BREAKPOINTS.MOBILE) {
    searchPanel.classList.remove('main-app__search-panel--hidden');
    searchPanel.style.display = 'flex';
    if (showSearchBtn) {
      showSearchBtn.style.display = 'none';
    }
  } else {
    searchPanel.classList.add('main-app__search-panel--hidden');
    searchPanel.style.display = 'none';
    if (showSearchBtn) {
      showSearchBtn.style.display = 'block';
    }
  }
  // Initialize session management with inactivity timer
  inactivityTimer.onShowWarning = showPopup;
  inactivityTimer.init();
});

// Clock functionality
function initializeClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  const timeElement = document.getElementById('currentTime');
  const dateElement = document.getElementById('currentDate');
  const timeElementMobile = document.getElementById('currentTimeMobile');
  const dateElementMobile = document.getElementById('currentDateMobile');
  
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const dateString = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
  
  // Update desktop clock
  if (timeElement) timeElement.textContent = timeString;
  if (dateElement) dateElement.textContent = dateString;
  
  // Update mobile clock
  if (timeElementMobile) timeElementMobile.textContent = timeString;
  if (dateElementMobile) dateElementMobile.textContent = dateString;
}

function initializeUserRoleUI() {
  console.log('Initializing user role UI. Current role:', currentUserRole);
  
  // Show manage users button only for ADMIN users
  if (manageUsersBtn) {
    if (currentUserRole === UserRole.ADMIN) {
      manageUsersBtn.style.display = 'block';
      console.log('Admin role detected - showing manage users button');
    } else {
      manageUsersBtn.style.display = 'none';
      console.log('Non-admin role detected - hiding manage users button');
    }
  }
}

function setupEventListeners() {
  // Search panel toggle (mobile)
  showSearchBtn?.addEventListener('click', () => {
    searchPanel.classList.remove('main-app__search-panel--hidden');
    searchPanel.style.display = 'flex';
    showSearchBtn.style.display = 'none';
  });
  
  closeSearchBtn?.addEventListener('click', () => {
    searchPanel.classList.add('main-app__search-panel--hidden');
    searchPanel.style.display = 'none';
    if (window.innerWidth <= BREAKPOINTS.MOBILE) {
      showSearchBtn.style.display = 'block';
    }
  });
  
  // Search form
  searchForm?.addEventListener('submit', handleSearch);
  
  // Clear filters
  clearFiltersBtn?.addEventListener('click', clearFilters);
  
  // Add trip button
  addTripBtn?.addEventListener('click', handleAddTrip);
  
  // Manage users button (admin only)
  manageUsersBtn?.addEventListener('click', handleManageUsers);
  
  // Trip type dropdown
  setupTripTypeDropdown();
  
  // Currency converter
  setupCurrencyConverter();
  
  // Confirm delete trip popup
  setupConfirmDeleteTripListeners();
  
  // Event delegation for trip action buttons (prevents duplicate listeners)
  tripsList?.addEventListener('click', handleTripActions);
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
}

// Handle window resize
function handleResize() {
  if (window.innerWidth > BREAKPOINTS.MOBILE) {
    searchPanel.classList.remove('main-app__search-panel--hidden');
    searchPanel.style.display = 'flex';
    if (showSearchBtn) {
      showSearchBtn.style.display = 'none';
    }
  } else {
    searchPanel.classList.add('main-app__search-panel--hidden');
    searchPanel.style.display = 'none';
    if (showSearchBtn) {
      showSearchBtn.style.display = 'block';
    }
  }
}

// Setup trip type dropdown
function setupTripTypeDropdown() {
  const dropdown = document.getElementById('tripTypeDropdown');
  const toggle = document.getElementById('tripTypeToggle');
  const content = document.getElementById('tripTypeContent');
  const display = document.getElementById('tripTypeDisplay');
  
  // Toggle dropdown
  toggle?.addEventListener('click', () => {
    dropdown.classList.toggle('main-app__dropdown--open');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('main-app__dropdown--open');
    }
  });
  
  // Handle checkbox changes
  const checkboxes = content.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateTripTypeDisplay);
  });
  
  updateTripTypeDisplay();
}

// Update trip type display text
function updateTripTypeDisplay() {
  const checkboxes = document.querySelectorAll('#tripTypeContent input[type="checkbox"]:checked');
  const display = document.getElementById('tripTypeDisplay');
  
  if (checkboxes.length === 0) {
    display.textContent = 'Select trip types';
  } else if (checkboxes.length === 1) {
    display.textContent = checkboxes[0].nextElementSibling.textContent;
  } else {
    display.textContent = `${checkboxes.length} types selected`;
  }
}

// Handle trip actions using event delegation
function handleTripActions(e) {
  // Check if clicked element is a trip details button
  if (e.target.closest('.main-app__trip-details')) {
    const button = e.target.closest('.main-app__trip-details');
    const tripId = button.getAttribute('data-trip-id');
    if (tripId) {
      showTripDetails(tripId);
    }
    return;
  }
  
  // Check if clicked element is a trip edit button
  if (e.target.closest('.main-app__trip-edit')) {
    const button = e.target.closest('.main-app__trip-edit');
    const tripId = button.getAttribute('data-trip-id');
    if (tripId) {
      editTrip(tripId);
    }
    return;
  }
  
  // Check if clicked element is a trip delete button
  if (e.target.closest('.main-app__trip-delete')) {
    const button = e.target.closest('.main-app__trip-delete');
    const tripId = button.getAttribute('data-trip-id');
    if (tripId) {
      deleteTrip(tripId);
    }
    return;
  }
}

function handleSearch(e) {
  e.preventDefault();
  
  const formData = new FormData(searchForm);
  
  // Get selected trip types from checkboxes
  const selectedTripTypes = Array.from(
    document.querySelectorAll('#tripTypeContent input[type="checkbox"]:checked')
  ).map(checkbox => checkbox.value);
  
  const filters = {
    dateFrom: formData.get('dateFrom'),
    dateTo: formData.get('dateTo'),
    tripType: selectedTripTypes,
    title: formData.get('title')?.toLowerCase(),
    country: formData.get('country')?.toLowerCase(),
    tags: formData.get('tags')?.toLowerCase()
  };
  
  // Filter Trips
  filteredTrips = fetchedTrips.filter(trip => {
    if (filters.dateFrom && trip.dateFrom < filters.dateFrom) {
      return false;
    }
     
    if (filters.dateTo && trip.dateTo > filters.dateTo) {
      return false;
    }
  
    if (filters.tripType.length > 0) {
      const hasMatchingType = trip.tripType.some(type => 
        filters.tripType.includes(type)
      );
      if (!hasMatchingType) return false;
    }
    
    if (filters.title && !trip.title.toLowerCase().includes(filters.title)) {
      return false;
    }
    
    if (filters.country && !trip.country.toLowerCase().includes(filters.country)) {
      return false;
    }
    
    if (filters.tags) {
      const hasMatchingTag = trip.tags.some(tag => 
        tag.toLowerCase().includes(filters.tags)
      );
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
  
  renderTrips();
  
  // Hide search panel on mobile after search
  if (window.innerWidth <= BREAKPOINTS.MOBILE) {
    searchPanel.classList.add('main-app__search-panel--hidden');
    searchPanel.style.display = 'none';
    showSearchBtn.style.display = 'block';
  }
}


function clearFilters() {
  searchForm.reset();
  
  const checkboxes = document.querySelectorAll('#tripTypeContent input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  updateTripTypeDisplay();
}

function renderTrips(trips = filteredTrips) {
  if (!tripsList) return;
  
  if (trips.length === 0) {
    tripsList.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p style="color: #333; font-size: 1.2rem; font-weight: 500; margin: 0;">No trips found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  tripsList.innerHTML = trips.map(trip => `
    <div class="main-app__trip-card">
      <img src="${trip.image}" alt="${trip.title}" class="main-app__trip-image" />
      <div class="main-app__trip-content">
        <h3 class="main-app__trip-title">Title: ${trip.title}</h3>
        <p class="main-app__trip-date">Date: ${formatDate(trip.dateFrom)} - ${formatDate(trip.dateTo)}</p>
        <div class="main-app__trip-tags">
          <span style="font-weight: 600; margin-right: 0.5rem;">Tags:</span>
          ${trip.tags.map(tag => `
            <span class="main-app__trip-tag">${tag}</span>
          `).join('')}
        </div>
      </div>
      <div class="main-app__trip-actions">
        <button class="main-app__trip-details" data-trip-id="${trip.id}" title="Show details">
          <img src="/public/assets/search.png" alt="Details" class="main-app__trip-details-icon" />
        </button>
        <button class="main-app__trip-edit" data-trip-id="${trip.id}" title="Edit trip">
          <img src="/public/assets/edit.png" alt="Edit" class="main-app__trip-edit-icon" />
        </button>
        <button class="main-app__trip-delete" data-trip-id="${trip.id}" title="Delete trip">
          <img src="/public/assets/delete.png" alt="Delete" class="main-app__trip-delete-icon" />
        </button>
      </div>
    </div>
  `).join('');
  
  // Event listeners are now handled via event delegation in setupEventListeners()
  // No need to add listeners after each render
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function handleAddTrip() {
  showAddTripPopup();
}

function showAddTripPopup() {
  const overlay = document.getElementById('addTripPopupOverlay');
  const form = document.getElementById('addTripForm');
  
  // Reset form
  form.reset();
  selectedPicture = null;
  updatePicturePreview();
  
  // Show popup
  overlay.style.display = 'flex';
  
  // Setup event listeners for popup elements (needed each time popup opens)
  setupPopupEventListeners();
}


function setupPopupEventListeners() {
  // Close popup
  const closeBtn = document.getElementById('addTripPopupClose');
  const backBtn = document.getElementById('addTripBackBtn');
  const overlay = document.getElementById('addTripPopupOverlay');
  
  if (closeBtn) closeBtn.onclick = hideAddTripPopup;
  if (backBtn) backBtn.onclick = hideAddTripPopup;
  
  // Picture selection
  const choosePictureBtn = document.getElementById('choosePictureBtn');
  if (choosePictureBtn) {
    choosePictureBtn.onclick = showPictureSelectionPopup;
  }
  
  const form = document.getElementById('addTripForm');
  const submitBtn = document.getElementById('addTripSubmitBtn');
  
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      return false;
    };
  }
  
  if (submitBtn) {
    submitBtn.onclick = (e) => {
      e.preventDefault();
      handleAddTripSubmit();
    };
  }
}

function hideAddTripPopup() {
  document.getElementById('addTripPopupOverlay').style.display = 'none';
}

function showPictureSelectionPopup() {
  // Set context if not already set
  if (pictureSelectionContext !== PictureSelectionContext.EDIT) {
    pictureSelectionContext = PictureSelectionContext.ADD;
  }
  
  const overlay = document.getElementById('pictureSelectionPopupOverlay');
  const grid = document.getElementById('pictureSelectionGrid');
  
  // Clear grid
  grid.innerHTML = '';
  
  // Populate picture options
  Object.keys(availablePictures).forEach(key => {
    const picture = availablePictures[key];
    const option = document.createElement('div');
    option.className = 'picture-option';
    if (selectedPicture === key) {
      option.classList.add('selected');
    }
    
    option.innerHTML = `
      <img src="${picture.path}" alt="${picture.name}" class="picture-option__image" />
      <div class="picture-option__name">${picture.name}</div>
    `;
    
    option.onclick = () => selectPicture(key);
    grid.appendChild(option);
  });
  
  // Show popup
  overlay.style.display = 'flex';
  
  // Setup event listeners
  setupPictureSelectionEventListeners();
}

function setupPictureSelectionEventListeners() {
  const closeBtn = document.getElementById('pictureSelectionPopupClose');
  const backBtn = document.getElementById('pictureSelectionBackBtn');
  const overlay = document.getElementById('pictureSelectionPopupOverlay');
  
  closeBtn.onclick = hidePictureSelectionPopup;
  backBtn.onclick = hidePictureSelectionPopup;
}

function hidePictureSelectionPopup() {
  const overlay = document.getElementById('pictureSelectionPopupOverlay');
  overlay.style.display = 'none';
  overlay.classList.remove('popup-overlay--top-priority');
  // Reset context
  pictureSelectionContext = PictureSelectionContext.ADD;
}

function selectPicture(key) {
  selectedPicture = key;
  if (pictureSelectionContext === PictureSelectionContext.EDIT) {
    updateEditPicturePreview();
  } else {
    updatePicturePreview();
  }
  hidePictureSelectionPopup();
}

function updatePicturePreview() {
  const container = document.getElementById('previewContainer');
  
  if (selectedPicture && availablePictures[selectedPicture]) {
    const picture = availablePictures[selectedPicture];
    container.innerHTML = `
      <img src="${picture.path}" alt="${picture.name}" class="add-trip-form__preview-image" />
    `;
  } else {
    container.innerHTML = '<span class="add-trip-form__no-preview">No picture selected</span>';
  }
}

async function handleAddTripSubmit() {
  const form = document.getElementById('addTripForm');
  const submitBtn = document.getElementById('addTripSubmitBtn');
  
  if (submitBtn.disabled) {
    return;
  }
  
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Adding...';
  
  const formData = new FormData(form);
  
  // Get form values
  const dateFrom = document.getElementById('addTripDateFrom').value;
  const dateTo = document.getElementById('addTripDateTo').value;
  const tripType = document.getElementById('addTripType').value;
  const title = document.getElementById('addTripTitle').value;
  const country = document.getElementById('addTripCountry').value;
  const tags = document.getElementById('addTripTags').value;
  const budget = document.getElementById('addTripBudget').value;
  const description = document.getElementById('addTripDescription').value;

  const reEnableButton = () => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  };
  
  // Validate required fields
  if (!dateFrom || !dateTo || !tripType || !title || !country) {
    showPopup("Please fill in all required fields.", "Validation Error");
    reEnableButton();
    return;
  }
  
  // Validate date range
  if (new Date(dateFrom) >= new Date(dateTo)) {
    showPopup("Date from must be before date to.", "Validation Error");
    reEnableButton();
    return;
  }
  
  // Create new trip object (without ID - will be generated by database)
  const newTrip = {
    title: title,
    dateFrom: dateFrom,
    dateTo: dateTo,
    country: country,
    tripType: [tripType],
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    image: selectedPicture ? availablePictures[selectedPicture].path : '/public/assets/mountains.jpg',
    budget: budget || null,
    description: description || ''
  };
  
  try {
    // Add trip via API
    const result = await AddTripLogic.addTrip(newTrip);
    
    if (result.success) {
      // Add the new trip with ID from database to local array
      const addedTrip = { ...newTrip, id: result.tripId };
      fetchedTrips.push(addedTrip);
      
      // Update filtered trips and re-render
      filteredTrips = [...fetchedTrips];
      renderTrips();
      
      // Hide popup and show success message
      hideAddTripPopup();
      showPopup(`Trip "${title}" has been added successfully!`, "Success");
    } else {
      throw new Error(result.message || 'Failed to add trip');
    }
  } catch (error) {
    console.error('Failed to add trip:', error.message);
    showPopup(`Failed to add trip: ${error.message}`, "Error");
  }
  
  // Re-enable button
  reEnableButton();
}

function editTrip(tripId) {
  const trip = fetchedTrips.find(t => t.id === tripId);
  if (!trip) {
    showPopup("Trip not found", "Error");
    return;
  }
  
  showEditTripPopup(trip);
}

function showPopup(message, title = "Information") {
  const popupOverlay = document.getElementById('popupOverlay');
  const popupTitle = document.getElementById('popupTitle');
  const popupContent = document.getElementById('popupContent');
  const popupActions = document.getElementById('popupActions');
  const popupClose = document.getElementById('popupClose');
  const popupPrimaryBtn = document.getElementById('popupPrimaryBtn');

  // Set content
  popupTitle.textContent = title;
  popupContent.textContent = message;
  
  // Reset actions to just OK button
  popupActions.innerHTML = '<button class="popup__button popup__button--primary" id="popupPrimaryBtn">OK</button>';
  
  // Show popup
  popupOverlay.style.display = 'flex';

  // Add event listeners for closing
  const newPopupPrimaryBtn = document.getElementById('popupPrimaryBtn');
  const closePopup = () => {
    popupOverlay.style.display = 'none';
  };

  newPopupPrimaryBtn.onclick = closePopup;
  popupClose.onclick = closePopup;
}

function showTripDetails(tripId) {
  console.log('showTripDetails called with tripId:', tripId);
  const trip = fetchedTrips.find(t => t.id === tripId);
  if (!trip) {
    showPopup("Trip not found", "Error");
    return;
  }
  
  showTripDetailsPopup(trip);
}

function showTripDetailsPopup(trip) {
  const overlay = document.getElementById('tripDetailsPopupOverlay');
  const content = document.getElementById('tripDetailsContent');
  
  // Generate trip details HTML
  content.innerHTML = `
    <div class="trip-details">
      <div class="trip-details__image-container">
        <img src="${trip.image}" alt="${trip.title}" class="trip-details__image" />
      </div>
      <div class="trip-details__info">
        <div class="trip-details__field">
          <strong>Title:</strong> ${trip.title}
        </div>
        <div class="trip-details__field">
          <strong>Country:</strong> ${trip.country}
        </div>
        <div class="trip-details__field">
          <strong>Date From:</strong> ${formatDate(trip.dateFrom)}
        </div>
        <div class="trip-details__field">
          <strong>Date To:</strong> ${formatDate(trip.dateTo)}
        </div>
        <div class="trip-details__field">
          <strong>Trip Type:</strong> ${trip.tripType.map(type => tripTypeLabels[type] || type).join(', ')}
        </div>
        <div class="trip-details__field">
          <strong>Tags:</strong> ${trip.tags.length > 0 ? trip.tags.join(', ') : 'No tags'}
        </div>
        ${trip.budget ? `<div class="trip-details__field">
          <strong>Budget:</strong> ${trip.budget}
        </div>` : ''}
        ${trip.description ? `<div class="trip-details__field">
          <strong>Description:</strong> ${trip.description}
        </div>` : ''}
      </div>
    </div>
  `;
  
  // Show popup
  overlay.style.display = 'flex';
  
  // Setup event listeners
  setupTripDetailsEventListeners();
}

function setupTripDetailsEventListeners() {
  const closeBtn = document.getElementById('tripDetailsPopupClose');
  const backBtn = document.getElementById('tripDetailsBackBtn');
  const overlay = document.getElementById('tripDetailsPopupOverlay');
  
  if (closeBtn) closeBtn.onclick = hideTripDetailsPopup;
  if (backBtn) backBtn.onclick = hideTripDetailsPopup;
}

function hideTripDetailsPopup() {
  document.getElementById('tripDetailsPopupOverlay').style.display = 'none';
}

// Edit Trip Popup Functions
let currentEditTripId = null;

function showEditTripPopup(trip) {
  const overlay = document.getElementById('editTripPopupOverlay');
  const form = document.getElementById('editTripForm');
  
  // Store the trip ID for later use
  currentEditTripId = trip.id;
  
  // Fill form with trip data
  document.getElementById('editTripTitle').value = trip.title || '';
  document.getElementById('editTripDateFrom').value = trip.dateFrom || '';
  document.getElementById('editTripDateTo').value = trip.dateTo || '';
  document.getElementById('editTripCountry').value = trip.country || '';
  document.getElementById('editTripBudget').value = trip.budget || '';
  document.getElementById('editTripTags').value = Array.isArray(trip.tags) ? trip.tags.join(', ') : (trip.tags || '');
  document.getElementById('editTripDescription').value = trip.description || '';
  
  // Set trip type
  const tripTypeSelect = document.getElementById('editTripType');
  if (trip.tripType && Array.isArray(trip.tripType) && trip.tripType.length > 0) {
    tripTypeSelect.value = trip.tripType[0];
  } else {
    tripTypeSelect.value = '';
  }
  
  // Set picture
  selectedPicture = findPictureKeyByUrl(trip.image) || null;
  updateEditPicturePreview();
  
  // Show popup
  overlay.style.display = 'flex';
  
  // Setup event listeners for popup elements
  setupEditPopupEventListeners();
}

function setupEditPopupEventListeners() {
  // Close popup
  const closeBtn = document.getElementById('editTripPopupClose');
  const backBtn = document.getElementById('editTripBackBtn');
  const overlay = document.getElementById('editTripPopupOverlay');
  
  if (closeBtn) closeBtn.onclick = hideEditTripPopup;
  if (backBtn) backBtn.onclick = hideEditTripPopup;
  
  // Picture selection
  const choosePictureBtn = document.getElementById('editChoosePictureBtn');
  if (choosePictureBtn) {
    choosePictureBtn.onclick = showEditPictureSelectionPopup;
  }
  
  const form = document.getElementById('editTripForm');
  const saveBtn = document.getElementById('editTripSaveBtn');
  
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      return false;
    };
  }
  
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.preventDefault();
      handleEditTripSave();
    };
  }
}

function hideEditTripPopup() {
  document.getElementById('editTripPopupOverlay').style.display = 'none';
  currentEditTripId = null;
}

function updateEditPicturePreview() {
  const previewContainer = document.getElementById('editPreviewContainer');
  if (!previewContainer) return;
  
  if (selectedPicture && availablePictures[selectedPicture]) {
    const picture = availablePictures[selectedPicture];
    previewContainer.innerHTML = `<img src="${picture.path}" alt="${picture.name}" class="add-trip-form__preview-image" />`;
  } else {
    previewContainer.innerHTML = '<span class="add-trip-form__no-preview">No picture selected</span>';
  }
}

async function handleEditTripSave() {
  // Disable button to prevent double submission
  const saveBtn = document.getElementById('editTripSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  const reEnableButton = () => {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  };
  
  // Get form data
  const title = document.getElementById('editTripTitle').value.trim();
  const dateFrom = document.getElementById('editTripDateFrom').value;
  const dateTo = document.getElementById('editTripDateTo').value;
  const country = document.getElementById('editTripCountry').value.trim();
  const tripType = document.getElementById('editTripType').value;
  const tags = document.getElementById('editTripTags').value.trim();
  const budget = document.getElementById('editTripBudget').value.trim();
  const description = document.getElementById('editTripDescription').value.trim();
  
  // validation
  if (!title || !dateFrom || !dateTo || !country || !tripType) {
    showPopup("Please fill in all required fields (Title, Date from, Date to, Country, Trip type).", "Validation Error");
    reEnableButton();
    return;
  }
  
  if (new Date(dateFrom) >= new Date(dateTo)) {
    showPopup("End date must be after start date.", "Validation Error");
    reEnableButton();
    return;
  }
  
  // Find and update the trip
  const tripIndex = fetchedTrips.findIndex(t => t.id === currentEditTripId);
  if (tripIndex === -1) {
    showPopup("Trip not found.", "Error");
    reEnableButton();
    return;
  }
  
  // Update trip object
  const updatedTrip = {
    title: title,
    dateFrom: dateFrom,
    dateTo: dateTo,
    country: country,
    tripType: [tripType],
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    budget: budget,
    description: description,
    image: selectedPicture ? availablePictures[selectedPicture].path : '/public/assets/mountains.jpg'
  };
  
  try {
    // Update trip via API
    const result = await UpdateTripLogic.updateTrip(currentEditTripId, updatedTrip);
    
    if (result.success) {
      // Update local array
      fetchedTrips[tripIndex] = { ...updatedTrip, id: currentEditTripId };
      
      // Update filtered trips and re-render
      filteredTrips = [...fetchedTrips];
      renderTrips();
      
      // Hide popup and show success message
      hideEditTripPopup();
      showPopup(`Trip "${title}" has been updated successfully!`, "Success");
    } else {
      throw new Error(result.message || 'Failed to update trip');
    }
  } catch (error) {
    console.error('Failed to update trip:', error.message);
    showPopup(`Failed to update trip: ${error.message}`, "Error");
  }
  
  // Re-enable button
  reEnableButton();
}

// Helper functions for picture handling
function findPictureKeyByUrl(url) {
  for (const [key, picture] of Object.entries(availablePictures)) {
    if (picture.path === url) {
      return key;
    }
  }
  return null;
}

function showEditPictureSelectionPopup() {
  pictureSelectionContext = PictureSelectionContext.EDIT;
  showPictureSelectionPopup();
}

// Currency Converter Functions
function setupCurrencyConverter() {
  // Initialize currency dropdowns
  initializeCurrencyDropdowns();
  
  // Setup currency converter buttons
  const currencyConverterBtns = document.querySelectorAll('.popup__button-currency-converter');
  
  currencyConverterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showCurrencyConverterPopup();
    });
  });
  
  // Setup other currency converter popup event listeners
  const currencyConverterPopup = document.getElementById('currencyConverterPopupOverlay');
  const currencyConverterCloseBtn = document.getElementById('currencyConverterCloseBtn');
  const currencyConverterBackBtn = document.getElementById('currencyConverterBackBtn');
  const currencyConverterConvertBtn = document.getElementById('currencyConverterConvertBtn');
  
  // Close popup
  currencyConverterCloseBtn?.addEventListener('click', closeCurrencyConverterPopup);
  currencyConverterBackBtn?.addEventListener('click', closeCurrencyConverterPopup);
  
  // Convert button
  currencyConverterConvertBtn?.addEventListener('click', handleCurrencyConversion);
}

function initializeCurrencyDropdowns() {
  const fromDropdown = document.getElementById('fromCurrencyDropdown');
  const toDropdown = document.getElementById('toCurrencyDropdown');
  
  setupCurrencyDropdown('from', fromDropdown);
  setupCurrencyDropdown('to', toDropdown);
  
  // Set default currencies
  setCurrencyValue('from', 'USD');
  setCurrencyValue('to', 'PLN');
}

function setupCurrencyDropdown(type, dropdown) {
  if (!dropdown) return;
  
  const searchInput = dropdown.querySelector(`#${type}CurrencySearch`);
  const dropdownContent = dropdown.querySelector(`#${type}CurrencyContent`);
  const arrow = dropdown.querySelector('.currency-converter__dropdown-arrow');
  
  // Populate options
  populateCurrencyOptions(dropdownContent, type);
  
  // Toggle dropdown on search input click
  searchInput?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCurrencyDropdown(dropdown, true);
  });
  
  // Toggle dropdown on arrow click
  arrow?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCurrencyDropdown(dropdown);
  });
  
  // Search functionality
  searchInput?.addEventListener('input', (e) => {
    filterCurrencyOptions(dropdownContent, e.target.value);
    // Open dropdown when user types
    if (e.target.value.trim() && !dropdown.classList.contains('currency-converter__dropdown--open')) {
      toggleCurrencyDropdown(dropdown, true);
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      toggleCurrencyDropdown(dropdown, false);
    }
  });
}

function populateCurrencyOptions(container, type) {
  if (!container) return;
  
  container.innerHTML = '';
  
  currencies.forEach(currency => {
    const option = document.createElement('div');
    option.className = 'currency-converter__option';
    option.dataset.code = currency.code;
    option.innerHTML = `
      <span class="currency-converter__flag">${currency.flag}</span>
      <span class="currency-converter__code">${currency.code}</span>
      <span class="currency-converter__name">${currency.name}</span>
    `;
    
    option.addEventListener('click', () => {
      selectCurrency(type, currency);
      toggleCurrencyDropdown(container.closest('.currency-converter__dropdown'), false);
    });
    
    container.appendChild(option);
  });
}

function toggleCurrencyDropdown(dropdown, forceOpen = null) {
  const isOpen = dropdown.classList.contains('currency-converter__dropdown--open');
  const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;
  
  if (shouldOpen) {
    dropdown.classList.add('currency-converter__dropdown--open');
  } else {
    dropdown.classList.remove('currency-converter__dropdown--open');
  }
}

function filterCurrencyOptions(container, searchTerm) {
  if (!container) return;
  
  const options = container.querySelectorAll('.currency-converter__option');
  const term = searchTerm.toLowerCase();
  
  options.forEach(option => {
    const code = option.dataset.code.toLowerCase();
    const name = option.querySelector('.currency-converter__name').textContent.toLowerCase();
    const matches = code.includes(term) || name.includes(term);
    
    option.style.display = matches ? 'flex' : 'none';
  });
}

function selectCurrency(type, currency) {
  const searchInput = document.getElementById(`${type}CurrencySearch`);
  const hiddenInput = document.getElementById(`${type}CurrencyValue`);
  
  if (searchInput && hiddenInput) {
    searchInput.value = `${currency.flag} ${currency.code} - ${currency.name}`;
    hiddenInput.value = currency.code;
    
    // Update selected option styling
    updateSelectedCurrencyOption(type, currency.code);
  }
}

function setCurrencyValue(type, currencyCode) {
  const currency = currencies.find(c => c.code === currencyCode);
  if (currency) {
    selectCurrency(type, currency);
  }
}

function updateSelectedCurrencyOption(type, selectedCode) {
  const container = document.getElementById(`${type}CurrencyContent`);
  if (!container) return;
  
  const options = container.querySelectorAll('.currency-converter__option');
  options.forEach(option => {
    option.classList.remove('currency-converter__option--selected');
    if (option.dataset.code === selectedCode) {
      option.classList.add('currency-converter__option--selected');
    }
  });
}

async function handleCurrencyConversion() {
  const fromCurrency = document.getElementById('fromCurrencyValue').value;
  const toCurrency = document.getElementById('toCurrencyValue').value;
  const value = parseFloat(document.getElementById('currencyValue').value);
  const resultInput = document.getElementById('currencyResult');
  const rateDisplay = document.getElementById('currencyRate');
  const loadingDisplay = document.getElementById('currencyLoading');
  const convertBtn = document.getElementById('currencyConverterConvertBtn');
  
  // Validation
  if (!fromCurrency || !toCurrency) {
    showPopup("Please select both currencies", "Error");
    return;
  }
  
  if (!value || value <= 0) {
    showPopup("Please enter a valid amount", "Error");
    return;
  }
  
  // Show loading
  loadingDisplay.style.display = 'flex';
  convertBtn.disabled = true;
  resultInput.value = '';
  rateDisplay.classList.remove('currency-converter__rate--visible');
  
  try {
    const result = await currencyConverter.convert(fromCurrency, toCurrency, value);
    
    // Display result
    resultInput.value = `${result.convertedAmount} ${toCurrency}`;
    
    // Display exchange rate
    rateDisplay.innerHTML = `
      <div>1 ${fromCurrency} = <span class="currency-converter__rate-value">${result.exchangeRate} ${toCurrency}</span></div>
      <div style="font-size: 0.8rem; margin-top: 0.25rem;">Last updated: ${result.lastUpdate.toLocaleString()}</div>
    `;
    rateDisplay.classList.add('currency-converter__rate--visible');
    
  } catch (error) {
    showPopup(error.message, "Conversion Error");
    resultInput.value = '';
  } finally {
    loadingDisplay.style.display = 'none';
    convertBtn.disabled = false;
  }
}

function showCurrencyConverterPopup() {
  const overlay = document.getElementById('currencyConverterPopupOverlay');
  
  if (overlay) {
    // Remove hidden class
    overlay.classList.remove('popup-overlay--hidden');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('currencyValue').value = '';
    document.getElementById('currencyResult').value = '';
    document.getElementById('currencyRate').classList.remove('currency-converter__rate--visible');
    
    // Focus on value input
    setTimeout(() => {
      document.getElementById('currencyValue')?.focus();
    }, 100);
  }
}

function closeCurrencyConverterPopup() {
  const overlay = document.getElementById('currencyConverterPopupOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.classList.add('popup-overlay--hidden');
    document.body.style.overflow = '';
    
    // Close any open dropdowns
    document.querySelectorAll('.currency-converter__dropdown').forEach(dropdown => {
      dropdown.classList.remove('currency-converter__dropdown--open');
    });
  }
}

// Delete trip function
async function deleteTrip(tripId) {
  const trip = fetchedTrips.find(t => t.id === tripId);
  if (!trip) {
    showPopup("Trip not found", "Error");
    return;
  }
  
  // Show custom confirmation popup
  showConfirmDeleteTripPopup(trip.title, tripId);
}

// Show confirm delete trip popup
function showConfirmDeleteTripPopup(tripTitle, tripId) {
  const popup = document.getElementById('confirmDeleteTripPopupOverlay');
  const message = document.getElementById('confirmDeleteTripMessage');
  
  message.textContent = `Are you sure you want to delete the trip "${tripTitle}"?`;
  popup.style.display = 'flex';
  
  // Store tripId for later use
  popup.dataset.tripId = tripId;
}

// Hide confirm delete trip popup
function hideConfirmDeleteTripPopup() {
  const popup = document.getElementById('confirmDeleteTripPopupOverlay');
  popup.style.display = 'none';
  delete popup.dataset.tripId;
}

// Setup confirm delete trip listeners
function setupConfirmDeleteTripListeners() {
  const popup = document.getElementById('confirmDeleteTripPopupOverlay');
  const closeBtn = document.getElementById('confirmDeleteTripPopupClose');
  const cancelBtn = document.getElementById('confirmDeleteTripCancel');
  const confirmBtn = document.getElementById('confirmDeleteTripConfirm');
  
  closeBtn.addEventListener('click', hideConfirmDeleteTripPopup);
  cancelBtn.addEventListener('click', hideConfirmDeleteTripPopup);
  
  confirmBtn.addEventListener('click', async () => {
    const tripId = popup.dataset.tripId;
    if (tripId) {
      await executeDeleteTrip(tripId);
      hideConfirmDeleteTripPopup();
    }
  });
  
  // Close on overlay click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideConfirmDeleteTripPopup();
    }
  });
}

// Execute the actual trip deletion
async function executeDeleteTrip(tripId) {
  const trip = fetchedTrips.find(t => t.id === tripId);
  if (!trip) {
    showPopup("Trip not found", "Error");
    return;
  }
  
  try {
    // Delete trip via API
    const result = await DeleteTripLogic.deleteTrip(tripId);
    
    if (result.success) {
      // Remove trip from local array
      const tripIndex = fetchedTrips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        fetchedTrips.splice(tripIndex, 1);
      }
      
      // Update filtered trips and re-render
      filteredTrips = [...fetchedTrips];
      renderTrips();
      
      showPopup(`Trip "${trip.title}" has been deleted successfully!`, "Success");
    } else {
      throw new Error(result.message || 'Failed to delete trip');
    }
  } catch (error) {
    console.error('Failed to delete trip:', error.message);
    showPopup(`Failed to delete trip: ${error.message}`, "Error");
  }
}

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

// Handle manage users button click
async function handleManageUsers() {
  console.log('Handle manage users clicked');
  
  if (currentUserRole !== UserRole.ADMIN) {
    showPopup('Access denied. Admin privileges required.', 'Error');
    return;
  }
  
  try {
    // Load users from API
    const result = await UserManagementLogic.getUsers();
    
    if (result.success) {
      currentUsers = result.users;
      renderUsersList();
      showManageUsersPopup();
    } else {
      throw new Error(result.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('Failed to load users:', error.message);
    showPopup(`Failed to load users: ${error.message}`, 'Error');
  }
}

// Show manage users popup
function showManageUsersPopup() {
  const popup = document.getElementById('manageUsersPopupOverlay');
  if (popup) {
    popup.style.display = 'flex';
    popup.classList.add('fade-in');
  }
}

// Hide manage users popup
function hideManageUsersPopup() {
  const popup = document.getElementById('manageUsersPopupOverlay');
  if (popup) {
    popup.classList.remove('fade-in');
    popup.style.display = 'none';
  }
}

// Render users list in the popup
function renderUsersList() {
  const usersList = document.getElementById('usersList');
  if (!usersList || !currentUsers.length) {
    if (usersList) {
      usersList.innerHTML = '<p class="no-users">No users found.</p>';
    }
    return;
  }
  
  usersList.innerHTML = currentUsers.map(user => `
    <div class="user-item" data-user-id="${user.id}">
      <div class="user-info">
        <div class="user-info__field">
          <span class="user-info__label">Email:</span>
          <span class="user-info__value">${user.email}</span>
        </div>
        <div class="user-info__field">
          <span class="user-info__label">Name:</span>
          <span class="user-info__value">${user.name}</span>
        </div>
        <div class="user-info__field">
          <span class="user-info__label">Surname:</span>
          <span class="user-info__value">${user.surname}</span>
        </div>
        <div class="user-info__field">
          <span class="user-info__label">Role:</span>
          <span class="user-info__value user-role ${user.role.toLowerCase()}">${user.role}</span>
        </div>
        <div class="user-info__field">
          <span class="user-info__label">ID:</span>
          <span class="user-info__value">${user.id}</span>
        </div>
      </div>
      <div class="user-actions">
        <button class="popup__button popup__button--secondary btn-change-role" data-user-id="${user.id}" data-current-role="${user.role}" data-user-email="${user.email}">
          Change Role
        </button>
        <button class="popup__button popup__button--secondary btn-change-password" data-user-id="${user.id}" data-user-email="${user.email}">
          Change Password
        </button>
        <button class="popup__button popup__button--danger btn-delete-user" data-user-id="${user.id}" data-user-email="${user.email}" data-user-name="${user.name} ${user.surname}">
          Delete User
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners for user action buttons
  setupUserActionListeners();
}

// Setup event listeners for user management actions
function setupUserActionListeners() {
  // Close popup button
  const closeBtn = document.querySelector('#manageUsersPopupOverlay .popup__close');
  const backBtn = document.getElementById('manageUsersBackBtn');
  closeBtn?.addEventListener('click', hideManageUsersPopup);
  backBtn?.addEventListener('click', hideManageUsersPopup);
  
  // Change role buttons
  document.querySelectorAll('.btn-change-role').forEach(btn => {
    btn.addEventListener('click', handleChangeUserRole);
  });
  
  // Change password buttons
  document.querySelectorAll('.btn-change-password').forEach(btn => {
    btn.addEventListener('click', handleChangeUserPassword);
  });
  
  // Delete user buttons
  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', handleDeleteUser);
  });
  
  // Close popup when clicking outside
  const popup = document.getElementById('manageUsersPopupOverlay');
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideManageUsersPopup();
    }
  });
}

// Handle change user role
async function handleChangeUserRole(event) {
  const userId = event.target.dataset.userId;
  const currentRole = event.target.dataset.currentRole;
  const userEmail = event.target.dataset.userEmail;
  const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
  
  // Store pending role change data
  pendingRoleChange = {
    userId,
    currentRole,
    newRole,
    userEmail
  };
  
  // Show custom confirmation popup
  showConfirmRoleChangePopup();
}

// Show confirm role change popup
function showConfirmRoleChangePopup() {
  if (!pendingRoleChange) return;
  
  const popup = document.getElementById('confirmRoleChangePopupOverlay');
  const messageEl = document.getElementById('confirmRoleChangeMessage');
  
  if (popup && messageEl) {
    messageEl.textContent = `Change user "${pendingRoleChange.userEmail}" role from ${pendingRoleChange.currentRole} to ${pendingRoleChange.newRole}?`;
    popup.style.display = 'flex';
    popup.classList.add('fade-in');
    
    // Setup event listeners
    setupConfirmRoleChangeListeners();
  }
}

// Hide confirm role change popup
function hideConfirmRoleChangePopup() {
  const popup = document.getElementById('confirmRoleChangePopupOverlay');
  if (popup) {
    popup.classList.remove('fade-in');
    popup.style.display = 'none';
  }
  pendingRoleChange = null;
}

// Setup confirm role change listeners
function setupConfirmRoleChangeListeners() {
  const closeBtn = document.querySelector('#confirmRoleChangePopupOverlay .popup__close');
  const cancelBtn = document.getElementById('confirmRoleChangeCancel');
  const confirmBtn = document.getElementById('confirmRoleChangeConfirm');
  const popup = document.getElementById('confirmRoleChangePopupOverlay');
  
  // Remove existing listeners
  closeBtn?.removeEventListener('click', hideConfirmRoleChangePopup);
  cancelBtn?.removeEventListener('click', hideConfirmRoleChangePopup);
  confirmBtn?.removeEventListener('click', executeRoleChange);
  
  // Add new listeners
  closeBtn?.addEventListener('click', hideConfirmRoleChangePopup);
  cancelBtn?.addEventListener('click', hideConfirmRoleChangePopup);
  confirmBtn?.addEventListener('click', executeRoleChange);
  
  // Close popup when clicking outside
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideConfirmRoleChangePopup();
    }
  });
}

// Execute the role change
async function executeRoleChange() {
  if (!pendingRoleChange) return;
  
  // Store values before hiding popup (which nullifies pendingRoleChange)
  const { userId, newRole } = pendingRoleChange;
  
  try {
    const result = await UserManagementLogic.updateUserRole(userId, newRole);
    
    if (result.success) {
      // Update local user data
      const userIndex = currentUsers.findIndex(u => u.id == userId);
      if (userIndex !== -1) {
        currentUsers[userIndex].role = newRole;
      }
      
      // Hide confirm popup
      hideConfirmRoleChangePopup();
      
      // Re-render users list
      renderUsersList();
      showPopup(`User role updated to ${newRole} successfully!`, 'Success');
    } else {
      throw new Error(result.message || 'Failed to update user role');
    }
  } catch (error) {
    console.error('Failed to update user role:', error.message);
    showPopup(`Failed to update user role: ${error.message}`, 'Error');
    hideConfirmRoleChangePopup();
  }
}

// Handle change user password
function handleChangeUserPassword(event) {
  const userId = event.target.dataset.userId;
  const userEmail = event.target.dataset.userEmail;
  
  userToChangePassword = { id: userId, email: userEmail };
  showChangePasswordPopup();
}

// Show change password popup
function showChangePasswordPopup() {
  const popup = document.getElementById('changePasswordPopupOverlay');
  const emailDiv = document.getElementById('changePasswordUserEmail');
  
  if (popup && emailDiv && userToChangePassword) {
    emailDiv.textContent = userToChangePassword.email;
    popup.style.display = 'flex';
    popup.classList.add('fade-in');
    
    // Setup change password form listener
    setupChangePasswordForm();
  }
}

// Hide change password popup
function hideChangePasswordPopup() {
  const popup = document.getElementById('changePasswordPopupOverlay');
  if (popup) {
    popup.classList.remove('fade-in');
    popup.style.display = 'none';
  }
  
  // Reset form
  const form = document.getElementById('changePasswordForm');
  if (form) {
    form.reset();
  }
  
  userToChangePassword = null;
}

// Setup change password form
function setupChangePasswordForm() {
  const form = document.getElementById('changePasswordForm');
  const closeBtn = document.querySelector('#changePasswordPopupOverlay .popup__close');
  const cancelBtn = document.getElementById('changePasswordBackBtn');
  const popup = document.getElementById('changePasswordPopupOverlay');
  
  // Remove existing listeners to prevent duplicates
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Add form submit listener
  newForm.addEventListener('submit', handleChangePasswordSubmit);
  
  // Add close button listener (X button)
  closeBtn?.addEventListener('click', hideChangePasswordPopup);
  
  // Add cancel button listener
  cancelBtn?.addEventListener('click', hideChangePasswordPopup);
  
  // Close popup when clicking outside
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideChangePasswordPopup();
    }
  });
}

// Handle change password form submit
async function handleChangePasswordSubmit(event) {
  event.preventDefault();
  
  if (!userToChangePassword) {
    showPopup('No user selected for password change', 'Error');
    return;
  }
  
  const formData = new FormData(event.target);
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');
  
  // Validate passwords
  if (!newPassword || !confirmPassword) {
    showPopup('Please fill in all password fields', 'Error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showPopup('Passwords do not match', 'Error');
    return;
  }
  
  if (newPassword.length < 6) {
    showPopup('Password must be at least 6 characters long', 'Error');
    return;
  }
  
  try {
    // Store user info before hiding popup
    const userId = userToChangePassword.id;
    const userEmail = userToChangePassword.email;
    
    const result = await UserManagementLogic.updateUserPassword(userId, newPassword);
    
    if (result.success) {
      hideChangePasswordPopup();
      showPopup(`Password updated successfully for ${userEmail}!`, 'Success');
    } else {
      throw new Error(result.message || 'Failed to update password');
    }
  } catch (error) {
    console.error('Failed to update password:', error.message);
    showPopup(`Failed to update password: ${error.message}`, 'Error');
  }
}

// Handle delete user button click
function handleDeleteUser(event) {
  const userId = event.target.dataset.userId;
  const userEmail = event.target.dataset.userEmail;
  const userName = event.target.dataset.userName;
  
  // Store user data for deletion
  userToDelete = {
    id: userId,
    email: userEmail,
    name: userName
  };
  
  // Show confirmation popup
  showConfirmDeleteUserPopup(userEmail, userName);
}

// Show confirm delete user popup
function showConfirmDeleteUserPopup(userEmail, userName) {
  const popup = document.getElementById('confirmDeleteUserPopupOverlay');
  const message = document.getElementById('confirmDeleteUserMessage');
  
  if (popup && message) {
    message.textContent = `Are you sure you want to delete ${userName} (${userEmail})?`;
    popup.style.display = 'flex';
    popup.classList.add('fade-in');
  }
  
  // Setup event listeners for this popup
  setupDeleteUserPopupListeners();
}

// Hide confirm delete user popup
function hideConfirmDeleteUserPopup() {
  const popup = document.getElementById('confirmDeleteUserPopupOverlay');
  if (popup) {
    popup.classList.remove('fade-in');
    popup.style.display = 'none';
  }
  
  // Clear user data
  userToDelete = null;
}

// Setup event listeners for delete user popup
function setupDeleteUserPopupListeners() {
  const closeBtn = document.querySelector('#confirmDeleteUserPopupOverlay .popup__close');
  const cancelBtn = document.getElementById('confirmDeleteUserCancel');
  const confirmBtn = document.getElementById('confirmDeleteUserConfirm');
  
  // Remove existing listeners to prevent duplicates
  closeBtn?.removeEventListener('click', hideConfirmDeleteUserPopup);
  cancelBtn?.removeEventListener('click', hideConfirmDeleteUserPopup);
  confirmBtn?.removeEventListener('click', executeDeleteUser);
  
  // Add fresh listeners
  closeBtn?.addEventListener('click', hideConfirmDeleteUserPopup);
  cancelBtn?.addEventListener('click', hideConfirmDeleteUserPopup);
  confirmBtn?.addEventListener('click', executeDeleteUser);
  
  // Close popup when clicking outside
  const popup = document.getElementById('confirmDeleteUserPopupOverlay');
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideConfirmDeleteUserPopup();
    }
  });
}

// Execute user deletion
async function executeDeleteUser() {
  if (!userToDelete) {
    showPopup('No user selected for deletion', 'Error');
    return;
  }
  
  try {
    // Store user info before hiding popup
    const userId = userToDelete.id;
    const userEmail = userToDelete.email;
    const userName = userToDelete.name;
    
    const result = await UserManagementLogic.deleteUser(userId);
    
    if (result.success) {
      hideConfirmDeleteUserPopup();
      showPopup(`User ${userName} (${userEmail}) has been deleted successfully!`, 'Success');
      
      // Refresh users list
      await handleManageUsers();
    } else {
      throw new Error(result.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Failed to delete user:', error.message);
    showPopup(`Failed to delete user: ${error.message}`, 'Error');
  }
}