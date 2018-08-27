function drawTables(result) {
    var list = JSON.parse(result);
    var html = "";
    var grouppedData = groupData(list.DATA);
    $.each(grouppedData, function (index, element) {

        if (element) {
            html += " <div class=\"activity col-xs-5\" id=\"" + element.ActivityId + "\"> <h2>" + element.ActivityTitle + "</h2>  <table class=\"table table-hover\"> <thead> <tr > <th>Group name</th> <th>Self-evaluation submission date</th>  <th>Evaluation submission date</th>  </tr> </thead> <tbody>";

            $.each(element.Evaluations, function (i, row) {
                html += "<tr id=\"" + row.GroupId + "\" onclick=\"evaluateGroup(" + element.ActivityId + "," + row.GroupId + ")\">";
                html += "<td>" + row.GroupName + "</td>";
                html += "<td>" + row.GroupSubmissionDate + "</td>";
                if (row.TeacherSubmissionDate)
                    html += "<td>" + row.TeacherSubmissionDate + "</td>";
                else
                    html += "<td> - </td>";
                html += "</tr>";
            });
            html += "</tbody> </table> </div>";
        }
    });

    $("#data").append(html);

    hideLoader();
}


function groupData(data) {
    if (data) {
        var gruppedData = [];

        $.each(data, function (index, element) {
            if (!gruppedData[element.ActivityId])
                gruppedData[element.ActivityId] = {
                    ActivityId: element.ActivityId,
                    ActivityTitle: element.ActivityTitle,
                    Evaluations: []
                };
            gruppedData[element.ActivityId].Evaluations.push({
                GroupId: element.GroupId,
                GroupName: element.GroupName,
                GroupSubmissionDate: element.GroupSubmissionDate,
                TeacherSubmissionDate: element.TeacherSubmissionDate
            });
        });

        return gruppedData;
    }
}

function evaluateGroup(activityId, groupId) {
    window.sessionStorage.setItem("evaluatedGroup", groupId);
    window.sessionStorage.setItem("evaluatedActivity", activityId);

    evaluateActivity();
}