import * as utils from "/dist/js/utils.js";

utils.introspect(true);

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

// Clear modal
function clear_modal() {
    if ($(".modal-dialog").hasClass("modal-lg")) {
        $(".modal-dialog").removeClass("modal-lg");
    }

    if ($(".modal-dialog").hasClass("modal-xl")) {
        $(".modal-dialog").removeClass("modal-xl");
    }
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

var userInfo;

$(document).ready(async function () {
    utils.setLocalStorageObject('userInfo', null);
    userInfo = await utils.getUserInfo();
    
    $('#profile-name').text(userInfo.name);

    if (userInfo.accounts && userInfo.accounts.length > 0) {
        $('#profile-email').text(userInfo.accounts[0].email);
    }

    let infoHtml = "";

    if (userInfo.phone != null && userInfo.phone != "") {
        infoHtml +=  `
        <li class="list-group-item">
            <b>SĐT</b> <a class="float-right">${userInfo.phone}</a>
        </li>`
    }

    if (userInfo.telegramId != null && userInfo.telegramId != "") {
        infoHtml +=  `
        <li class="list-group-item">
            <b>TelegramID</b> <a class="float-right">${userInfo.telegramId}</a>
        </li>`
    }

    if (userInfo.gender != null && userInfo.gender != "") {
        let gender = userInfo.gender == 1 ? "Nam" : userInfo.gender == 0 ? "Nữ" : "Khác";
        infoHtml +=  `
        <li class="list-group-item">
            <b>Giới tính</b> <a class="float-right">${gender}</a>
        </li>`
    }

    $('#list-info').html(infoHtml);

    if (userInfo.roles.length > 0) {
        let html = "";

        userInfo.roles.forEach((role, idx) => {
            if (idx == 0) {
                html += role.roleName;
            } else {
                html += ", " + role.roleName;
            }
        });
        
        $('#profile-roles').text(html);
    }

    if (userInfo.address != null) {
        let html = userInfo.address.address;
        
        $('#profile-address').html(html);
    } else {
        $('#profile-address').text("Không có");
    }

    if (userInfo.cars.length > 0) {
        let html = "";

        userInfo.cars.forEach((car, idx) => {
            if (idx == 0) {
                html += car.model.brand.brand + " " + car.model.model +" - "+ car.numPlate;
            } else {
                html += "<br>" + car.model.brand.brand + " " + car.model.model +" - "+ car.numPlate;
            }
        });
        
        $('#profile-cars').html(html);
    } else {
        $('#profile-cars').text("Không có");
    }
    
});