/**
 * Created by asoadmin on 2018-10-25.
 */
function init() {
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
    else{
        //show content
    }
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