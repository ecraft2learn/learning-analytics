<?php

@include 'db-connection.php';

class SaveMiner extends DBConnection {

        public function __construct() {
        
    		parent::__construct();
        
        }

        public function __destruct() {
        
        	parent::__destruct();
        
        }

        function saveMiner() {
        
        	$minerType = $_POST['minerType'];
        	$minerJSON = $_POST['minerJSON'];
        	$sessionId = $_POST['sessionId'];
        	
        	$query = 'INSERT INTO Miners VALUES(DEFAULT, "$minerType", "$minerJSON", $sessionId);';
        	
        	$sth = $this->conn->prepare($query);
        	
        	$res = $sth->execute();
        	
        	if ($res)
        		echo $this->conn->lastInsertId();
        	else
        		echo 'Insertation Error';
        
        }

}

$obj = new SaveMiner();
$obj->saveMiner();

?>