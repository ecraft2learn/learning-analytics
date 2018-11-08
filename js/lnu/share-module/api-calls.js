/**
 * Created by asoadmin on 2018-10-25.
 */


var SERVER_URL1   = "https://localhost/lnu-teachers-uui.php";
var SERVER_URL   = "https://cs.uef.fi/~ec2l/lnu.php";
var SERVER_URL3   = "https://localhost/lnu.php";
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
    console.log("here1");
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