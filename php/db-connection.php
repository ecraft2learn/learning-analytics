<?php

class DBConnection {

    const DB_HOST = 'localhost';
    const DB_NAME = '';
	const DB_USER = '';
    const DB_PASSWORD = '';
       
    protected $conn = null;

    public function __construct() {
                
    	$connectionString = sprintf('mysql:host=%s;dbname=%s;charset=utf8',
        	DBConnection::DB_HOST,
            DBConnection::DB_NAME);

            try {
            
            	$this->conn = new PDO($connectionString,
                	
                	DBConnection::DB_USER,
                	DBConnection::DB_PASSWORD);
                
            } catch (PDOException $pe) {
             
            	die($pe->getMessage());
                
            }
            
        }

        public function __destruct() {
         
                $this->conn = null;
        
        }
        
}

?>