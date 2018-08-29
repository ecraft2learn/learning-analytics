function addActivities(result) {

    var list = JSON.parse(result);

    for (i = 0; i < list.DATA.length; i++) {
        var riga = list.DATA[i];

        var html = "<div class=\"grid-item\"> <div class=\"activity\"> <div class=\"activityHeader\">";
        html += " <h4>" + riga.Title + "</h4> </div>";
        html += "<div class=\"activityBody\">" + riga.Description + " </div>";

        //footer
        html += " <div class=\"activityFooter row-fluid\"> <div class=\"btn-group btn-group-sm\" role=\"group\">";
        html += "<button type=\"button\" class=\"btn btn-primary\" onclick=\"editActivity(" + riga.Id + ")\"><span class='glyphicon glyphicon-pencil'></span>&nbsp; Edit activity</button>";
        html += " <button type=\"button\" id='delete-" + riga.Id + "' data-toggle='tooltip' title='' class=\"btn btn-default\" onclick=\"confirmDeleteActivity(" + riga.Id + ")\"><span class='glyphicon glyphicon-trash'></span>&nbsp; Delete activity</button>";
        html += "</div> </div> ";

        //activity card end
        html += "</div> </div>";

        $('#tileGrid').append(html);
    }

    getEvaluatedActivities(getTeacherId(), disableEvaluatedActivities);

    hideLoader();
}

function disableEvaluatedActivities(result) {
    var list = JSON.parse(result);

    for (i = 0; i < list.DATA.length; i++) {
        var riga = list.DATA[i];

        $('#delete-' + riga.Id).prop("disabled", true);
        $('#delete-' + riga.Id).prop("title", "You can't delete an activity if is present an evaluation!");
    }

    $("[data-toggle='tooltip']").tooltip();
}

function confirmDeleteActivity(activityId) {
    window.sessionStorage.setItem("evaluatedActivity", activityId);
    $("#deleteConfirmModal").modal();
}

function editActivity(activityId) {
    window.sessionStorage.setItem("evaluatedActivity", activityId);

    initEditActivity();
}

function deleteActivity() {
    submitSeleteActivity(getActivityId(), initActivities);
}

function newActivity() {
    window.sessionStorage.setItem("evaluatedActivity", -1);

    initEditActivity();
}



