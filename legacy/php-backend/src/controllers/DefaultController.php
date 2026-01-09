<?php

require_once 'AppController.php';
require_once 'src/helpers/SecurityHelper.php';

class DefaultController extends AppController {

    public function auth()
    {
        SecurityHelper::initSession();
        $this->render('auth');
    }

    public function mainApp()
    {
        SecurityHelper::initSession();
        
        $this->render('mainApp');
    }
}
