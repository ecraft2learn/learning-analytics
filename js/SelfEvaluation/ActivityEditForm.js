function addCategories(phpResult) {

    var categoryList = JSON.parse(phpResult);

    $.each(categoryList.DATA, function (index, category) {
        $('#categoryList').append('<li name="category.Id" id="li-' + category.Id + '" onClick="checkCategory(' + category.Id + ')" class="category">' + category.Name + '</li> ');
    });

    getActivityForEdit(getActivityId(), fillActivityForm);
}



function fillActivityForm(phpResult) {

    var activity = JSON.parse(phpResult);


    if (activity.DATA) {
        $('#activityTitle').val(activity.DATA[0].Title);
        $('#activityDesc').val(activity.DATA[0].Description);
    }

    $.each(activity.DATA, function (index, category) {
        checkCategory(category.CategoryId);
    });

    hideLoader();
}

function checkCategory(liId) {
    $('#li-' + liId).toggleClass('checked');
}


function saveActivity() {
    var activity = {
        Id: getActivityId(),
        Pilotsite: getPilotsite(),
        Title: $('#activityTitle').val(),
        Description: $('#activityDesc').val(),
        Teacher: getTeacherId(),
        Categories: []
    };

    $.each($('li.checked'), function (i, category) {

        var category = category.id;
        category = category.split("-")[1];

        activity.Categories.push(category);
    });

    submitActivity(activity, successfulActivitySubmit);
}

function successfulActivitySubmit(phpResult) {
    window.sessionStorage.setItem("evaluatedActivity", phpResult);

    $('#saveCompleteModal').modal();
}


function SelectAll() {

    $.each($('li.category').not('.checked'), function (i, category) {

        var category = category.id;
        category = category.split("-")[1];

        checkCategory(category);

    });
}


function DeselectAll() {

    $.each($('li.checked'), function (i, category) {
        var category = category.id;
        category = category.split("-")[1];

        checkCategory(category);
    });
}