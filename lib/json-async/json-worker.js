self.addEventListener('message', function(e) {

    var data = e.data;
    
    var json;
    
    if (navigator.userAgent.indexOf('Firefox') > -1)
    	json = JSON.parse(data);
    else
    	json = eval('(' + data + ')');

    self.postMessage(json);

    self.close();

}, false);
