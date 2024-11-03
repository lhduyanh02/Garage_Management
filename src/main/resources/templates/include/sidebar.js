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
        .split("#")[0];;
    let elements = document.querySelectorAll(".nav-link");

    elements.forEach(function (el) {
        var element = el.getAttribute("id"); // lấy id các thẻ nav item

        if (element && element.includes(current) && current !== "") { //nếu id thẻ nav item nào có chứa url
            var ids = element.split("_");

            if (ids.length > 1) {
                if (current === ids[1]) {
                    $(`#${ids[0]}`).addClass("active");
                    $(`#${element}`).addClass("active");
                }
            } else {
                if (current === ids[0]) {
                    $(`#${ids[0]}`).addClass("active");
                }
            }
        } else if (
            element &&
            element.includes(current) &&
            (current == "" || current == "index")
        ) {
            document.getElementById("dashboard").classList.add("active");
        }
    });
}

$(document).ready(async function () {
    utils.loadScript("/plugins/bootstrap/js/bootstrap.bundle.min.js");
    active_nav_link();
    $('[data-toggle="tooltip"]').tooltip();

    let userInfo = await utils.getUserInfo();
    if (userInfo) {
        $("#user-name-sidebar").text(userInfo.name);
        $('.user-panel').on('click', function (e) { 
            window.location.href = "/my-profile";
        });
    } else {
        console.error("Can not get user info");
        $('.user-panel').off('click');
    }
});
