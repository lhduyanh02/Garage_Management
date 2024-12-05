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

    await utils.setLocalStorageObject('userInfo', null);

    let userInfo = await utils.getUserInfo();
    if (userInfo) {
        $("#user-name-sidebar").text(userInfo.name);
        $('.user-panel').on('click', function (e) { 
            window.location.href = "/my-profile";
        });

        $('#my-profile-nav').prop('hidden', false);
        if (userInfo.roles && userInfo.roles.length > 0) {
            $.each(userInfo.roles, function (idx, role) { 
                if (role.roleKey === "CUSTOMER") {
                    $('[data-id="CUSTOMER"]').prop('hidden', false);
                }
            });
        }

        $.ajax({
            type: "GET",
            url: "/api/users/get-my-permissions",
            headers: utils.defaultHeaders(),
            dataType: "json",
            success: function (res) {
                if (res.code == 1000) {
                    let permissions = res.data;
                    if (!permissions || permissions.length == 0) return;

                    $.each(permissions, function (idx, permission) { 
                        $('.nav-item').each(function () {
                            // Nếu thẻ có data-id và data-id này nằm trong danh sách permissions
                            if ($(this).data('id') && $(this).data('id') === permission) {

                                $(this).prop('hidden', false);
                                $(this).closest('li.nav-parent').prop('hidden', false);
                
                            }
                        });
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr);
            }
        });
    } else {
        console.error("Can not get user info");
        $('.user-panel').off('click');
    }

});
