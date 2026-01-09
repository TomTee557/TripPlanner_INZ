<?php

class Database {
    private static $instance = null;
    private $connection;
    
    // Database configuration
    private $host = 'db';  // service name in docker-compose.yaml
    private $port = '5432'; // internal container port
    private $database = 'db';
    private $username = 'docker';
    private $password = 'docker';
    
    private function __construct() {
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->database}";
            $this->connection = new PDO($dsn, $this->username, $this->password);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Method for executing SELECT queries
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Query execution failed: " . $e->getMessage());
        }
    }
    
    // Method for executing INSERT, UPDATE, DELETE queries
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            throw new Exception("Query execution failed: " . $e->getMessage());
        }
    }
    
    // Method to get the last inserted ID
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
    
    // Transaction methods
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollback();
    }
}
