<?php
/**
 * Password hashing helper
 * Use this for generating secure password hashes
 */

class PasswordHelper {
    
    /**
     * Hash password using secure algorithm
     */
    public static function hash($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Verify password against hash
     */
    public static function verify($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>
