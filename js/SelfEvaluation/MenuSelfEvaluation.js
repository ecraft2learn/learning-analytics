
function initSelfEvaluation() {
    /*analysisObjects.uiConstants.removeContent();*/
    this.createUI();


}

initSelfEvaluation.prototype.createUI = function () {

    var teacherId = getTeacherId();

    analysisObjects.uiConstants.removeContent();
    if (!teacherId) {

        //if not logged-in i prompt the login form
        analysisObjects.uiConstants.removeContent();
        var c = $(analysisObjects.uiConstants.wrapper);

        showLoader();
        var b = isChrome() ? analysisObjects.urls.templateUrl + 'share.html' : 'templates/share.html';
        c.load(b, function () {
            $('#myModal').modal({

                backdrop: 'static',
                keyboard: false

            });

            hideLoader();
        });

    }
};


function initActivitiesForEvaluation() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/GroupsActivityList.html" : "templates/SelfEvaluation/GroupsActivityList.html";
    c.load(b, function () {
        //TODO
    });

}

function initActivities() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/ActivityList.html" : "templates/SelfEvaluation/ActivityList.html";
    c.load(b, function () {


    });
}

function initEditActivity() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/ActivityEditForm.html" : "templates/SelfEvaluation/ActivityEditForm.html";
    c.load(b, function () {


    });

}

function evaluateActivity() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/ActivityEvaluation.html" : "templates/SelfEvaluation/ActivityEvaluation.html";
    c.load(b, function () {

    });
}

function goBack(modalWinToClose, initFunction) {
    $('#' + modalWinToClose).modal();

    //var modalWin = $('#' + modalWinToClose);
    //modalWin.modal('hide');
    $('.modal-backdrop').hide();

    initFunction();
}