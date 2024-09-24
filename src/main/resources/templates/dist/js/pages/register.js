import * as utils from "/dist/js/utils.js";

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: 'auto',
});

$(document).ready(function () {
    utils.checkLoginStatus().then(isValid => {
        if(isValid) {
            window.location.href = "/";
        }
    });

    $('[data-toggle="tooltip"]').tooltip();

    $(".select2").select2({
        allowClear: true,
        // dropdownParent: $('#modal_body'),
        theme: "bootstrap",
        // tokenSeparators: [",", " "],
        closeOnSelect: true,
    });
    
    $.ajax({
        type: "GET",
        url: "/api/addresses",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "",
        },
        success: function (res) {
            if(res.code==1000){
                $.each(res.data, function (idx, val) {
                     $('#address-select').append(`
                        <option value=" ${val.id} "> ${val.address} </option>
                    `);
                });
            }
            else {
                Toast.fire({
                    icon: "warning",
                    title: res.message
                });
            }
        },
        error: function(xhr, status, error){
            Toast.fire({
                icon: "warning",
                title: JSON.parse(xhr.responseText).message
            });
        }
    });
});

// Đếm số ký tự
var passwordInput = $('#password');
var passwordRetype = $('#password-retype');
var passwdIcon = $('#password-icon')
var passwdRetypeIcon = $('#password-retype-icon')

var check_passwd = function () {
    if(passwordInput.val().length >= 8){
        if(passwordInput.val()===passwordRetype.val()){
            passwdIcon.attr('class', 'fa-solid fa-shield-cat fa-flip fa-xl');
            passwdIcon.css("color", "unset");
            passwdRetypeIcon.attr('class', 'fa-solid fa-shield-cat fa-flip fa-xl');
        } else {
            passwdIcon.attr('class', 'fa-solid fa-key');
            passwdIcon.css("color", "unset");
            passwdRetypeIcon.attr('class', 'fa-solid fa-unlock fa-shake');
        }
    }
    else {
        passwdIcon.attr('class', 'fa-solid fa-key');
        passwdIcon.css("color", "#DC3545");
        passwdRetypeIcon.attr('class', 'fa-solid fa-unlock');
    }
}

passwordInput.on('input', function() {
    check_passwd();
});

passwordRetype.on('input', function() {
    check_passwd();
});