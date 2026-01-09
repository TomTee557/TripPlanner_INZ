<?php

require_once 'AppController.php';
require_once 'src/models/User.php';
require_once 'src/repository/UserRepository.php';
require_once 'src/helpers/PasswordHelper.php';
require_once 'src/helpers/SecurityHelper.php';

class SecurityController extends AppController {

    private $userRepository;
    
    public function __construct() {
        $this->userRepository = new UserRepository();
    }

    public function login()
    {
        SecurityHelper::initSession();
        
        if (!$this->isPost()) {
            return $this->render('auth');
        }

        $email = strtolower(trim($_POST['email'] ?? ''));
        $password = $_POST['password'] ?? '';

        try {
            $user = $this->userRepository->findByEmail($email);
            
            if ($user && PasswordHelper::verify($password, $user->password)) {
                error_log("Login successful for user: " . $user->email . ", role: " . $user->role);
                
                // Regenerate session ID for security (prevents session fixation)
                SecurityHelper::regenerateSessionId();
                
                // Set user session
                $_SESSION['user_logged_in'] = true;
                $_SESSION['user_email'] = $user->email;
                $_SESSION['user_name'] = $user->name;
                $_SESSION['user_role'] = $user->role;
                
                // Debug session
                error_log("Session role set to: " . $_SESSION['user_role']);
                
                header('Location: /mainApp');
                exit;
            }
        } catch (Exception $e) {
            error_log("Database error during login: " . $e->getMessage());
            $_SESSION['messages'] = ['Database connection error. Please try again later.'];
            $_SESSION['formType'] = 'login';
            header('Location: /auth');
            exit;
        }

        // Login error – redirect with message
        $_SESSION['messages'] = ['Wrong email or password'];
        $_SESSION['formType'] = 'login';
        header('Location: /auth');
        exit;
    }

    public function register()
    {
        SecurityHelper::initSession();
        
        if (!$this->isPost()) {
            return $this->render('auth');
        }

        $email = trim($_POST['regEmail'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $surname = trim($_POST['surname'] ?? '');
        $password = $_POST['regPassword'] ?? '';

        // Hash password before saving to database
        $hashedPassword = PasswordHelper::hash($password);

        try {
            // Start transaction for user registration
            $this->userRepository->getDatabase()->beginTransaction();
            
            // 1. Create user
            $newUser = new User($name, $surname, $email, $hashedPassword);
            $userId = $this->userRepository->saveWithReturn($newUser);
            
            // 2. Log registration activity
            $this->logUserActivity($userId, 'REGISTRATION', $email);
            
            // In future, extend functionality:
            // 3. Create default user preferences (if we had this table)
            // $this->createDefaultUserPreferences($userId);
            
            // 4. Send welcome email (if we had email service)
            // $this->emailService->sendWelcomeEmail($email, $name);
            
            // Commit transaction
            $this->userRepository->getDatabase()->commit();
            
            // After registration message on login panel
            $_SESSION['messages'] = ['Registration successful! Now please log in.'];
            $_SESSION['formType'] = 'login';
            header('Location: /auth');
            exit;
            
        } catch (Exception $e) {
            // Rollback transaction on any error
            $this->userRepository->getDatabase()->rollback();
            
            if (strpos($e->getMessage(), 'already exists') !== false) {
                $_SESSION['messages'] = ['User with the specified email address already exists'];
            } else {
                error_log("Database error during registration: " . $e->getMessage());
                $_SESSION['messages'] = ['Database connection error. Please try again later.'];
            }
            $_SESSION['formType'] = 'register';
            header('Location: /auth');
            exit;
        }
    }

    public function logout()
    {
        SecurityHelper::initSession();

        // Clear user session data
        unset($_SESSION['user_logged_in']);
        unset($_SESSION['user_email']);
        unset($_SESSION['user_name']);
        unset($_SESSION['user_role']);
        
        // Set logout message based on reason
        $logoutReason = $_POST['logout_reason'] ?? 'manual';
        
        switch ($logoutReason) {
            case 'inactivity':
                $_SESSION['messages'] = ['You have been logged out due to inactivity.'];
                break;
            case 'browser_close':
                $_SESSION['messages'] = ['You have been logged out.'];
                break;
            default:
                $_SESSION['messages'] = ['You have been successfully logged out.'];
        }
        
        $_SESSION['formType'] = 'login';
        
        header('Location: /auth');
        exit;
    }
    
    /**
     * Log user activity for audit purposes
     */
    private function logUserActivity($userId, $action, $details = '') {
        try {
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "User Activity: UserID={$userId}, Action={$action}, Details={$details}, Time={$timestamp}";
            error_log($logMessage);
            
            // Future implementation for example: insert into audit_log table:
            // $sql = "INSERT INTO audit_log (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())";
            // $this->database->execute($sql, [$userId, $action, $details]);
            
        } catch (Exception $e) {
            error_log("Failed to log user activity: " . $e->getMessage());
        }
    }
}
