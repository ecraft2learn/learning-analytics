/**
 * Created by asoadmin on 2018-09-27.
 */

//var SERVER_URL   = "https://localhost/lnu-teachers-uui.php";
var SERVER_URL = "https://cs.uef.fi/~ec2l/lnu-teacher-uui.php";
//var SERVER_URL = "http://uui-teach.test:8888/lnu-teachers-uui.php";


function postAjaxRequest(url,data, callback) {

    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function (data,result) {
            console.log(data);
            callback(JSON.parse(data),result);
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            callback("error");
        }

    });
}

function getStudents(callback){
    var pilotsite = window.sessionStorage.getItem("sessionId");
    //console.log(pilotsite);
    var data = {"pilotsite":pilotsite,"func":"getStudents"};

    postAjaxRequest(SERVER_URL,data,callback);
}


function submitTask(data,callback) {
    postAjaxRequest(SERVER_URL,data,callback);
}


function getTasks(callback){
    var teacherId = window.sessionStorage.getItem("teacherId");

    var data = {"teacherId":teacherId,"func":"getIndependentTasks"};

    postAjaxRequest(SERVER_URL,data,callback);

}