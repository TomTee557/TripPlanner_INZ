<?php

class SecurityHelper {
    
    /**
     * Safe session initialization for development and production
     */
    public static function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            // Session lifetime settings
            ini_set('session.cookie_lifetime', 0);    // Expires when browser closes
            ini_set('session.gc_maxlifetime', 1800);  // 30 minutes server-side cleanup
            
            // Security settings that work in both dev and production
            ini_set('session.cookie_httponly', 1);    // Protect from XSS
            ini_set('session.use_strict_mode', 1);    // Prevent session fixation
            
            // Environment-aware secure cookies
            // Only use secure cookies in production (HTTPS)
            $isProduction = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
            if ($isProduction) {
                ini_set('session.cookie_secure', 1);
            } else {
                ini_set('session.cookie_secure', 0);  // Allow HTTP in development
            }
            
            session_start();
        }
    }
    
    /**
     * Regenerate session ID (call only on login, not every request)
     */
    public static function regenerateSessionId() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }
}
?>
