'use strict';

var HTTP = function(url, method) {

	this.url = url;
	this.method = method;

};

HTTP.prototype.fetchDataSet = function(data, success, error) {

	var self = this;

	$.ajax({
	
		type: self.method,
		url: self.url,
		data: data,
		success: success ? success : function(response) {
		
			try {
			
				self.dataSet = JSON.parse(response);
		
			} catch (e) { alert(e) }
			
		},
		error: error ? error : function(error) {
		
			alert(error);
		
		}
	
	});

};

HTTP.prototype.saveMiner = function(data, success, error) {

	var self = this;
	
	$.ajax({
	
		type: self.method,
		url: self.url,
		data: data,
		success: success ? success : function(response) {
		
			alert(response);
		
		},
		error: error ? error : function(error) {
		
			alert(error);
		
		}
		
	})

};

HTTP.prototype.loadMiner = function(miner, data, success, error) {

	var self = this;
	
	$.ajax({
	
		type: self.method,
		url: self.url,
		data: data,
		success: success ? success : function(response) {
		
			if (! self.miners)
				self.miners = {};
			
			try {
			
				self.miners[miner] = JSON.parse(response);
		
			} catch (e) { alert(e); }
			
		},
		error: error ? error : function(error) {
		
			alert(error);
		
		}
	
	});

};