// Logic for deleting trips from database
// POST /api/trips/delete

import { TripApiLogic } from './TripApiLogic.js';

export class DeleteTripLogic {
    
    /**
     * Delete a trip from the database
     * @param {string} tripId - UUID of the trip to delete
     * @returns {Promise<Object>} Server response
     */
    static async deleteTrip(tripId) {
        try {
            console.log('DeleteTripLogic: Deleting trip from database...', tripId);
            
            const result = await TripApiLogic.request('/api/trips/delete', {
                method: 'POST',
                body: JSON.stringify({ id: tripId })
            });
            
            console.log('DeleteTripLogic: Trip deleted successfully:', {
                tripId: tripId,
                message: result.message
            });
            
            return result;
            
        } catch (error) {
            console.error('DeleteTripLogic: Failed to delete trip:', error.message);
            
            throw error;
        }
    }
}
