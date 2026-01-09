<?php

require_once 'AppController.php';
require_once 'src/repository/TripRepository.php';
require_once 'src/repository/UserRepository.php';
require_once 'src/helpers/PasswordHelper.php';
require_once 'src/helpers/SecurityHelper.php';

class ApiController extends AppController {

    private $tripRepository;
    private $userRepository;
    
    public function __construct() {
        $this->tripRepository = new TripRepository();
        $this->userRepository = new UserRepository();
    }

    /**
     * Checks if user is logged in
     * Returns data for JavaScript handling
     */
    private function checkAuth() {
        SecurityHelper::initSession();

        // Check session
        if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Not authenticated',
                'message' => 'Your session has expired. Please log in again.',
                'action' => 'show_login_popup' // Signal for JavaScript
            ]);
            exit;
        }
        
        
        return $_SESSION['user_email'];
    }

    /**
     * Checks if current user has admin role
     */
    private function checkAdminAuth() {
        $userEmail = $this->checkAuth(); // Returns email or exits with 401
        
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Access denied',
                'message' => 'Administrator privileges required'
            ]);
            exit;
        }
        
        return $userEmail;
    }

    /**
     * GET /api/trips - get user's trips
     */
    public function getTrips() {
        $userEmail = $this->checkAuth(); // Returns email or exits with 401
        
        try {
            $trips = $this->tripRepository->findByUserEmail($userEmail);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $trips,
                'user' => $userEmail,
                'count' => count($trips)
            ]);
            
        } catch (Exception $e) {
            error_log("Error fetching trips: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to fetch trips. Please try again later.'
            ]);
        }
    }

    /**
     * POST /api/trips - add new trip
     */
    public function addTrip() {
        $userEmail = $this->checkAuth(); // Returns email or exits with 401
        
        if (!$this->isPost()) {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        try {
            // Get data from POST
            $jsonData = file_get_contents('php://input');
            $input = json_decode($jsonData, true);
            
            // Check if JSON is valid
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Invalid JSON',
                    'message' => 'Request body must be valid JSON'
                ]);
                exit;
            }
            
            // basic data validation
            if (!$input || !isset($input['title']) || !isset($input['country']) || 
                !isset($input['dateFrom']) || !isset($input['dateTo'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Missing required fields',
                    'message' => 'Title, country, dateFrom and dateTo are required'
                ]);
                exit;
            }
            
            // Find user_id
            $user = $this->userRepository->findByEmail($userEmail);
            if (!$user) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'User not found',
                    'message' => 'User associated with session not found'
                ]);
                exit;
            }
            
            // Add trip to database
            $tripId = $this->tripRepository->save($user->id, $input);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Trip added successfully',
                'tripId' => $tripId,
                'user' => $userEmail
            ]);
            
        } catch (Exception $e) {
            error_log("Error adding trip: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error', 
                'message' => 'Unable to add trip. Please try again later.'
            ]);
        }
    }

    /**
     * POST /api/trips/delete - delete trip
     */
    public function deleteTrip() {
        $userEmail = $this->checkAuth(); // Returns email or exits with 401
        
        if (!$this->isPost()) {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $tripId = $input['id'] ?? null;
            
            if (!$tripId) {
                throw new Exception("Trip ID is required");
            }
            
            // Find user_id
            $user = $this->userRepository->findByEmail($userEmail);
            if (!$user) {
                throw new Exception("User not found");
            }
            
            // Delete trip (only if it belongs to the user)
            $deleted = $this->tripRepository->deleteById($tripId, $user->id);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Trip deleted successfully',
                'deleted' => $deleted
            ]);
            
        } catch (Exception $e) {
            error_log("Error deleting trip: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to delete trip. Please try again later.'
            ]);
        }
    }
    
    /**
     * Update existing trip
     * POST /api/trips/update
     */
    public function updateTrip() {
        $userEmail = $this->checkAuth(); // Returns email or exits with 401
        
        if (!$this->isPost()) {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $tripId = $input['id'] ?? null;
            $title = trim($input['title'] ?? '');
            $dateFrom = $input['dateFrom'] ?? null;
            $dateTo = $input['dateTo'] ?? null;
            $country = trim($input['country'] ?? '');
            $tripType = $input['tripType'] ?? [];
            $tags = $input['tags'] ?? [];
            $budget = trim($input['budget'] ?? '');
            $description = trim($input['description'] ?? '');
            $image = $input['image'] ?? '/public/assets/mountains.jpg';
            
            // Validation
            if (!$tripId || !$title || !$dateFrom || !$dateTo || !$country) {
                throw new Exception("Required fields: id, title, dateFrom, dateTo, country");
            }
            
            // Find user
            $user = $this->userRepository->findByEmail($userEmail);
            if (!$user) {
                throw new Exception("User not found");
            }
            
            // Check if trip exists and belongs to user
            $existingTrip = $this->tripRepository->findById($tripId, $user->id);
            if (!$existingTrip) {
                throw new Exception("Trip not found or access denied");
            }
            
            // Update trip in database
            $updated = $this->tripRepository->updateById($tripId, $user->id, [
                'title' => $title,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'country' => $country,
                'tripType' => $tripType,
                'tags' => $tags,
                'budget' => $budget ?: null,
                'description' => $description,
                'image' => $image
            ]);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Trip updated successfully',
                'tripId' => $tripId
            ]);
            
        } catch (Exception $e) {
            error_log("Error updating trip: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to update trip. Please try again later.'
            ]);
        }
    }

    /**
     * GET /api/users - get all users (admin only)
     */
    public function getUsers() {
        $this->checkAdminAuth(); // Admin only
        
        try {
            $users = $this->userRepository->findAll();
            
            // Remove password from response
            $safeUsers = array_map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'role' => $user->role
                ];
            }, $users);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'users' => $safeUsers
            ]);
            
        } catch (Exception $e) {
            error_log("Error fetching users: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to fetch users. Please try again later.'
            ]);
        }
    }

    /**
     * POST /api/users/role - update user role (admin only)
     */
    public function updateUserRole() {
        $this->checkAdminAuth(); // Admin only
        
        if (!$this->isPost()) {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['userId']) || !isset($input['role'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Missing required fields',
                    'message' => 'User ID and role are required'
                ]);
                exit;
            }
            
            $userId = $input['userId'];
            $newRole = $input['role'];
            
            // Validate role
            if (!in_array($newRole, ['USER', 'ADMIN'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Invalid role',
                    'message' => 'Role must be USER or ADMIN'
                ]);
                exit;
            }
            
            $this->userRepository->updateRole($userId, $newRole);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'User role updated successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error updating user role: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to update user role. Please try again later.'
            ]);
        }
    }

    /**
     * POST /api/users/password - update user password (admin only)
     */
    public function updateUserPassword() {
        $this->checkAdminAuth(); // Admin only
        
        if (!$this->isPost()) {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['userId']) || !isset($input['password'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Missing required fields',
                    'message' => 'User ID and password are required'
                ]);
                exit;
            }
            
            $userId = $input['userId'];
            $newPassword = $input['password'];
            
            // Hash the password
            $hashedPassword = PasswordHelper::hash($newPassword);
            
            $this->userRepository->updatePassword($userId, $hashedPassword);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'User password updated successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error updating user password: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to update user password. Please try again later.'
            ]);
        }
    }
    
    /**
     * POST /api/users/delete - delete user (admin only)
     */
    public function deleteUser() {
        $this->checkAdminAuth(); // Admin only
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['userId']) || empty($input['userId'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Invalid input',
                    'message' => 'User ID is required'
                ]);
                exit;
            }
            
            $userId = $input['userId'];
            
            // Check if user exists
            $userToDelete = $this->userRepository->findById($userId);
            if (!$userToDelete) {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'User not found',
                    'message' => 'User with specified ID does not exist'
                ]);
                exit;
            }
            
            // Prevent admin from deleting themselves
            if (isset($_SESSION['user_email']) && $_SESSION['user_email'] === $userToDelete->email) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Cannot delete yourself',
                    'message' => 'You cannot delete your own account'
                ]);
                exit;
            }
            
            // Delete user (CASCADE will delete related trips automatically)
            $this->userRepository->deleteById($userId);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            
        } catch (Exception $e) {
            error_log("Error deleting user: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database error',
                'message' => 'Unable to delete user. Please try again later.'
            ]);
        }
    }
}
