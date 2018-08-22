
function initSelfEvaluation() {
    /*analysisObjects.uiConstants.removeContent();
    this.createUI();*/
}

initSelfEvaluation.prototype.createUI = function () {
    /*var c = $(analysisObjects.uiConstants.wrapper);
    
    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/index.html" : "templates/SelfEvaluation/index.html";
    c.load(b, function () {


    });
    hideLoader();*/
};


function initActivitiesForEvaluation() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/GroupsActivityList.html" : "templates/SelfEvaluation/GroupsActivityList.html";
    c.load(b, function () {
        //TODO
    });
    hideLoader();
}

function initActivities() {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/ActivityList.html" : "templates/SelfEvaluation/ActivityList.html";
    c.load(b, function () {


    });
    hideLoader();
}

function evaluateActivity(activityId, groupId) {
    analysisObjects.uiConstants.removeContent();
    var c = $(analysisObjects.uiConstants.wrapper);

    showLoader();
    var b = isChrome() ? analysisObjects.urls.templateUrl + "SelfEvaluation/ActivityEvaluation.html" : "templates/SelfEvaluation/ActivityEvaluation.html";
    c.load(b, function () {

    });
}



/*

"use strict";

const { remote } = require('electron');


function openModal(theUrl) {
  let win = new BrowserWindow({
    parent: remote.getCurrentWindow(),
    modal: true
  })

  //var theUrl = 'file://' + __dirname + '/modal.html'
  console.log('url', theUrl);

  win.loadURL(theUrl);
}*/