

function getActivities(pilotSite, responseHandler) {
    if (pilotSite == null || pilotSite == undefined) {
        //window.sessionStorage.setItem("errorStatus", "fail");
        //return;
        //TODO remove this
        pilotSite = 10;
        window.sessionStorage.setItem("pilotsite", 10);
    }


    var formData = new FormData();
    formData.append("func", "getActivities");
    formData.append("pilotSite", pilotSite);

    makeAjaxCall(formData, responseHandler);
}


function getActivityCategories(activityId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "getActivityCategories");
    formData.append("activity", activityId);
    formData.append("pilotSite", window.sessionStorage.getItem('pilotsite'));

    makeAjaxCall(formData, responseHandler);
}

function getCategoryCriterias(categoryId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "getCategoryCriterias");
    formData.append("category", categoryId);

    makeAjaxCall(formData, responseHandler);
}

function getSelfEvaluation(activityId, groupId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "getSelfEvaluation");
    formData.append("activity", activityId);
    formData.append("group", groupId);

    makeAjaxCall(formData, responseHandler);
}

function getCategorySelfEvaluation(activityId, categoryId, groupId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "getCategorySelfEvaluation");
    formData.append("activity", activityId);
    formData.append("category", categoryId);
    formData.append("group", groupId);

    makeAjaxCall(formData, responseHandler);
}

function saveSelfEvaluation(selfEvaluation, groupId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "saveSelfEvaluation");
    selfEvaluation.Group = groupId;
    formData.append("selfEvaluation", JSON.stringify(selfEvaluation));

    makeAjaxCall(formData, responseHandler);
}



/////TEACHER FUNC

function getGroupListForEvaluation(responseHandler) {
    var formData = new FormData();

    formData.append("func", "getGroupListForEvaluation");

    formData.append("pilotSite", window.sessionStorage.getItem('pilotsite'));

    makeAjaxCall(formData, responseHandler);
}

function submitEvaluation(evaluation, responseHandler) {
    var formData = new FormData();

    formData.append("func", "saveEvaluation");
    formData.append("evaluation", JSON.stringify(evaluation));

    makeAjaxCall(formData, responseHandler);
}

function getActivityForEdit(activityId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "getActivityForEdit");
    formData.append("activity", activityId);

    makeAjaxCall(formData, responseHandler);
}

function getAllCategories(responseHandler) {
    var formData = new FormData();

    formData.append("func", "getAllCategories");

    makeAjaxCall(formData, responseHandler);
}

function submitActivity(activity, responseHandler) {
    var formData = new FormData();

    formData.append("func", "submitActivity");
    formData.append("activity", JSON.stringify(activity));

    makeAjaxCall(formData, responseHandler);
}

function submitSeleteActivity(activityId, responseHandler) {
    var formData = new FormData();

    formData.append("func", "deleteActivity");
    formData.append("activity", activityId);

    makeAjaxCall(formData, responseHandler);
}

/////////


function ping(handler) {
    var formData = new FormData();
    formData.append("func", "ping");

    makeAjaxCall(formData, handler);
}

var url = "http://localhost/php/selfEvaluationManager.php"; //'https://cs.uef.fi/~ec2l/WebDocs/SelfEvaluationManger.php'
function makeAjaxCall(formData, handler, async = true) {
    //if (!handler)
    //  handler = successHandler;
    $.ajax({
        url: url,
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData,
        type: 'post',
        async: async,
        success: function (php_script_response) {
            handler(php_script_response);
        }
    });
}

function successHandler(phpResult) {
    console.log(phpResult);
}
