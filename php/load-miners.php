<?php

@include 'db-connection.php';

class LoadMiners extends DBConnection {

        public function __construct() {
                
    		parent::__construct();
        
        }

        public function __destruct() {
        
        	parent::__destruct();
        
        }

        function loadMiners() {
        
        	$minerType = $_POST['minerType'];;
        	
        	$query = 'SELECT id, miner_json AS minerJSON, session_id AS sessionId FROM Miners WHERE miner_type = "$minerType";';
        	
        	$sth = $this->conn->prepare($query);
        	
        	$sth->execute();
        	
        	$results = $sth->fetchAll();
        	
			echo json_encode($results);
        
        }

}

$obj = new LoadMiners();
$obj->loadMiners();

?>