// Logic for updating existing trips in database
// POST /api/trips/update

import { TripApiLogic } from './TripApiLogic.js';

export class UpdateTripLogic {
    
    /**
     * Update existing trip
     * @param {string} tripId - Trip ID to update
     * @param {Object} tripData - Trip data to update
     * @returns {Promise<Object>} API response
     */
    static async updateTrip(tripId, tripData) {
        if (!tripId) {
            throw new Error('Trip ID is required');
        }
        
        const payload = {
            id: tripId,
            ...tripData
        };
        
        try {
            const result = await TripApiLogic.request('/api/trips/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            return result;
            
        } catch (error) {
            console.error('UpdateTripLogic: Failed to update trip:', error.message);
            
            throw error; // Pass error to UI layer
        }
    }
}
