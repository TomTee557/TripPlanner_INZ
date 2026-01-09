// Logic for adding new trips to database
// POST /api/trips

import { TripApiLogic } from './TripApiLogic.js';

export class AddTripLogic {
    
    /**
     * add a new trip to the database
     * @param {Object} tripData - Data for the new trip (already validated in UI)
     * @returns {Promise<Object>} Server response
     */
    static async addTrip(tripData) {
        try {
            console.log('AddTripLogic: Adding new trip to database...', tripData);
            
            const result = await TripApiLogic.request('/api/trips', {
                method: 'POST',
                body: JSON.stringify(tripData)
            });
            
            console.log('AddTripLogic: Trip added successfully:', {
                tripId: result.tripId,
                user: result.user,
                message: result.message
            });
            
            return result;
            
        } catch (error) {
            console.error('AddTripLogic: Failed to add trip:', error.message);
            
            throw error;
        }
    }
}
