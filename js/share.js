var Share = (function(){
    
	function ShareClass() {
    	
	}

	ShareClass.prototype.register = function(username, password, firstName, lastName, email) {

		var self = this;

		$.ajax({

			type: 'POST',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/register_teacher_pilot_2.php',
			data: 'username=' + username + '&password=' + password + '&firstname=' + firstName + '&lastname=' + lastName + '&email=' + email,
			success: function(data) {

				if (isNaN(data)) {

					alert(data);

				} else {

					self.username = username,
                                        self.password = password;
		
					self.id = data;

                                        self.getFiles(document.getElementById('share-content'));

				}

			},
			error: function(error) {


			}

		});

	};

	ShareClass.prototype.getFiles = function(container) {

		$.ajax({

			type: 'GET',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/get_shares.php',
			success: function(data) {

				var list = JSON.parse(data);

				var html = '';

				for (var i = 0; i < list.length; i++) {

					html += '<div class=\'well\'><a href=\'' + list[i].file_url + '\' target=\'_blank\'>' + 'Shared file by ' + list[i].user +  '</a><br>';
					html += '<pre>' + list[i].description + '</pre><br>';
					
					var tags = JSON.parse(list[i].tags);
					
					for (var j = 0; j < tags.length; j++)
						html += '<span class=\'label label-success tags\'>' + tags[j] + '</span>';

					html += '</div>';
					html += '<h4>Comments for the share</h4>';

					if (list[i].comments) {


						html += '<div class=\'container\'>';

						html += '<div class=\'row\'>';

						for (var j = 0; j < list[i].comments.length; j++) {

							//html += '<div>' + list[i].comments[j].comment;
							//html += '<br><span class=\'label label-info\'>' + list[i].comments[j].user + '</span></div><hr>';
								
							html += '<div class=\'col-sm-1\'>';
							html += '<div class=\'thumbnail\'>';

							html += '<img class=\'img-responsive user-photo\' src=\'https://ssl.gstatic.com/accounts/ui/avatar_2x.png\'>';
							html += '</div>';
							html += '</div>';

							html += '<div class=\'col-sm-5\'>';
							html += '<div class=\'panel panel-default\'>';

							html += '<div class=\'panel-heading\'>';

							html += '<strong>' + list[i].comments[j].user + '</strong>'; 
							html += '</div>';

							html += '<div class=\'panel-body\'>';
							html += '' + list[i].comments[j].comment;
							html += '</div>';
							html += '</div>';
							html += '</div>';
				

						}

						html += '</div>';
                                                html += '</div>';

						console.log(html);

					}

					html += '<div>';

					html += '<textarea cols=\'40\' rows=\'20\' id=\'comment-' + list[i].id + '\'></textarea>';
					html += '<br><br><br>';
					html += '<button class=\'btn btn-success\' id=\'comment-btn-' + list[i].id + '\' onclick=\'comment(this)\'>Share comment</button>';

					html += '</div>';

				}

				container.innerHTML = html;

			},
			error: function(error) {


			}

		});


	};

	ShareClass.prototype.login = function(username, password) {

		var self = this;

		$.ajax({

			type: 'POST',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/login_teacher_pilot_2.php',
			data: 'username=' + username + '&password=' + password,
			success: function(data) {

				if (! isNaN(data)) {
				
					self.username = username,
					self.password = password;
			
					self.id = data;

					$('#myModal').modal('hide');
	
					self.getFiles(document.getElementById('share-content'));


				} else {

					alert('Not a valid username or a password.');

				}

			},
			error: function(error) {


			}

		});


	};

	ShareClass.prototype.uploadFile = function(file, tags, desc) {

		var formdata = new FormData();

		formdata.append('file', file);
		formdata.append('tags', JSON.stringify(tags));
		formdata.append('username', this.username);
		formdata.append('password', this.password);
		formdata.append('desc', desc);
		
		var self = this;

		$.ajax({
	
			type: 'POST',
			data: formdata,
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_shares_pilot_2.php',
			contentType: false,
			processData: false,
			success: function() {

				self.getFiles(document.getElementById('share-content'));


			},
			error: function(error) {


			}


		});

	};


	ShareClass.prototype.comment = function(comment, id) {

		var self = this;

		$.ajax({

			type: 'POST',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/put_comment_pilot_2.php',
			data: 'userId=' + self.id + '&comment=' + comment + '&shareId=' + id,
			success: function(data) {


				self.getFiles(document.getElementById('share-content'));


			},
			error: function(error) {
	

			}


		});
	

	};
    
	var instance;
    

	return {

        	getInstance: function() {
            
			if (! instance) {

                		instance = new ShareClass();
                
				instance.constructor = null;
            
			}

            		return instance;
        
		}
   
	};
	
})();

function comment(param) {


	var id = param.id.split('-')[2];
	
	var commentText = $('#comment-' + id).val();

	var share = Share.getInstance();

	share.comment(commentText, id);

	//TODO

};
