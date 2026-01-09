// Logic for getting user trips from database
// GET /api/trips

import { TripApiLogic } from './TripApiLogic.js';

export class GetTripsLogic {
    
    /**
     * Get all trips for the logged-in user from the database
     * @returns {Promise<Object>} Server response or error
     */
    static async getUserTrips() {
        try {
            console.log('GetTripsLogic: Fetching user trips from database...');
            
            const result = await TripApiLogic.request('/api/trips');
            
            console.log('GetTripsLogic: Trips loaded successfully:', {
                user: result.user,
                count: result.count,
                tripsCount: result.data?.length || 0
            });
            
            return result;
            
        } catch (error) {
            console.error('GetTripsLogic: Failed to load trips:', error.message);
            
            throw error;
        }
    }
    
    /**
     * Get trips and return only array (for compatibility with mockTrips)
     * @returns {Promise<Array>} List of trips or empty array on error
     */
    static async getTripsArray() {
        try {
            const result = await this.getUserTrips();
            return result.data || [];
        } catch (error) {
            // Return empty array on error
            // UI layer handle error messages
            return [];
        }
    }
    
    /**
     * Check if the user has any trips
     * @returns {Promise<boolean>} True if the user has trips
     */
    static async hasTrips() {
        try {
            const result = await this.getUserTrips();
            return (result.count || 0) > 0;
        } catch (error) {
            return false;
        }
    }
}
