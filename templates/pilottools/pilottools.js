var SERVER_URL = "https://cs.uef.fi/~ec2l/pilottools-api.php";
var id = 0;
class GridView {
	constructor() {
		this.tbody = document.getElementsByClassName("gridview-content")[0];
		this.m_createContent();
	}
	m_createContent() {
		var f = this.m_createForm();
		f.appendChild(this.m_createLabel("Pilot Site:"));
		f.appendChild(this.m_createPilotList());
		f.appendChild(document.createTextNode("Or"));
		f.appendChild(document.createElement("br"));
		f.appendChild(this.m_createLabel("Enter session id:"));
		f.appendChild(document.createElement("br"));
		f.appendChild(this.m_createInput("tool_session_id"));
		f.appendChild(document.createTextNode("Press enter or click outside session id box to update."));
		f.appendChild(document.createElement("br"));
		f.appendChild(document.createElement("br"));
		f.appendChild(this.m_createLabel("Select which tools to inactivate:"));
		f.appendChild(document.createElement("br"));
		f.appendChild(this.m_createToolList());
		this.tbody.appendChild(f);
		
	}
	m_createPilotList() {
		var s = this.m_createSelect("pilottools-select-pilots");
		getPilots(function(pilots) {
			if(pilots.length>0) {
				var options = '';
				for(var i = 0; i < pilots.length; i++) {
					if(id==0)
						id = pilots[i].PILOTID;
					options += "<option value="+pilots[i].PILOTID+">"+pilots[i].SITE_NAME+"</option>";
				}
				$(s).data('select').data(options);
			}
		});
		return s;
	}
	m_createToolList() {
		var toolList = this.m_createGrid("pilottools-grid");		
		return toolList;
	}
	m_createGrid(id) {
		var g = document.createElement("div");
		g.setAttribute("class", "grid");
		g.setAttribute("id", id);
		return g;
	}
	m_createRow() {
		var r = document.createElement("div");
		r.setAttribute("class", "grid ml-0");
		r.setAttribute("style", "width:100%");
		return r;
	}
	m_createForm() {
		var f = document.createElement("form");
		f.setAttribute("class", "m-4");
		return f;
	}
	m_createSelect(id) {
		var s = document.createElement("select");
		s.setAttribute("id", id);
		s.setAttribute("data-role", "select");
		return s;
	}
	m_createOption() {
		var opt = document.createElement("option");
		opt.setAttribute("value", "a");
		opt.appendChild(document.createTextNode("b"));
		return opt;
	}
	m_createLabel(txt) {
		var l = document.createElement("label");
		l.appendChild(document.createTextNode(txt));
		return l;
	}
	m_createInput(id) {
		var i = document.createElement("input");
		i.setAttribute("type", "number");
		i.setAttribute("value", "");
		i.setAttribute("id", id);
		i.setAttribute("style", "width:100%");
		return i;
	}
}
function getPilots(callback) {
	var data = new FormData();
	data.append("func", "getPilots");
	$.ajax({
        type: "POST",
        url: SERVER_URL,
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        type: 'post',
        success: function (data,result) {
            callback(JSON.parse(data).DATA);
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            callback([]);
        }

    });
}
function getTools(callback, pilotid) {
	var data = new FormData();
	data.append("func", "getTools");
	data.append("pilotid", pilotid);
	$.ajax({
        type: "POST",
        url: SERVER_URL,
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        type: 'post',
        success: function (data,result) {
            callback(JSON.parse(data).DATA);
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            callback([]);
        }

    });
}
$(function(){
	new GridView();
	$(document).on('change', '#pilottools-select-pilots, #tool_session_id', function(){
		var data = new FormData(),
			pilotid = $(this).val();
		if(pilotid==undefined||pilotid=="")
			pilotid = 0;
		data.append("func", "pilottools-select-pilot");
		data.append("pilotid", pilotid);
		$.ajax({
			type: "POST",
			url: SERVER_URL,
			cache: false,
			contentType: false,
			processData: false,
			data: data,
			type: 'post',
			success: function (data,result) {
				$('#pilottools-grid').html(data);
			},
			error: function (jqXHR, exception) {
				console.log(jqXHR);
				console.log(exception);
			}

		});
	});
	$(document).on('click', '.radio-btn', function(e){
		var cond = false;
		if($('#tool_session_id').val().trim().length!=0 && $('#tool_session_id').val()!=undefined){
			var pilotid = $('#tool_session_id').val().trim();
			$('#pilottools-select-pilots').find('option').each(function(){
				if($(this).val()==pilotid){
					cond = true;
				}	
			});
		}
		if(cond==true) {
			e.preventDefault();
			alert("Entered session id is same as a pilot id.");
		}
	});
	$(document).on('change', '.radio-btn', function(e){
		var pilotid = $('#pilottools-select-pilots').val(), 
			data = new FormData();
		if($('#tool_session_id').val().trim().length>0) {
			pilotid = $('#tool_session_id').val().trim();
		}
		data.append("func", "pilottools-changed");
		data.append("pilotid", pilotid);
		data.append("toolid", $(this).children().eq(0).attr('toolid'));
		data.append("checked", !$(this).children().eq(0).is(':checked')*1);
		$.ajax({
			type: "POST",
			url: SERVER_URL,
			cache: false,
			contentType: false,
			processData: false,
			data: data,
			type: 'post',
			success: function (data,result) {
			},
			error: function (jqXHR, exception) {
				console.log(jqXHR);
				console.log(exception);
			}

		});
		
	});
});
/*
$(function(){
    
        new GridView();
    });
	
});
*/