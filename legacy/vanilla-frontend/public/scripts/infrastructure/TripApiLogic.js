// Basic API class for server communication
// Handles sessions, authentication errors and PHP routing

export class TripApiLogic {
    
    static async request(url, options = {}) {
        const defaultOptions = {
            credentials: 'same-origin', // sends session cookies
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        const isJSON = contentType && contentType.includes('application/json');
        
        // Check if user is logged in
        if (response.status === 401) {
            if (isJSON) {
                const errorData = await response.json();
                console.warn('Authentication error:', errorData.message);
                this.showLoginPopup(errorData.message);
                throw new Error('Authentication required');
            } else {
                console.warn('Authentication error: Non-JSON response');
                this.showLoginPopup('Your session has expired. Please log in again.');
                throw new Error('Authentication required');
            }
        }
        
        if (!response.ok) {
            if (isJSON) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } else {
                // Non-JSON response (probably HTML error page)
                const errorText = await response.text();
                console.error('Non-JSON error response:', errorText);
                throw new Error(`Server error: ${response.status} - Check console for details`);
            }
        }
        
        // Parse JSON response
        if (isJSON) {
            return await response.json();
        } else {
            const responseText = await response.text();
            console.error('Expected JSON but got:', responseText);
            throw new Error('Server returned non-JSON response');
        }
    }
    
    // Popup asking for re-login
    static showLoginPopup(message) {
        // Use existing popup system from mainApp.js
        if (typeof showPopup === 'function') {
            showPopup(message, "Session Expired", () => {
                // After closing popup, call logout service
                this.performLogout();
            });
        } else {
            // Fallback if showPopup doesn't exist
            if (confirm(message + "\n\nClick OK to log out and return to login page.")) {
                this.performLogout();
            }
        }
    }
    
    // Call logout service (PHP routing)
    static performLogout() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        form.style.display = 'none';
        
        const reasonInput = document.createElement('input');
        reasonInput.type = 'hidden';
        reasonInput.name = 'logout_reason';
        reasonInput.value = 'session_expired';
        form.appendChild(reasonInput);
        
        document.body.appendChild(form);
        form.submit(); // PHP routing manages redirect
    }
}
