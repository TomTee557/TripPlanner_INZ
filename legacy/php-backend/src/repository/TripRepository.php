<?php

require_once 'Database.php';

class TripRepository {
    private $database;
    
    public function __construct() {
        $this->database = Database::getInstance();
    }
    
    public function findByUserId($userId) {
        $sql = "SELECT 
                    id::text as id,
                    title,
                    date_from as \"dateFrom\",
                    date_to as \"dateTo\", 
                    country,
                    trip_type as \"tripType\",
                    tags,
                    budget,
                    description,
                    image,
                    created_at as \"createdAt\"
                FROM trips 
                WHERE user_id = ? 
                ORDER BY created_at DESC";
        
        $results = $this->database->query($sql, [$userId]);
        
        // Convert JSONB to array
        foreach ($results as &$trip) {
            $trip['tripType'] = json_decode($trip['tripType'], true) ?: [];
            $trip['tags'] = json_decode($trip['tags'], true) ?: [];
        }
        
        return $results;
    }
    
    public function findByUserEmail($email) {
        $sql = "SELECT 
                    t.id::text as id,
                    t.title,
                    t.date_from as \"dateFrom\",
                    t.date_to as \"dateTo\",
                    t.country,
                    t.trip_type as \"tripType\",
                    t.tags,
                    t.budget,
                    t.description,
                    t.image,
                    t.created_at as \"createdAt\"
                FROM trips t
                JOIN users u ON t.user_id = u.id
                WHERE LOWER(u.email) = LOWER(?)
                ORDER BY t.created_at DESC";
        
        $results = $this->database->query($sql, [$email]);
        
        // Convert JSONB to array
        foreach ($results as &$trip) {
            $trip['tripType'] = json_decode($trip['tripType'], true) ?: [];
            $trip['tags'] = json_decode($trip['tags'], true) ?: [];
        }
        
        return $results;
    }
    
    public function save($userId, $tripData) {
        $sql = "INSERT INTO trips (user_id, title, date_from, date_to, country, trip_type, tags, budget, description, image) 
                VALUES (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?) 
                RETURNING id::text";
        
        $tripType = json_encode($tripData['tripType'] ?: []);
        $tags = json_encode($tripData['tags'] ?: []);
        
        $result = $this->database->query($sql, [
            $userId,
            $tripData['title'],
            $tripData['dateFrom'],
            $tripData['dateTo'],
            $tripData['country'],
            $tripType,
            $tags,
            $tripData['budget'] ?: null,
            $tripData['description'] ?: null,
            $tripData['image'] ?: '/public/assets/mountains.jpg'
        ]);
        
        return $result[0]['id'];
    }
    
    public function deleteById($tripId, $userId) {
        $sql = "DELETE FROM trips WHERE id = ?::uuid AND user_id = ?";
        return $this->database->execute($sql, [$tripId, $userId]);
    }
    
    public function findById($tripId, $userId) {
        $sql = "SELECT 
                    id::text as id,
                    title,
                    date_from as \"dateFrom\",
                    date_to as \"dateTo\",
                    country,
                    trip_type as \"tripType\",
                    tags,
                    budget,
                    description,
                    image
                FROM trips 
                WHERE id = ?::uuid AND user_id = ?";
        
        $results = $this->database->query($sql, [$tripId, $userId]);
        
        if (empty($results)) {
            return null;
        }
        
        $trip = $results[0];
        $trip['tripType'] = json_decode($trip['tripType'], true) ?: [];
        $trip['tags'] = json_decode($trip['tags'], true) ?: [];
        
        return $trip;
    }
    
    public function updateById($tripId, $userId, $tripData) {
        $sql = "UPDATE trips 
                SET title = ?, date_from = ?, date_to = ?, country = ?, 
                    trip_type = ?::jsonb, tags = ?::jsonb, budget = ?, 
                    description = ?, image = ?
                WHERE id = ?::uuid AND user_id = ?";
        
        $tripType = json_encode($tripData['tripType'] ?: []);
        $tags = json_encode($tripData['tags'] ?: []);
        
        return $this->database->execute($sql, [
            $tripData['title'],
            $tripData['dateFrom'],
            $tripData['dateTo'],
            $tripData['country'],
            $tripType,
            $tags,
            $tripData['budget'] ?: null,
            $tripData['description'] ?: null,
            $tripData['image'] ?: '/public/assets/mountains.jpg',
            $tripId,
            $userId
        ]);
    }
}
