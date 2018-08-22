var OER = (function(){
    
	function OERClass() {
    	

	}
	
	OERClass.prototype.getOERs = function(container) {

		$.ajax({

			type: 'GET',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/get_teacher_oers.php',
			success: function(data) {

				var oers = JSON.parse(data);

				if (! oers.length) {

					container.innerHTML = '<h2>No OERs available at the moment</h2>';
					return;

				}

				var html = '<table id=\'oer-table\' class=\'table table-hover\'>';
				html += '<thead>';
				html += '<tr>'

				for (var key in oers[0])
					if (key === 'id')
						html += '<th>#</th>';
					else
						html += '<th>' + key + '</th>';

				html += '<th>Preview</th>';

				html += '</tr>';
				html += '<tbody>';

				for (let i = 0; i < oers.length; i++) {

					let oer = oers[i];

					html += '<tr>';

					for (let key in oer)
						if (key === 'download')
							html += '<td><a target=\'_blank\' href=\'' + oer[key].trim() + '\'>Download OER</a></tf>';
						else
							html += '<td>' + oer[key] + '</td>';

					html += '<td>';

					html += '<object data=\'' + oer['download'].trim() + '\' type=\'application/pdf\' width=\'100%\' height=\'100%\'>';
   					html += '<p>This browser does not support PDFs. Please download the PDF to view</p>';
					html += '</object>'

					html += '</tr>';


				}

				html += '</tbody>';

				html += '</table>';

				container.innerHTML = html;

			},
			error: function(error) {}

		});

	};
    
	var instance;
    

	return {

        	getInstance: function() {
            
			if (! instance) {

                		instance = new OERClass();
                
				instance.constructor = null;
            
			}

            		return instance;
        
		}
   
	};
	
})();

