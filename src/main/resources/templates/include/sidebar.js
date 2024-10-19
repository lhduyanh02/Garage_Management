import * as utils from "/dist/js/utils.js";

// var Toast = Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: 3000,
//   });

function active_nav_link() {
    let current = window.location.href
        .split("/")
        .slice(-1)[0]
        .replace(/#$/, "");
    let elements = document.querySelectorAll(".nav-link");

    elements.forEach(function (el) {
        var element = el.getAttribute("id");
        if (element && element.includes(current) && current !== "") {
            el.classList.add("active");
            var id = element.split("_")[0];
            document.getElementById(id).classList.add("active");
        } else if (
            element &&
            element.includes(current) &&
            (current == "" || current == "index")
        ) {
            document.getElementById("dashboard").classList.add("active");
        }
    });
}

$(document).ready(function () {
    active_nav_link();
    utils.loadScript("/plugins/bootstrap/js/bootstrap.bundle.min.js");
    $('[data-toggle="tooltip"]').tooltip();

    if (utils.getCookie("authToken") !== null) {
        var userInfo = utils.getLocalStorageObject("userInfo");
        if (userInfo == null) {
            $.ajax({
                type: "GET",
                url: "/api/users/get-my-info",
                headers: utils.defaultHeaders(),
                dataType: "json",
                success: function (res) {
                    if(res.code == 1000){
                        utils.setLocalStorageObject('userInfo', res.data)
                        $("#user-name-sidebar").text(res.data.name);
                    }
                },
                error: function (xhr, status, error) {
                    console.log("Error in getting user's info");
                },
            });
        } else {
            $("#user-name-sidebar").text(userInfo.name);
        }
    }
});
