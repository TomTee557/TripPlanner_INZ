<?php

class User {
    public $id;
    public $name;
    public $surname;
    public $email;
    public $password;
    public $role;

    public function __construct($name, $surname, $email, $password, $id = null, $role = 'USER') {
        $this->id = $id;
        $this->name = $name;
        $this->surname = $surname;
        $this->email = $email;
        $this->password = $password;
        $this->role = $role;
    }
    
    public function isAdmin() {
        return $this->role === 'ADMIN';
    }
}