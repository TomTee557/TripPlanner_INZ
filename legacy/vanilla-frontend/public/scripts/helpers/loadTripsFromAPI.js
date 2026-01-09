import { GetTripsLogic } from '../infrastructure/GetTripsLogic.js';

/**
 * Load trips from API and update global state
 * @param {Function} renderCallback - Function to call after loading trips
 * @param {Function} showPopupCallback - Function to show error popups
 * @returns {Promise<{success: boolean, trips: Array}>} Result object with success status and trips
 */
export async function loadTripsFromAPI(renderCallback, showPopupCallback) {
  try {
    const result = await GetTripsLogic.getUserTrips();
    const fetchedTrips = result.data || [];
    
    console.log('Loaded', fetchedTrips.length, 'trips from API');
    
    return { success: true, trips: fetchedTrips };
    
  } catch (error) {
    console.error('Failed to load trips:', error.message);
    
    // Show error message to user
    if (showPopupCallback) {
      showPopupCallback(
        'Failed to load your trips. Please refresh the page and try again.', 
        'Error', 
        () => window.location.reload()
      );
    }
    
    return { success: false, trips: [] };
  }
}
