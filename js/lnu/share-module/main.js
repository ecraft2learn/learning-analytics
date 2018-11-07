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
    else {
        //show content
        showContent();

    }
}


function showContent() {

    getStudentsWork(function(result){
        if(result["DATA"]!=undefined){

            studentWorks = result["DATA"];
            updateApprovalWork();
            updateRemovalWork();
            generateStudentWorkTable();

        }
    });

}


function generateStudentWorkTable(){
    //select inrested data to show in the table
    var data = studentWorks.map(function(work) {
        return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:""};
    });
    studentTable = $('#studentWork').DataTable({
        select:true,
        searching:true,

        columnDefs: [
            {   targets:0,
                visible: false,
                searchable: false,
                data:"id"

            },
            {   targets:1,
                visible: false,
                searchable: false,
                data:"description"

            },
            {   targets:2,
                visible: false,
                searchable: false,
                data:"file_path"

            },
            {   targets:3,
                data:"title"

            },
            {   targets:4,
                data:"keywords"

            },
            {   targets:5,
                data:"author"

            },
            {   targets:6,
                data:"project"

            },
            {   targets:7,
                data:"status"

            },
            {   targets:8,
                data:"date"

            },

            {
                targets: -1,
                data: null,
                width: "17%",
                defaultContent:"<button type='button' class='btn downloadButton' title='Download' ><span class='glyphicon glyphicon-download-alt' ></span></button><button type='button' class='btn approveButton' title='Approve' ><span class='glyphicon glyphicon-ok-sign' ></span></button><button type='button' class='btn rejectButton' title='Disapprove'><span class='glyphicon glyphicon-remove-sign' ></span></button> <button type='button' class='btn  removeButton' title='Remove'><span class='glyphicon glyphicon-trash' ></span></button>  "
            }
        ]});


     for(var i=0;i<data.length;i++){
         studentTable.row.add({id:data[i].id,description:data[i].description,file_path:data[i].file_path,title:data[i].title,keywords:data[i].keywords,author:data[i].author,project:data[i].project,status:m_createStatusIndicator(data[i].status),date:data[i].date,action:""}).draw( false );
     }
    //setup the table
    /*studentTable = $('#studentWork').DataTable({
        data:data,
        select:true,
        searching:true,
        columns:[
            { data: 'id',visible:false},
            { data: 'description',visible:false},
            { data:'file_path',visible:false},
            { data: 'title' },
            { data:'keywords'},
            { data: 'author' },
            { data: 'project' },
            { data: 'status'},
            { data: 'date' },
            { data: 'action' , searchable:false,orderable: false, data:null}
        ],
        columnDefs: [
            {
                "targets": -1,
                "data": null,
                "defaultContent":"<button type='button' class='btn downloadButton' title='Download' ><span class='glyphicon glyphicon-download-alt' ></span></button><button type='button' class='btn approveButton' title='Approve' ><span class='glyphicon glyphicon-thumbs-up' ></span></button><button type='button' class='btn rejectButton' title='Disapprove'><span class='glyphicon glyphicon-thumbs-down' ></span></button> <button type='button' class='btn  removeButton' title='Remove'><span class='glyphicon glyphicon-trash' ></span></button>  "
            }
        ]
    });*/

    //ROW SELECTION, SHOW DESCRIPTION OF THE FILE
    $('#studentWork tbody').on( 'click', 'tr', function () {
        $(this).removeClass('hoverToolTip');
        $(this).removeAttr('data-container');
        $(this).removeAttr('data-toggle');
        $(this).removeAttr('title');
        $(this).removeAttr('data-placement');


        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            studentTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            $(this).addClass('hoverToolTip');
            $(this).attr('data-container','body');
            $(this).attr('data-toggle','tooltip');

            $(this).attr('data-placement','bottom');

            var rowData = studentTable.row($(this)).data();

            $('.hoverToolTip').tooltip();
            $(this).attr('title',rowData.description);
            //TODO: show work description

        }
    } );

    //ACTION BUTTONS HANDLERS
    $('#studentWork tbody').on( 'click', 'button.approveButton', function () {
        var row = studentTable.row( $(this).parents('tr') );
        var data = row.data();
        //console.log(data);
        approveStudentsWork(data.id,function (result) {

            if(result["RESULT"]==="SUCCESS"){
                updateStatusWorkInTable("1",data,row);

            }
            else{
                //TODO:show message something wrong happend
            }
        });
    } );

    $('#studentWork tbody').on( 'click', 'button.rejectButton', function () {
        console.log("here");
        var row = studentTable.row( $(this).parents('tr') );
        var data = row.data();
        rejectStudentsWork(data.id,function (result) {
            if(result["RESULT"]==="SUCCESS"){
                updateStatusWorkInTable("3",data,row);
            }
            else{
                //TODO:show message something wrong happend
            }
        });

    } );

    $('#studentWork tbody').on( 'click', 'button.removeButton', function () {

        var row = studentTable.row( $(this).parents('tr') );
        var data = row.data();
        removeStudentsWork(data.id,function (result) {
            if(result["RESULT"]==="SUCCESS"){
                //remove work from studentWork
                removeElement(data.id);
                //remove row in the table
                row.remove().draw();

            }
            else{

            }
        });


    } );

    $('#studentWork tbody').on( 'click', 'button.downloadButton', function () {

        var data = studentTable.row( $(this).parents('tr') ).data();

        var filename = data.file_path.split("/")[1];
        download(filename)

    } );

}


function updateStatusWorkInTable(status,data,row){
    //update data
    var workIndex = studentWorks.findIndex(function(work){
        return work["ID"]===data.id;
    });

    if(workIndex>-1){

            studentWorks[workIndex]["STATUS"] = status;
            updateApprovalWork();
            updateRemovalWork();
    }

    // update table
    data.status =m_createStatusIndicator(status);
    row.data(data).invalidate();
}

function removeElement(id){
    var workIndex = studentWorks.findIndex(function(work){
        return work["ID"]===id;
    });
    console.log(workIndex);
    if(workIndex>-1){
        studentWorks.splice(workIndex, 1);
    }
    updateRemovalWork();

}

function updateRemovalWork() {
    //count works for removal
    var removalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="3";
    });

    if(removalWorks.length>0){
        $('#removalCount').text(removalWorks.length);
    }
    else{
        $('#removalCount').text("");
    }

}

function updateApprovalWork(){

    //count works for approval
    var approvalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="0";
    });

    if(approvalWorks.length>0){
        $('#approvalCount').text(approvalWorks.length);
    }
    else{
        $('#approvalCount').text("");
    }

}


function showAllWork() {

    //prepare data for datatable
    var data = studentWorks.map(function(work) {
        return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:""};
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
            return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:""};
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
            return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:""};
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
 * Creates the status indicator
 *
 * @param content : String - The selected string that should be in a table cell
 */
function m_createStatusIndicator(content) {

    var span = document.createElement("span");
    span.classList.add("sharing-status-indicator");



    switch (content) {
        case "0":
            span.textContent = "Pending authorization";
            break;

        case "1":
            span.classList.add("sharing-status-approved");
            span.textContent = "Authorized";
            break;

        case "2":
            span.classList.add("sharing-status-rejected");
            span.textContent = "Authorization rejected";
            break;

        case "3":
            span.classList.add("sharing-status-awaiting-removal")
            span.textContent = "Pending authorization to stop sharing";
            break;

        default:
            break;
    }
    //console.log(span.outerHTML);
    return span.outerHTML;
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
