<?php /** @var array $messages */ ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Trip Planner - Main App</title>
  <link rel="stylesheet" href="/public/styles/global.css" />
  <link rel="stylesheet" href="/public/styles/mainApp.css" />
</head>
<body class="main-app">
  <!-- Search Panel (Left Column) -->
  <div class="main-app__search-panel" id="searchPanel">
    <button class="main-app__button main-app__button--search main-app__close-search--mobile" id="closeSearchBtn">Hide search panel</button>
    
    <img src="/public/assets/logo.png" alt="Trip Planner Logo" class="main-app__logo"/>
    
    <form class="main-app__form" id="searchForm">
      <div class="main-app__field">
        <label class="main-app__label">Date from</label>
        <input type="date" class="main-app__input" id="dateFrom" name="dateFrom" />
      </div>
      
      <div class="main-app__field">
        <label class="main-app__label">Date to</label>
        <input type="date" class="main-app__input" id="dateTo" name="dateTo" />
      </div>
      
      <div class="main-app__field">
        <label class="main-app__label">Trip type</label>
        <div class="main-app__dropdown" id="tripTypeDropdown">
          <div class="main-app__dropdown-trigger" id="tripTypeToggle">
            <span id="tripTypeDisplay">Select trip types</span>
            <span class="main-app__dropdown-arrow">▼</span>
          </div>
          <div class="main-app__dropdown-content" id="tripTypeContent">
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="city-break">
              <span>City Break</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="mountain">
              <span>Mountain</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="exotic">
              <span>Exotic</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="last-minute">
              <span>Last Minute</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="family">
              <span>Family</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="trekking">
              <span>Trekking</span>
            </label>
            <label class="main-app__checkbox-item">
              <input type="checkbox" name="tripType" value="cultural">
              <span>Cultural</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="main-app__field">
        <label class="main-app__label">Title</label>
        <input type="text" class="main-app__input" id="title" name="title" placeholder="My trip" />
      </div>
      
      <div class="main-app__field">
        <label class="main-app__label">Country</label>
        <input type="text" class="main-app__input" id="country" name="country" placeholder="Country" />
      </div>
      
      <div class="main-app__field">
        <label class="main-app__label">Tags</label>
        <input type="text" class="main-app__input" id="tags" name="tags" placeholder="Holiday" />
      </div>
      
      <div class="main-app__button-group">
        <button type="button" class="main-app__button main-app__button--clear" id="clearFiltersBtn">Clear filters</button>
        <button type="submit" class="main-app__button main-app__button--search" id="searchBtn">Search</button>
      </div>
    </form>
    
    <!-- Logout form -->
    <div class="main-app__logout-container">
      <form method="POST" action="/logout" class="main-app__logout-form">
        <button type="submit" class="main-app__logout">Logout</button>
      </form>
    </div>
  </div>

  <!-- Main Content (Right Column) -->
  <div class="main-app__content">
    <!-- Mobile logo -->
    <div class="main-app__mobile-logo-container">
      <img src="/public/assets/logo-white.png" alt="Trip Planner Logo" class="main-app__mobile-logo"/>
    </div>
    
    <!-- Mobile header with search button and clock -->
    <div class="main-app__mobile-header">
      <button class="main-app__toggle-search" id="showSearchBtn">Show search panel</button>
      <div class="main-app__clock main-app__clock--mobile">
        <div class="main-app__time" id="currentTimeMobile">12:24</div>
        <div class="main-app__date" id="currentDateMobile">Monday 02.04.2025</div>
      </div>
    </div>
    
    <!-- Desktop Header with Clock -->
    <div class="main-app__header">
      <div class="main-app__clock">
        <div class="main-app__time" id="currentTime">12:24</div>
        <div class="main-app__date" id="currentDate">Monday 02.04.2025</div>
      </div>
    </div>

    <!-- Trips Section -->
    <div class="main-app__trips">
      <div class="main-app__trips-header">
        <h2 class="main-app__trips-title">All trips:</h2>
        <div class="main-app__trips-actions">
          <button class="main-app__manage-users-btn" id="manageUsersBtn" style="display: none;">
            Manage users
          </button>
          <button class="main-app__add-trip" id="addTripBtn">
            <span>Add trip</span>
            <span>+</span>
          </button>
        </div>
      </div>
      
      <div class="main-app__trips-list" id="tripsList">
        <!-- Trip cards will be rendered here by JavaScript -->
      </div>
    </div>
  </div>

  <!-- Generic Popup -->
  <div class="popup-overlay popup-overlay--top-priority" id="popupOverlay">
    <div class="popup">
      <div class="popup__header">
        <h3 class="popup__title" id="popupTitle">Title</h3>
        <button class="popup__close" id="popupClose">&times;</button>
      </div>
      <div class="popup__content" id="popupContent">
        Popup Content
      </div>
      <div class="popup__actions" id="popupActions">
        <button class="popup__button popup__button--primary" id="popupPrimaryBtn">OK</button>
      </div>
    </div>
  </div>

  <!-- Add Trip Popup -->
  <div class="popup-overlay" id="addTripPopupOverlay">
    <div class="popup popup--add-trip">
      <div class="popup__header">
        <h3 class="popup__title">Add trip</h3>
        <button class="popup__close" id="addTripPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <form class="add-trip-form" id="addTripForm">
          <div class="add-trip-form__row">
            <div class="add-trip-form__col">
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Date from</label>
                <input type="date" class="add-trip-form__input" id="addTripDateFrom" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Trip type</label>
                <select class="add-trip-form__input" id="addTripType" required>
                  <option value="">Select trip type</option>
                  <option value="city-break">City break</option>
                  <option value="mountain">Mountain</option>
                  <option value="exotic">Exotic</option>
                  <option value="last-minute">Last Minute</option>
                  <option value="family">Family</option>
                  <option value="cultural">Cultural</option>
                  <option value="trekking">Trekking</option>
                </select>
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Country</label>
                <input type="text" class="add-trip-form__input" id="addTripCountry" placeholder="Country" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Budget</label>
                <input type="text" class="add-trip-form__input" id="addTripBudget" placeholder="Budget" />
              </div>
            </div>
            <div class="add-trip-form__col">
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Date to</label>
                <input type="date" class="add-trip-form__input" id="addTripDateTo" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Title</label>
                <input type="text" class="add-trip-form__input" id="addTripTitle" placeholder="My trip" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Tags</label>
                <input type="text" class="add-trip-form__input" id="addTripTags" placeholder="Holiday" />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Picture</label>
                <button type="button" class="add-trip-form__input add-trip-form__picture-btn" id="choosePictureBtn">
                  Choose the picture
                </button>
                <div class="add-trip-form__picture-preview" id="picturePreview">
                  <span class="add-trip-form__preview-label">Picture preview:</span>
                  <div class="add-trip-form__preview-container" id="previewContainer">
                    <span class="add-trip-form__no-preview">No picture selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="add-trip-form__row add-trip-form__row--full">
            <div class="add-trip-form__field">
              <label class="add-trip-form__label">Description</label>
              <textarea class="add-trip-form__input add-trip-form__textarea" id="addTripDescription" placeholder="Description" rows="4"></textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="addTripBackBtn">Back</button>
        <button type="button" class="popup__button popup__button--primary popup__button-currency-converter" id="addTripCurrencyConverterBtn">Currency converter</button>
        <button type="button" class="popup__button popup__button--primary" id="addTripSubmitBtn">Add trip</button>
      </div>
    </div>
  </div>

  <!-- Edit Trip Popup -->
  <div class="popup-overlay" id="editTripPopupOverlay">
    <div class="popup popup--edit-trip">
      <div class="popup__header">
        <h3 class="popup__title">Edit trip</h3>
        <button class="popup__close" id="editTripPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <form class="add-trip-form" id="editTripForm">
          <div class="add-trip-form__row">
            <div class="add-trip-form__col">
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Date from</label>
                <input type="date" class="add-trip-form__input" id="editTripDateFrom" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Trip type</label>
                <select class="add-trip-form__input" id="editTripType" required>
                  <option value="">Select trip type</option>
                  <option value="city-break">City break</option>
                  <option value="mountain">Mountain</option>
                  <option value="exotic">Exotic</option>
                  <option value="last-minute">Last Minute</option>
                  <option value="family">Family</option>
                  <option value="cultural">Cultural</option>
                  <option value="trekking">Trekking</option>
                </select>
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Country</label>
                <input type="text" class="add-trip-form__input" id="editTripCountry" placeholder="Country" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Budget</label>
                <input type="text" class="add-trip-form__input" id="editTripBudget" placeholder="Budget" />
              </div>
            </div>
            <div class="add-trip-form__col">
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Date to</label>
                <input type="date" class="add-trip-form__input" id="editTripDateTo" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Title</label>
                <input type="text" class="add-trip-form__input" id="editTripTitle" placeholder="My trip" required />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Tags</label>
                <input type="text" class="add-trip-form__input" id="editTripTags" placeholder="Holiday" />
              </div>
              <div class="add-trip-form__field">
                <label class="add-trip-form__label">Picture</label>
                <button type="button" class="add-trip-form__input add-trip-form__picture-btn" id="editChoosePictureBtn">
                  Choose the picture
                </button>
                <div class="add-trip-form__picture-preview" id="editPicturePreview">
                  <span class="add-trip-form__preview-label">Picture preview:</span>
                  <div class="add-trip-form__preview-container" id="editPreviewContainer">
                    <span class="add-trip-form__no-preview">No picture selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="add-trip-form__row add-trip-form__row--full">
            <div class="add-trip-form__field">
              <label class="add-trip-form__label">Description</label>
              <textarea class="add-trip-form__input add-trip-form__textarea" id="editTripDescription" placeholder="Description" rows="4"></textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="editTripBackBtn">Back</button>
        <button type="button" class="popup__button popup__button--primary popup__button-currency-converter" id="editTripCurrencyConverterBtn">Currency converter</button>
        <button type="button" class="popup__button popup__button--primary" id="editTripSaveBtn">Save</button>
      </div>
    </div>
  </div>

  <!-- Picture Selection Popup -->
  <div class="popup-overlay" id="pictureSelectionPopupOverlay">
    <div class="popup popup--picture-selection">
      <div class="popup__header">
        <h3 class="popup__title">Choose Picture</h3>
        <button class="popup__close" id="pictureSelectionPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <div class="picture-selection-grid" id="pictureSelectionGrid">
          <!-- Picture options will be populated by JavaScript -->
        </div>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="pictureSelectionBackBtn">Back</button>
      </div>
    </div>
  </div>

  <!-- Trip Details Popup -->
  <div class="popup-overlay" id="tripDetailsPopupOverlay">
    <div class="popup popup--trip-details">
      <div class="popup__header">
        <h3 class="popup__title">Trip Details</h3>
        <button class="popup__close" id="tripDetailsPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <div id="tripDetailsContent">
          <!-- Trip details will be populated by JavaScript -->
        </div>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="tripDetailsBackBtn">Back</button>
      </div>
    </div>
  </div>

  <!-- Currency Converter Popup -->
  <div class="popup-overlay popup-overlay--hidden" id="currencyConverterPopupOverlay">
    <div class="popup popup--currency-converter">
      <div class="popup__header">
        <h2 class="popup__title">Currency Converter</h2>
        <button type="button" class="popup__close" id="currencyConverterCloseBtn">&times;</button>
      </div>
      <div class="popup__content">
        <form class="popup__form" id="currencyConverterForm">
          <div class="currency-converter">
            <div class="currency-converter__row">
              <div class="currency-converter__field">
                <label class="currency-converter__label">From:</label>
                <div class="currency-converter__dropdown" id="fromCurrencyDropdown">
                  <input type="text" 
                         class="currency-converter__input currency-converter__search" 
                         id="fromCurrencySearch" 
                         placeholder="Search currency..."
                         autocomplete="off" />
                  <div class="currency-converter__dropdown-arrow">▼</div>
                  <div class="currency-converter__dropdown-content" id="fromCurrencyContent">
                    <!-- Currency options will be populated by JavaScript -->
                  </div>
                  <input type="hidden" id="fromCurrencyValue" name="fromCurrency" />
                </div>
              </div>
              
              <div class="currency-converter__field">
                <label class="currency-converter__label">To:</label>
                <div class="currency-converter__dropdown" id="toCurrencyDropdown">
                  <input type="text" 
                         class="currency-converter__input currency-converter__search" 
                         id="toCurrencySearch" 
                         placeholder="Search currency..."
                         autocomplete="off" />
                  <div class="currency-converter__dropdown-arrow">▼</div>
                  <div class="currency-converter__dropdown-content" id="toCurrencyContent">
                    <!-- Currency options will be populated by JavaScript -->
                  </div>
                  <input type="hidden" id="toCurrencyValue" name="toCurrency" />
                </div>
              </div>
            </div>

            <div class="currency-converter__row">
              <div class="currency-converter__field currency-converter__field--value">
                <label class="currency-converter__label">Value:</label>
                <input type="number" 
                       class="currency-converter__input currency-converter__value" 
                       id="currencyValue" 
                       name="value" 
                       placeholder="Enter amount..." 
                       min="0" 
                       step="0.01" />
              </div>
              
              <div class="currency-converter__field currency-converter__field--result">
                <label class="currency-converter__label">Result:</label>
                <input type="text" 
                       class="currency-converter__input currency-converter__result" 
                       id="currencyResult" 
                       placeholder="Conversion result..." 
                       readonly />
              </div>
            </div>

            <div class="currency-converter__rate" id="currencyRate">
              <!-- Exchange rate will be displayed here -->
            </div>

            <div class="currency-converter__loading" id="currencyLoading" style="display: none;">
              <div class="currency-converter__spinner"></div>
              <span>Converting...</span>
            </div>
          </div>
        </form>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="currencyConverterBackBtn">Back</button>
        <button type="button" class="popup__button popup__button--primary" id="currencyConverterConvertBtn">Convert</button>
      </div>
    </div>
  </div>

  <!-- User Management Popup (Admin Only) -->
  <div class="popup-overlay" id="manageUsersPopupOverlay" style="display: none;">
    <div class="popup popup--manage-users">
      <div class="popup__header">
        <h3 class="popup__title">Manage Users</h3>
        <button class="popup__close" id="manageUsersPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <div class="user-management">
          <div class="user-management__loading" id="usersLoading" style="display: none;">
            <div class="spinner"></div>
            <span>Loading users...</span>
          </div>
          <div class="user-management__list" id="usersList">
            <!-- Users will be populated by JavaScript -->
          </div>
        </div>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="manageUsersBackBtn">Close</button>
      </div>
    </div>
  </div>

  <!-- Change Password Popup -->
  <div class="popup-overlay" id="changePasswordPopupOverlay" style="display: none;">
    <div class="popup popup--change-password">
      <div class="popup__header">
        <h3 class="popup__title">Change User Password</h3>
        <button class="popup__close" id="changePasswordPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <form id="changePasswordForm" class="change-password-form">
          <div class="change-password-form__field">
            <label class="change-password-form__label">User:</label>
            <div id="changePasswordUserEmail" class="change-password-form__user-info">
              <!-- User email will be populated by JavaScript -->
            </div>
          </div>
          <div class="change-password-form__field">
            <label class="change-password-form__label" for="newPassword">New Password:</label>
            <input type="password" id="newPassword" name="newPassword" class="change-password-form__input" required minlength="4">
          </div>
          <div class="change-password-form__field">
            <label class="change-password-form__label" for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" class="change-password-form__input" required minlength="4">
          </div>
        </form>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="changePasswordBackBtn">Cancel</button>
        <button type="submit" form="changePasswordForm" class="popup__button popup__button--primary" id="changePasswordSubmitBtn">Change Password</button>
      </div>
    </div>
  </div>

  <!-- Confirm Role Change Popup -->
  <div class="popup-overlay" id="confirmRoleChangePopupOverlay" style="display: none;">
    <div class="popup popup--confirm">
      <div class="popup__header">
        <h3 class="popup__title">Confirm Role Change</h3>
        <button class="popup__close" id="confirmRoleChangePopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <p id="confirmRoleChangeMessage">Are you sure you want to change this user's role?</p>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="confirmRoleChangeCancel">Cancel</button>
        <button type="button" class="popup__button popup__button--primary" id="confirmRoleChangeConfirm">Confirm</button>
      </div>
    </div>
  </div>

  <!-- Confirm Delete User Popup -->
  <div class="popup-overlay" id="confirmDeleteUserPopupOverlay" style="display: none;">
    <div class="popup popup--confirm popup--danger">
      <div class="popup__header">
        <h3 class="popup__title">Delete User</h3>
        <button class="popup__close" id="confirmDeleteUserPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <div class="popup__warning">
          <p><strong>Warning: This action cannot be undone!</strong></p>
          <p id="confirmDeleteUserMessage">Are you sure you want to delete this user?</p>
          <p class="popup__consequence">All user's trips will also be permanently deleted.</p>
        </div>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="confirmDeleteUserCancel">Cancel</button>
        <button type="button" class="popup__button popup__button--danger" id="confirmDeleteUserConfirm">Delete User</button>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Trip Popup -->
  <div class="popup-overlay popup--danger" id="confirmDeleteTripPopupOverlay" style="display: none;">
    <div class="popup">
      <div class="popup__header">
        <h3 class="popup__title">Delete Trip</h3>
        <button class="popup__close" id="confirmDeleteTripPopupClose">&times;</button>
      </div>
      <div class="popup__content">
        <div class="popup__warning">
          <p id="confirmDeleteTripMessage">Are you sure you want to delete this trip?</p>
          <p class="popup__consequence">This action cannot be undone.</p>
        </div>
      </div>
      <div class="popup__actions">
        <button type="button" class="popup__button popup__button--secondary" id="confirmDeleteTripCancel">Cancel</button>
        <button type="button" class="popup__button popup__button--danger" id="confirmDeleteTripConfirm">Delete Trip</button>
      </div>
    </div>
  </div>

  <script>
    // Pass user role from PHP to JavaScript
    window.currentUserRole = '<?php echo $_SESSION['user_role'] ?? 'USER'; ?>';
    console.log('PHP Session user_role:', '<?php echo $_SESSION['user_role'] ?? 'NOT_SET'; ?>');
    console.log('Window.currentUserRole set to:', window.currentUserRole);
  </script>
  
  <script type="module" src="/public/scripts/infrastructure/TripLogic.js"></script>
  <script type="module" src="/public/scripts/mainApp.js"></script>
</body>
</html>
