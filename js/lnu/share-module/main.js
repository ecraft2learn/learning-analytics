/**
 * Created by asoadmin on 2018-10-25.
 */
var studentWorks= [];


function init() {
    //loadCSS('/css/lnu/share-module/cerulean-bootsrap.bootstrap.min.css');
    //console.log(window.sessionStorage);
    var teacher = window.sessionStorage.getItem("teacherId");
    console.log(teacher);
    if (teacher == null) {

        //show login dialog
        $('#loginModal').modal({

            backdrop: 'static',
            keyboard: false

        });

        $("#loginModal").on("hidden.bs.modal", function () {

            if (window.sessionStorage.getItem("teacherId") == null) {
                // put your default event here
                $("#warning-message").removeClass("hidden");
            }
            else {
                $("#warning-message").addClass("hidden");
                //show content
                $("#mainContent").removeClass("hidden");
            }

        });
    }
    else{
        //show content
        showContent();

}


function showContent() {

    getStudentsWork(function(result){
        if(result["DATA"]!=undefined){


            //count works for approval
            var approvalWorks = result["DATA"].filter(function(work){
                return work["STATUS"]==="0";
            });
            if(approvalWorks.length>0){
                $('#approvalCount').text(approvalWorks.length);
            }


            //count works for removal
            var removalWorks = result["DATA"].filter(function(work){
                return work["STATUS"]==="3";
            });
            if(removalWorks.length>0){
                $('#removalCount').text(removalWorks.length);
            }

            studentWorks = result["DATA"];

            var data = studentWorks.map(function(work) {
                return {title:work["TITLE"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:""};
            });

            //init data table
            $('#studentWork').DataTable({
                data:data,
                columns:[
                    { data: 'title' },
                    { data: 'author' },
                    { data: 'project' },
                    { data: 'status' },
                    { data: 'date' },
                    { data: 'action' }
                ]
            });



        }
    });

}
}


function showAllWork() {

    //prepare data for datatable
    var data = studentWorks.map(function(work) {
        return {id:work["ID"],title:work["TITLE"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:""};
    });
    if(data.length>0){

        $('#studentWork').dataTable().fnClearTable();
        $('#studentWork').dataTable().fnAddData(data);
    }
    else{
        //show message no data available
        $('#studentWork').dataTable().fnClearTable();
    }




}

function showRemovalWork() {
//prepare data for datatable

    var removalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="3";
    });

    if(removalWorks.length>0){

        var data = removalWorks.map(function(work) {
            return {id:work["ID"],title:work["TITLE"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:""};
        });
        //update data table

        $('#studentWork').dataTable().fnClearTable();
        $('#studentWork').dataTable().fnAddData(data);
    }
    else{
        //show message no data available
        $('#studentWork').dataTable().fnClearTable();
    }

}

function showApprovalWork(){

    //prepare data for datatable

    var approvalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="0";
    });
    var data = [];

    if(approvalWorks.length>0){
        var data = approvalWorks.map(function(work) {
            return {id:work["ID"],title:work["TITLE"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:""};
        });
        //update data table
        $('#studentWork').dataTable().fnClearTable();
        $('#studentWork').dataTable().fnAddData(data);
    }
    else{
        //show message no data available
        $('#studentWork').dataTable().fnClearTable();
    }




}



/**
 * USER LOGIN
 */

function userLogin() {
    console.log("here");
    var email = $('#inputEmail').val();
    var pw = $('#inputPassword').val();

    $.ajax({

        type: 'POST',
        url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/login_teacher_pilot_2.php',
        data: 'username=' + email + '&password=' + pw,
        success: function (data) {

            if (!isNaN(data)) {

                window.sessionStorage.setItem("teacherId", data);
                $('#loginModal').modal('hide');
                init();



            } else {

                alert('Not a valid username or a password.');

            }

        },
        error: function (error) {


        }

    });

}


function loadCSS (href) {

    var cssLink = $("<link>");
    $("head").append(cssLink); //IE hack: append before setting href

    cssLink.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: href
    });

}