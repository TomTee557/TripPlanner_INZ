<?php

require_once 'Routing.php';

// Import controllers
require_once 'src/controllers/ApiController.php';

// Route to login/registration panel (auth.php)
Router::get('auth', 'DefaultController', 'auth');

// Route to main application (mainApp.php)
Router::get('mainApp', 'DefaultController', 'mainApp');

// POST route for login - when using login form
Router::post('login', 'SecurityController', 'login');

// POST route for registration - when using registration form
Router::post('register', 'SecurityController', 'register');

// POST route for logout
Router::post('logout', 'SecurityController', 'logout');

// API endpoints - require session verification
Router::get('api/trips', 'ApiController', 'getTrips');
Router::post('api/trips', 'ApiController', 'addTrip');
Router::post('api/trips/update', 'ApiController', 'updateTrip');
Router::post('api/trips/delete', 'ApiController', 'deleteTrip');

// Admin API endpoints - require admin role
Router::get('api/users', 'ApiController', 'getUsers');
Router::post('api/users/role', 'ApiController', 'updateUserRole');
Router::post('api/users/password', 'ApiController', 'updateUserPassword');
Router::post('api/users/delete', 'ApiController', 'deleteUser');

//  additional - default route to / redirects to auth
Router::get('', 'DefaultController', 'auth');

$path = trim($_SERVER['REQUEST_URI'], '/');
$path = parse_url($path, PHP_URL_PATH);
Router::run($path);

