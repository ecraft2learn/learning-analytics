function addCategories(phpResult) {

    var categoryList = JSON.parse(phpResult);

    $.each(categoryList.DATA, function (index, category) {
        $('#categoryList').append('<li name="category.Id" id="li-' + category.Id + '" onClick="checkCategory(' + category.Id + ')" class="category">' + category.Name + '</li> ');
    });

    getActivityForEdit(getActivityId(), fillActivityForm);
}

function addActivityCriterias(phpResults) {

    var criterias = JSON.parse(phpResults);


    if (criterias.DATA[0]) {
        var category = criterias.DATA[0];
        if (!document.getElementById('criteria-' + category.CategoryName + '-' + category.CategoryId)) {

            var html = '<ul class=\'criteria-ul\' id=\'criteria-' + category.CategoryName + '-' + category.CategoryId + '\'>';
            for (let i = 0; i < criterias.DATA.length; i++) {

                var category = criterias.DATA[i];


                //for (let j = 0; j < category.content.length; j++) {

                html += '<li onclick=\'checkCriteria(criteria-content-' + category.Id + ')\' id=\'criteria-content-' + category.Id + '\'>' + category.Name + '</li>';

                //}


            }
            html += '</ul>';

            $('#criteriaContainer').append(html);

        } else {

            $('#criteria-' + category.CategoryName + '-' + category.CategoryId).remove(); // toggle

        }

    }
}


function getCriterias() {

    let $criterias = $('.criterial-ul');

    let criterias = [];

    for (let i = 0; i < $criterias.length; i++) {

		let ul = $($criterias[i]).attr('id');

        let $li = $('#' + ul + ' li.checked');

        let criteria = ul.split('-')[1];

        let id = ul.split('-')[2];

        let obj = { category: criteria, id: id, content: [] };

        for (let j = 0; j < $li.length; j++) {

			obj.content.push($($li[i]).text());	

        }

        criterias.push(obj);

    }

    return JSON.stringify(criterias);

}

function postCriterias(array) {

    $.ajax({

        type: '',
        url: '',
        data: 'data=' + data,
        success: (data) => {


        },
        error: (error) => {

            console.log(error);

        }

    });

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

    //let request = 'category=' + liId;

    criterias(liId);

}

function checkCriteria(id) {

    $('#' + id).toggleClass('checked');

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
