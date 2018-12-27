/**
 * This file implements main functionality of call4action module
 */

function init() {
    var { id: teacherId } = Share.getInstance();
    if (!teacherId) {
        //show login dialog
        $('#loginModal').modal({

            backdrop: 'static',
            keyboard: false

        });

        $("#loginModal").on("hidden.bs.modal", function () {
            var { id: teacherId } = Share.getInstance();
            if (!teacherId) {
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
        $("#mainContent").removeClass("hidden");
        $('[data-toggle="popover"]').popover();
        $(".icon_info").tooltip();

        initStudentTable();

        //Dependent Task
        //dynamically generate list of tasks
        $('input[type=radio][name=task-type]').change(function () {
            console.log(this.value);
            if (this.value === '1') {
                document.getElementById("taskDiv").classList.remove("hidden");

                getTasks(function (tasks) {
                    generateTaskTable(tasks["DATA"]);
                });
            }
            else {
                document.getElementById("taskDiv").classList.add("hidden");
            }
        });


    }

    /**
     * SUBMIT TASK
     */
    document.getElementById("submit-btn").addEventListener('click', function () {

        var form = document.getElementById("taskForm");
        if (form.checkValidity()) {


            //check if any students were selected
            if ($('table.table.table-striped :checkbox:checked').length > 0) {
                $("#select-error-message").addClass("hidden");

                var formData = $('#taskForm').serializeArray();
                //check if select all in the data, remove it
                var data = formData.filter(function (el) {
                    return el.name !== "select-all";
                });

                //prepare data to be send on server
                var taskName = formData.find(function (obj) {
                    return obj.name === "title";
                });
                var taskDescription = formData.find(function (obj) {
                    return obj.name === "description";
                });
                var studentIDs = formData.filter(function (obj) {
                    return obj.name === "student";

                }).map(function (students) {
                    return students.value;
                });

                var taskType = formData.find(function (obj) {
                    return obj.name === "task-type";
                });

                var isReflection = 0;
                //check if this task is Reflection task
                if ($('#reflection-checkbox').is(":checked")) {
                    isReflection = 1;
                }
                console.log(isReflection);


                //check if it is dependent task, if task choosen fomr the list

                if (taskType.value === "1") {
                    if ($("#taskList").val() === "0") {
                        //show error message
                        $("#task-error-message").removeClass("hidden");

                    }
                    else {
                        $("#task-error-message").addClass("hidden");
                        var taskId = $("#taskList").val();

                        //autogenerate additional text "Note! This task can be done after Task Name"
                        var subtitle = "Note! This task can be done after <b>" + $("#taskList option:selected").text() + "</b>";

                        var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        var preparedData = { "subtitle": subtitle, "taskId": taskId, "func": "addTask", "type": taskType.value, "taskName": taskName.value, "taskDescription": taskDescription.value, "teacherId": window.sessionStorage.getItem("teacherId"), "pilotsite": window.sessionStorage.getItem("sessionId"), "students": studentIDs, "status": 0, "timestamp": timestamp,"isReflection":isReflection };

                        console.log(preparedData);
                        submitTask(preparedData, function (result) {
                            //clear form data
                            $("#taskForm").find("input[type=text], textarea").val("");
                            emptyCheckboxes();

                            //show success notification
                            if (result["RESULT"] === "SUCCESS") {
                                showMessage("Task was created successfully!", "alert-success");

                            }
                            else {
                                showMessage("Some issue is occurred, please try again later.", "alert-danger");
                            }
                            document.getElementById("taskDiv").classList.add("hidden");
                        });
                    }
                }
                else {




                    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    var preparedData = { "subtitle": "", "taskId": -1, "func": "addTask", "type": taskType.value, "taskName": taskName.value, "taskDescription": taskDescription.value, "teacherId": window.sessionStorage.getItem("teacherId"), "pilotsite": window.sessionStorage.getItem("sessionId"), "students": studentIDs, "status": 0, "timestamp": timestamp,"isReflection":isReflection };


                    submitTask(preparedData, function (result) {
                        //clear form data
                        $("#taskForm").find("input[type=text], textarea").val("");
                        emptyCheckboxes();
                        //show success notification
                        if (result["RESULT"] === "SUCCESS") {
                            showMessage("Task was created successfully!", "alert-success");
                        }
                        else {
                            showMessage("Some issue is occurred, please try again later.", "alert-danger");
                        }
                    });
                }

            }
            else {
                $("#select-error-message").removeClass("hidden");
            }



        }
        else {

            form.querySelector('button[type="submit"]').click();
        }
    }, false);



}



function initStudentTable() {

    getStudents(function (students) {
        //console.log(students.length);
        //console.log(students);
        if (students == "error") {
            displayErrorMsg();
        } else {
            console.log(students);
            generateStudentTable(students["DATA"]);
        }
    });

    //column checkbox select all or cancel
    $("input.select-all").click(function () {
        var checked = this.checked;
        $("input.select-student").each(function (index, item) {
            item.checked = checked;
        });
        markSelectedStudents();
        $('input.select-all').tooltip('hide');
    });

    // Event delegation on tbody to minimise eventlisteners needed 
    // (if list is large this might have impact)
    // Simply checks the checkbox on the row you click, event.target.closest 
    // makes sure that it doesn't matter where on the element you click
    // It doesn't perform the checking logic if you click on the actual checkbox

    document.getElementById("studentTable").getElementsByTagName("tbody")[0].addEventListener("click", function (event) {
        if (event.target.tagName !== "INPUT") {
            var checkbox = event.target.closest("tr").getElementsByTagName("input")[0];
            if (checkbox.checked) {
                checkbox.checked = false;
                event.target.closest("tr").classList.remove("success");
            } else {
                checkbox.checked = true;
                event.target.closest("tr").classList.add("success");
            }
        } else {
            markSelectedStudents();
        }
    });
}

// Mark the table row of all student entries with checked checkbox
// Unmark the table row of all student entries with unchecked checkbox
function markSelectedStudents() {
    var rows = document.getElementById("studentTable").getElementsByTagName("tbody")[0].children;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].firstElementChild.firstElementChild.checked == true) {
            rows[i].classList.add("success");
        } else {
            rows[i].classList.remove("success");
        }
    }
}

function generateStudentTable(students) {
    var table = document.getElementById("studentTable").getElementsByTagName("tbody")[0];

    for (var i = 0; i < students.length; i++) {
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        //first column is checkbox
        cell1.innerHTML = '<input type="checkbox" class="select-student checkbox" name="student" value=' + students[i]["ID"] + ' />';
        //second column student name
        cell2.innerHTML = students[i]["USERNAME"];
    }

}

function displayErrorMsg() {
    $("#error-message").removeClass("hidden");
}

function generateTaskTable(tasks) {

    var taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    //none option first
    var option = document.createElement('option');
    option.value = 0;
    option.textContent = "NONE";
    taskList.appendChild(option);

    for (var i = 0; i < tasks.length; i++) {
        var option = document.createElement('option');

        option.value = tasks[i]["ID"];
        option.textContent = tasks[i]["TITLE"];

        taskList.appendChild(option);
    }
}



function emptyCheckboxes() {
    $("input.select-student").each(function (index, item) {
        item.checked = false;
    });

    markSelectedStudents();

    $('#reflection-checkbox').prop("checked", false);
    $(".select-all").prop("checked", false);
}

/**
 * USER LOGIN
 */

function LNUC4aUserLogin() {

    var email = $('#inputEmail').val();
    var pw = $('#inputPassword').val();
    var share = Share.getInstance();

    $.ajax({

        type: 'POST',
        url: 'https://cs.uef.fi/~tapanit/ecraft2learn/api/pilot_2/login_teacher_pilot_2.php',
        data: 'username=' + email + '&password=' + pw,
        success: function (data) {

            if (!isNaN(data)) {

                share.password = pw;
                share.username = email;
                share.id = data;

                $('#loginModal').modal('hide');
                $("#warning-message").addClass("hidden");
                init();



            } else {

                alert('Not a valid username or a password.');

            }

        },
        error: function (error) {


        }

    });

}

function showMessage(message, type) {
    $("#alert").html('<div id="alertdiv" class="alert ' + type + '" role="alert">' + message + '</div>');

    setTimeout(function () { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs


        $("#alertdiv").remove();

    }, 5000);
}