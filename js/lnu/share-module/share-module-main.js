/**
 * Created by asoadmin on 2018-10-25.
 */
var studentWorks= [];


function initSharing() {

    //loadCSS('/css/lnu/share-module/cerulean-bootsrap.bootstrap.min.css');
    //console.log(window.sessionStorage);
    var teacher = window.sessionStorage.getItem("teacherId");

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
        //load teacher work
        initTeacherTables();

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
        return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],author:work["USERNAME"],project:work["PRJ_NAME"],status:work["STATUS"],date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn rejectButton' title='Disapprove' data-toggle='tooltip' data-placement='top' title='disapprove'><span class='glyphicon glyphicon-remove-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button> "};
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
                data:"title",
                className:"text-left"
            },
            {   targets:4,
                data:"keywords",
                width: "10%",
                className:"text-left"
            },
            {   targets:5,
                data:"author",
                className:"text-left"
            },
            {   targets:6,
                data:"project",
                className:"text-left"
            },
            {   targets:7,
                data:"status",
                className:"text-left"
            },
            {   targets:8,
                data:"date",
                className:"text-left"
            },
            {
                targets: 9,
                data: "action",
                width: "17%"
                //defaultContent:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn rejectButton' title='Disapprove' data-toggle='tooltip' data-placement='top' title='disapprove'><span class='glyphicon glyphicon-remove-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"
            }


        ]});

    // {
    //     targets: -1,
    //         data: null,
    //     width: "17%",
    //     defaultContent:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn rejectButton' title='Disapprove' data-toggle='tooltip' data-placement='top' title='disapprove'><span class='glyphicon glyphicon-remove-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"
    // }

     for(var i=0;i<data.length;i++){
         studentTable.row.add({id:data[i].id,description:data[i].description,file_path:data[i].file_path,title:data[i].title,keywords:data[i].keywords,author:data[i].author,project:data[i].project,status:m_createStatusIndicator(data[i].status),date:data[i].date,action:data[i].action}).draw( false );
     }


    // Activate data tables action button tooltips

    $(".icon_info").tooltip();

    // Sum the count of awaiting items in the top tab
    updateAwaitingCount();

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

        var row = studentTable.row( $(this).parents('tr') );
        var data = row.data();
        rejectStudentsWork(data.id,function (result) {
            if(result["RESULT"]==="SUCCESS"){
                updateStatusWorkInTable("2",data,row);
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
                updateAwaitingCount()
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


function sumAwaitingCount() {
    var remCount = parseInt(document.getElementById("removalCount").textContent) || 0;
    var appCount = parseInt(document.getElementById("approvalCount").textContent) || 0;
    return remCount + appCount;
}

function updateAwaitingCount() {
    var awaitCount = sumAwaitingCount();
    //console.log(awaitCount);
    if (awaitCount > 0) {
        var topTab = document.getElementById("studentWorkTab");
        if (topTab.children.length > 0) {
            topTab.removeChild(topTab.children[0]);
        }
        topTab.innerHTML += " ";
        var span = document.createElement("span");
        span.classList.add("badge");
        span.textContent = awaitCount;
        topTab.appendChild(span);
    } else {
        var topTab = document.getElementById("studentWorkTab");
        if(topTab.children.length>0){
           topTab.removeChild(topTab.children[0]);
        }
    }
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
    updateAwaitingCount()
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

function activateCurrentNavPill(target) {
    target = target.closest("a").parentNode;
    var pills = document.getElementById("lnu-ts").getElementsByClassName("nav-pills");
    for(var i = 0; i < pills[0].children.length; i++) {
        pills[0].children[i].classList.remove("active");
    }
    target.classList.add("active");
}

function showAllWork(event) {
    activateCurrentNavPill(event.target);
    event.preventDefault();
    //prepare data for datatable
    var data = studentWorks.map(function(work) {
        return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn rejectButton' title='Disapprove' data-toggle='tooltip' data-placement='top' title='disapprove'><span class='glyphicon glyphicon-remove-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"};
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

function showRemovalWork(event) {
    activateCurrentNavPill(event.target);
    event.preventDefault();
    //prepare data for datatable
    var removalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="3";
    });

    if(removalWorks.length>0){

        var data = removalWorks.map(function(work) {
            return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"};
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

function showApprovalWork(event){

    activateCurrentNavPill(event.target);
    event.preventDefault();
    //prepare data for datatable

    var approvalWorks = studentWorks.filter(function(work){
        return work["STATUS"]==="0";
    });
    var data = [];

    if(approvalWorks.length>0){
        var data = approvalWorks.map(function(work) {
            return {id:work["ID"],description:work["DESCRIPTION"],title:work["TITLE"],keywords:work["KEYWORDS"],file_path:work["FILE_PATH"],author:work["USERNAME"],project:work["PRJ_NAME"],status:m_createStatusIndicator(work["STATUS"]),date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn approveButton' title='Approve' data-toggle='tooltip' data-placement='top' title='Approve'><span class='glyphicon glyphicon-ok-sign'></span></button><button type='button' class='icon_info btn rejectButton' title='Disapprove' data-toggle='tooltip' data-placement='top' title='disapprove'><span class='glyphicon glyphicon-remove-sign'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"};
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
            span.classList.add("sharing-status-awaiting-removal");
            span.textContent = "Pending authorization to stop sharing";
            break;

        default:
            break;
    }
    //console.log(span.outerHTML);
    return span.outerHTML;
}


/**
 * TEACHERS SHARING TAB
 */

var teacherWorks=[];
var teacherPublicWorks=[];
function initTeacherTables(){
    //load teachers work
    getTeacherWork(function(result){
        console.log(result);
        if(result["DATA"]!=undefined){
            //generate teacher my work table
            teacherWorks = result["DATA"];
            generateMyWorkTable();
        }
    });

    getTeachersPublicWork(function(result){
        console.log(result);
        if(result["DATA"]!=undefined){
            teacherPublicWorks=result["DATA"];
            generatePublicWorkTable();
        }
    });
}


/*Show teachers shared work*/
function showMyWork(event){

    $('#myWorkContent').show();
    $('#publicWorkContent').hide();

    if(event!=undefined){
        //activateCurrentNavPill(event.target);
        event.preventDefault();
    }


    getTeacherWork(function(result){
        console.log(result);
        if(result["DATA"]!=undefined){
            //generate teacher my work table
            teacherWorks = result["DATA"];
            //prepare data for datatable
            var data = teacherWorks.map(function(work) {
                return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"};
            });
            if(data.length>0){

                $('#teachersMyWork').dataTable().fnClearTable();
                $('#teachersMyWork').dataTable().fnAddData(data);
            }
            else{
                //show message no data available
                $('#teachersMyWork').dataTable().fnClearTable();
            }
        }
    });




}
var myWorkTable;
function generateMyWorkTable(){
    //select inrested data to show in the table
    var data = teacherWorks.map(function(work) {
        return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],date:work["TIME_STAMP"],action:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button><button type='button' class='icon_info btn removeButton' title='Remove' data-toggle='tooltip' data-placement='top' title='Remove'><span class='glyphicon glyphicon-trash'></span></button>"};
    });
    myWorkTable = $('#teachersMyWork').DataTable({
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
                data:"file_path"
            },
            {   targets:2,
                data:"title",
                className:"text-left"
            },
            {   targets:3,
                data:"description",
                className:"text-left"
            },
            {   targets:4,
                data:"keywords",
                width: "10%",
                className:"text-left"
            },
            {   targets:5,
                data:"date",
                className:"text-left"
            },
            {
                targets: 6,
                data: "action",
                width: "17%"
            }


        ]});

    for(var i=0;i<data.length;i++){
        myWorkTable.row.add({id:data[i].id,file_path:data[i].file_path,title:data[i].title,description:data[i].description,keywords:data[i].keywords,date:data[i].date,action:data[i].action}).draw( false );
    }


    // Activate data tables action button tooltips

    $(".icon_info").tooltip();

    // Sum the count of awaiting items in the top tab
    updateAwaitingCount();

    //ROW SELECTION, SHOW DESCRIPTION OF THE FILE
    $('#teachersMyWork tbody').on( 'click', 'tr', function () {
        $(this).removeClass('hoverToolTip');
        $(this).removeAttr('data-container');
        $(this).removeAttr('data-toggle');
        $(this).removeAttr('title');
        $(this).removeAttr('data-placement');


        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            myWorkTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            $(this).addClass('hoverToolTip');
            $(this).attr('data-container','body');
            $(this).attr('data-toggle','tooltip');

            $(this).attr('data-placement','bottom');

            var rowData = myWorkTable.row($(this)).data();

            $('.hoverToolTip').tooltip();
            $(this).attr('title',rowData.description);
            //TODO: show work description

        }
    } );




    $('#teachersMyWork tbody').on( 'click', 'button.removeButton', function () {

        var row = myWorkTable.row( $(this).parents('tr') );
        var data = row.data();
        removeStudentsWork(data.id,function (result) {
            if(result["RESULT"]==="SUCCESS"){
                //remove row in the table
                row.remove().draw();
            }
            else{

            }
        });

    } );

    $('#teachersMyWork tbody').on( 'click', 'button.downloadButton', function () {

        var data = myWorkTable.row( $(this).parents('tr') ).data();

        var filename = data.file_path.split("/")[1];
        download(filename)

    } );
}


/**
 * SHOW TEACHERS PUBLIC WORK
 */
function showTeachersPublicWork(event){
    $('#myWorkContent').hide();
    $('#publicWorkContent').show();

    //activateCurrentNavPill(event.target);
    if(event!=undefined){
        event.preventDefault();
    }



    getTeachersPublicWork(function(result){
        console.log(result);
        if(result["DATA"]!=undefined){
            teacherPublicWorks=result["DATA"];

            //prepare data for datatable
            var data = teacherPublicWorks.map(function(work) {
                return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],author:work["USERNAME"],date:work["TIME_STAMP"],action:""};
            });
            if(data.length>0){

                $('#publicWork').dataTable().fnClearTable();
                $('#publicWork').dataTable().fnAddData(data);
            }
            else{
                //show message no data available
                $('#publicWork').dataTable().fnClearTable();
            }
        }
    });



}

/**
 * Generate public work table
 * @param publicWorks
 */
var publicWorkTable;
function generatePublicWorkTable(){
    //select inrested data to show in the table
    var data = teacherPublicWorks.map(function(work) {
        return {id:work["ID"],description:work["DESCRIPTION"],file_path:work["FILE_PATH"],title:work["TITLE"],keywords:work["KEYWORDS"],author:work["USERNAME"],date:work["TIME_STAMP"],action:""};
    });
    publicWorkTable = $('#publicWork').DataTable({
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
                data:"file_path"
            },
            {   targets:2,
                data:"title",
                className:"text-left"
            },
            {   targets:3,
                data:"description",
                className:"text-left"
            },
            {   targets:4,
                data:"keywords",
                width: "10%",
                className:"text-left"
            },
            {   targets:5,
                data:"author",
                width: "10%",
                className:"text-left"
            },
            {   targets:6,
                data:"date",
                className:"text-left"
            },
            {
                targets: 7,
                data: null,
                width: "17%",
                defaultContent:"<button type='button' class='icon_info btn downloadButton' title='Download' data-toggle='tooltip' data-placement='top' title='Download'><span class='glyphicon glyphicon-download-alt'></span></button>"
            }


        ]});

    for(var i=0;i<data.length;i++){
        publicWorkTable.row.add({id:data[i].id,file_path:data[i].file_path,title:data[i].title,description:data[i].description,keywords:data[i].keywords,author:data[i].author,date:data[i].date,action:data[i].action}).draw( false );
    }


    // Activate data tables action button tooltips

    $(".icon_info").tooltip();

    // Sum the count of awaiting items in the top tab
    updateAwaitingCount();

    //ROW SELECTION, SHOW DESCRIPTION OF THE FILE
    $('#publicWork tbody').on( 'click', 'tr', function () {
        $(this).removeClass('hoverToolTip');
        $(this).removeAttr('data-container');
        $(this).removeAttr('data-toggle');
        $(this).removeAttr('title');
        $(this).removeAttr('data-placement');


        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            publicWorkTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            $(this).addClass('hoverToolTip');
            $(this).attr('data-container','body');
            $(this).attr('data-toggle','tooltip');

            $(this).attr('data-placement','bottom');

            var rowData = publicWorkTable.row($(this)).data();

            $('.hoverToolTip').tooltip();
            $(this).attr('title',rowData.description);
            //TODO: show work description

        }
    } );


    $('#publicWork tbody').on( 'click', 'button.downloadButton', function () {

        var data = publicWorkTable.row( $(this).parents('tr') ).data();

        var filename = data.file_path.split("/")[1];
        download(filename)

    } );
}


/**
 * SHARE TEACHER WORK
 */
function shareMyWorkForm(){
     $('#myWorkContent').hide();
     $('#sharingForm').show();

     $("#sharingForm").submit(shareFile);

}


/**
 * Share local file
 * @param event
 */
function shareFile(event) {
    event.preventDefault();
    var formData = $("#sharingForm").serializeArray();
    shareTeacherWork(formData,function(result){
        console.log(result);
        if(result==="success"){
            //clear sharing form
            $('#sharingForm').find("input[type=text], textarea,span").val("");
            //show success message

        }
    })


}

/**
 * Cancel sharing file
 */
function cancelSharing(){

    $('#sharingForm').hide();
    //clear sharing form
    $('#sharingForm').find("input[type=text], textarea,span").val("");
    //refresh table
    showMyWork();
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
