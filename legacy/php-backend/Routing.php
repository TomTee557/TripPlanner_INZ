<?php

require_once 'src/controllers/DefaultController.php';
require_once 'src/controllers/SecurityController.php';
require_once 'src/controllers/ApiController.php';

class Router {

    public static $routes = [];

    public static function get($url, $controller, $method) {
        self::$routes['GET'][$url] = [$controller, $method];
    }

    public static function post($url, $controller, $method) {
        self::$routes['POST'][$url] = [$controller, $method];
    }

    public static function run($url) {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $url ?: 'auth';
        
        // Check if this is the API endpoint - no related with view management
        $isApiEndpoint = strpos($action, 'api/') === 0;
        
        if (!isset(self::$routes[$method][$action])) {
            // For API endpoints, return JSON 404
            if ($isApiEndpoint) {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Endpoint not found',
                    'message' => "API endpoint '$action' not found"
                ]);
                exit;
            } else {
                die("404 Not Found");
            }
        }

        list($controllerName, $methodName) = self::$routes[$method][$action];
        $controller = new $controllerName;
        $controller->$methodName();
    }
}
