var Share = (function(){
    
	function ShareClass() {
    	
	}

	ShareClass.prototype.register = function(username, password, firstName, lastName, email, useFiles) {

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

					$('#myModal').modal('hide');

                                        $('#login-modal').modal('hide');

					if (useFiles)
						self.getFiles(document.getElementById('share-content'));

				}

			},
			error: function(error) {


			}

		});

	};

	ShareClass.prototype.getFiles = function(container) {

		if (! container) 
			return;

		var self = this;

		$.ajax({

			type: 'GET',
			url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/get_shares.php',
			success: function(data) {

				var list = JSON.parse(data);

				var html = '';

				for (var i = 0; i < list.length; i++) {


        				html += '<div class="col-sm-8">';
            				html += '<div class="panel panel-white post panel-shadow">';
                			html += '<div class="post-heading">';
                    			html += '<div class="pull-left image">';

                        		html += '<img width=\'50px\' src=\'https://ssl.gstatic.com/accounts/ui/avatar_2x.png\' class="img-circle avatar" alt="user profile image">';
                    			html += '</div>';

                    			html += '<div class="pull-left meta">';
                        		html += '<div class="title h5">';
                            		html += '<b>' + list[i].user + '</b>';
                        		html += '</div>';
                    			html += '</div>';
                			html += '</div>'; 
                
					html += '<div class="post-description">';

                    			html += '<p>';

					html += '<img src=\'' + list[i].file_url + '\' alt=\'\' width=\'250\'>';
					
					html += '<br>';
					html += list[i].description;

					html += '</p>';

					var tags = JSON.parse(list[i].tags);
	
					for (var j = 0; j < tags.length; j++)
                                        	html += '<h4 style=\'float: left;\'><span class=\'label label-success tags\'>' + tags[j] + '</span></h4>';	
					
					html += '</div>';
                			html += '</div>';
            				html += '</div>';


					if (self.username === list[i].email) {

						html += '<button class=\'btn btn-danger btn-xs\' onclick=\'removeShare(this)\' id=\'remove-' + list[i].id + '\'><span class=\'glyphicon glyphicon-trash\'></span></button>';

					}

        				html += '</div>';
	
					//html += '<br><br><br><br><br><br><br><br>';

					if (list[i].comments) {

						html += '<div class=\'container\' style=\'margin-top: 20px;\'>';

						html += '<div class=\'row\'>';

						for (var j = 0; j < list[i].comments.length; j++) {

							//html += '<div class=\'col-sm-1\'>';
							//html += '<div class=\'thumbnail\'>';

							//html += '<img class=\'img-responsive user-photo\' src=\'https://ssl.gstatic.com/accounts/ui/avatar_2x.png\'>';
							//html += '</div>';
							//html += '</div>';

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

					}

					html += '<div class=\'well comment-div\'>';
					
					html += '<textarea cols=\'5\' rows=\'5\' id=\'comment-' + list[i].id + '\'></textarea>';
					html += '<br><br><br>';
					html += '<button class=\'btn btn-success\' id=\'comment-btn-' + list[i].id + '\' onclick=\'comment(this)\'>Share comment</button>';

					html += '</div>';

					html += '<hr>';

				}

				container.innerHTML = html;
			
				$('.comment-div').toggle();

				$('#toggle-comments').on('click', (event) => {


					$('.comment-div').toggle();

				});
				

			},
			error: function(error) {


			}

		});


	};

	ShareClass.prototype.login = function(username, password, useFiles) {

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

					$('#login-modal').modal('hide');

					if (useFiles)
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

function removeShare(param) {

	var id = param.id.split('-')[1];

	var share = Share.getInstance();

	$.ajax({

		type: 'POST',
		data: 'id=' + id + '&username=' + share.username + '&password=' + share.password,
		url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/delete_share.php',
		success: function(data) {

			if (data === 'ok') {

				share.getFiles(document.getElementById('share-content'));


			} else {

				alert(data);

			}

		},
		error: function(error) {


		}

	});

};

function readURL(input) {

	var reader = new FileReader();

        reader.onload = function(e) {
               
		$('#upload-share-img')
                	.attr('src', e.target.result)
                    	.width(250);

	};

        reader.readAsDataURL(input);
        
};
