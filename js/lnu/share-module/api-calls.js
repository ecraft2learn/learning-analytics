/**
 * Created by asoadmin on 2018-10-25.
 */


//var SERVER_URL1   = "https://localhost/lnu-teachers-uui.php";
var SERVER_URL   = "https://cs.uef.fi/~ec2l/lnu.php";
//var SERVER_URL   = "https://localhost/lnu.php";
//var SERVER_URL = "https://cs.uef.fi/~ec2l/lnu-teacher-uui.php";
//var SERVER_URL = "http://uui-teach.test:8888/lnu-teachers-uui.php";


function postAjaxRequest(url,data, callback) {

    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function (data,result) {
            // console.log(data);
            // console.log(result);
            callback(JSON.parse(data),result);
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            callback("error");
        }

    });
}



/**
 * GET STUDENTS WORK
 */
function getStudentsWork(callback){
    var pilotsite = window.sessionStorage.getItem("sessionId");
    //console.log(pilotsite);
    var data = {"pilotsite":pilotsite,"role":0,"func":"getSchoolSharedFiles"};

    postAjaxRequest(SERVER_URL,data,callback);
}

/**
 * APPROVE STUDENTS WORK
 */
function approveStudentsWork(sharingId,callback){

    var data = {"sharingId":sharingId,"status":1,"func":"updateSharingFileStatus"};

    postAjaxRequest(SERVER_URL,data,callback);
}

/**
 * REJECT STUDENTS WORK
 */
function rejectStudentsWork(sharingId,callback){

    var data = {"sharingId":sharingId,"status":2,"func":"updateSharingFileStatus"};

    postAjaxRequest(SERVER_URL,data,callback);
}


/**
 * REMOVE STUDENTS WORK
 */
function removeStudentsWork(sharingId,callback){

    var data = {"sharingId":sharingId,"status":3,"func":"updateSharingFileStatus"};
    postAjaxRequest(SERVER_URL,data,callback);

    //remove file from server
    var data = {"id":sharingId,"func":"stopSharing"};
    postAjaxRequest(SERVER_URL,data,callback);
}


/**
 * FOR TESTING PURPOSE
 */
function awatingForApprovalTestStudentsWork(sharingId,callback){

    var data = {"sharingId":sharingId,"status":3,"func":"updateSharingFileStatus"};
    postAjaxRequest(SERVER_URL,data,callback);

}


/**
 * DOWNLOAD STUDENT WORK
 * @param filename
 */
function download(filename) {
    var element = document.createElement('a');
    element.setAttribute('href', "https://cs.uef.fi/~ec2l/download_file.php?file=" + filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * GET TEACHER WORK BY TEACHER ID
 */
function getTeacherWork(callback){
    var userId = window.sessionStorage.getItem("teacherId");
    console.log(userId);
    var data = {"userId":userId,"func":"getUsersSharedFiles"};

    postAjaxRequest(SERVER_URL,data,callback);
}

/**
 * GET TEACHERS PUBLIC WORK BY PILOTSITE
 */
function getTeachersPublicWork(callback){
    var pilotsite = window.sessionStorage.getItem("sessionId");
    //console.log(pilotsite);
    var data = {"pilotsite":pilotsite,"role":1,"func":"getSchoolSharedFiles"};

    postAjaxRequest(SERVER_URL,data,callback);
}

function shareTeacherWork(data,callback){

    if(data.length>0){

        console.log($("#fileInput")[0].files[0]);

        var formData = new FormData();
        formData.append("file", $("#fileInput")[0].files[0]);
        formData.append("projectId",-1);
        formData.append("toolId",-1);
        formData.append("func","uploadFile");
        //upload file to the server
        $.ajax({
            //url: 'https://cs.uef.fi/~ec2l/fileman.php',
            url:"https://cs.uef.fi/~ec2l/fileman.php",
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
            type: 'post',
            async: false,
            success: function (php_script_response) {
                console.log(php_script_response);
                var fileId = JSON.parse(php_script_response)["DATA"]["ID"];
                data.push({"name":"fileId","value":fileId});
                saveSharing(data,callback);
            }
        });


    }
}

/**
 * Add file to sharing table
 * @param data
 * @param callback - success or error
 */
function saveSharing(data,callback) {

    var formData = new FormData();
    formData.append("userId",window.sessionStorage.getItem("userId"));
    formData.append("pilotsite",window.sessionStorage.getItem("sessionId"));

    if(data.length>0){


        var title = data.find(function (field) {
            return field.name ==="title";
        });

        var description = data.find(function (field) {
            return field.name ==="description";
        });

        var keywords = data.find(function (field) {
            return field.name ==="keywords";
        });

        var fileId = data.find(function (field) {
            return field.name ==="fileId";
        });

        formData.append("title",title.value);
        formData.append("description",description.value);
        formData.append("keywords",keywords.value);
        formData.append("fileId",fileId.value);
        formData.append("func","shareFile");
        formData.append("role",1);
        var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        formData.append("timestamp",timestamp);

        $.ajax({
            type: "POST",
            url: SERVER_URL,
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
            type: 'post',
            async: false,
            success: function (data,result) {
                console.log(data);
                callback("success");
            },
            error: function (jqXHR, exception) {
                console.log(jqXHR);
                console.log(exception);
                callback("error");
            }

        });
    }
}