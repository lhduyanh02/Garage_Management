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
var addressOptions = [];

$(document).ready(async function () {
    $('[data-toggle="tooltip"]').tooltip();

    let res;
    try {
        res = await $.ajax({
            type: "GET",
            url: "/api/addresses",
            headers:utils.noAuthHeaders(),
        });
    } catch (error) {
        console.error(error);
    }

    $('#gender-select').select2({
        allowClear: true,
        theme: "bootstrap",
        language: "vi",
        width: "100%",
        closeOnSelect: true,
    })

    if (res && res.code == 1000) {
        addressOptions = [];
        $.each(res.data, function (idx, val) {
            addressOptions.push({
                id: val.id,
                address: val.address
            });
        });

        $("#address-select").select2({
            allowClear: true,
            theme: "bootstrap",
            language: "vi",
            closeOnSelect: true,
            width: "100%",
            minimumInputLength: 2,
            ajax: {
                transport: function (params, success, failure) {
                    let results = [];

                    let keyword = params.data.q || "";
    
                    // Lọc các address từ addressOptions dựa vào từ khóa người dùng nhập vào
                    var filtered = addressOptions.filter(function (option) {
                        let normalizedName = utils.removeVietnameseTones(option.address.toLowerCase()); // Tên đã loại bỏ dấu
                        let termNormalized = utils.removeVietnameseTones(keyword.toLowerCase()); // Searching key đã loại bỏ dấu
                        
                        let nameMatch = normalizedName.includes(termNormalized);
                       
                        return nameMatch;
                    });
    
                    results = filtered.map(function (option) {
                        return {
                            id: option.id,
                            text: option.address
                        };
                    });
    
                    success({
                        results: results
                    });
                },
                delay: 250,
            }
        });
    }

    loadUserInfo();
});

async function loadUserInfo() {
    utils.setLocalStorageObject('userInfo', null);
    userInfo = await utils.getUserInfo();
    
    $('#profile-name').text(userInfo.name);
    $('#input-name').val(userInfo.name);

    if (userInfo.accounts && userInfo.accounts.length > 0) {
        $('#profile-email').text(userInfo.accounts[0].email);
    }

    let infoHtml = "";

    if (userInfo.phone != null && userInfo.phone != "") {
        infoHtml +=  `
        <li class="list-group-item">
            <b>SĐT</b> <a class="float-right">${userInfo.phone}</a>
        </li>`;
        $('#input-phone').val(userInfo.phone);
    }

    if (userInfo.telegramId != null && userInfo.telegramId != "") {
        $('#telegramid-input').val(userInfo.telegramId);
        infoHtml +=  `
        <li class="list-group-item">
            <b>TelegramID</b> <a class="float-right">${userInfo.telegramId}</a>
        </li>`
    }

    if (userInfo.gender != null && userInfo.gender != "") {
        let gender = userInfo.gender == 1 ? "Nam" : userInfo.gender == 0 ? "Nữ" : "Khác";

        if (userInfo.gender != -1) {
            $('#gender-select').val(userInfo.gender).trigger('change');
        }

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

        $('#address-select').append(`<option value="${userInfo.address.id}" selected>${userInfo.address.address}</option>`);
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
        $('#profile-cars').text("Chưa đăng ký");
    }
}

$('#save-btn').click(async function () { 
    let fullName = $('#input-name').val().trim();
    let phoneNumber = $('#input-phone').val().trim();
    let gender = $('#gender-select').val();
    let address = $('#address-select').val();
    let telegramId = $('#telegramid-input').val().trim();

    if (!utils.validatePhoneNumber(phoneNumber)){
        Toast.fire({
            icon: 'warning',
            title: 'Số điện thoại chưa hợp lệ'
        })
        return;
    }

    if (telegramId) {
        if (!/^-?\d+$/.test(telegramId) || Number(telegramId) > Number.MAX_SAFE_INTEGER || Number(telegramId) < Number.MIN_SAFE_INTEGER) {
            Swal.fire({
                icon: "warning",
                title: "Telegram ID không hợp lệ!",
                text: "Telegram ID phải là chuỗi số nguyên"
            });
            return;
        }
    }
    
    if(gender == null) {
        gender = -1;
    }

    let warning = await Swal.fire({
        title: "Cập nhật thông tin?",
        text: "Xác nhận lưu các thông tin trên?",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đồng ý",
        reverseButtons: true
    });
    
    if (!warning.isConfirmed) {
        return;
    }

    await $.ajax({
        type: "PUT",
        url: "/api/users/self-update",
        headers: utils.defaultHeaders(),
        data: JSON.stringify({
            name: fullName,
            phone: phoneNumber,
            gender: gender,
            addressId: address,
            telegramId: telegramId
        }),
        success: async function (res) {
            if (res.code == 1000) {
                await loadUserInfo();
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    showCancelButton: false
                });
            }
            else {
                Toast.fire({
                    icon: "error",
                    title: utils.getErrorMessage(res)
                });
            }
        },
        error: function(xhr, status, error){
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
        }
    });
});

$('#change-password-btn').click(async function () { 
    if (userInfo == null) {
        return;
    }

    if (!userInfo.accounts.length > 0) {
        Toast.fire({
            icon: "warning",
            title: "Không tìm thấy tài khoản!"
        });
        return;
    }

    clear_modal();
    $("#modal_title").text("Đổi mật khẩu");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="old_password_input">Mật khẩu cũ</label>
                <kbd id="old_password_counter" class="mb-0 small">0/255</kbd>
            </div>
            <input type="password" class="form-control" id="old_password_input" maxlength="255" placeholder="Nhập mật khẩu cũ">
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="new_password_input">Mật khẩu mới</label>
                <kbd id="new_password_counter" class="mb-0 small">0/256</kbd>
            </div>
            <input type="password" class="form-control" id="new_password_input" maxlength="255" placeholder="Nhập mật khẩu mới">
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="retype_password_input">Xác nhận mật khẩu mới</label>
                <kbd id="retype_password_counter" class="mb-0 small">0/256</kbd>
            </div>
            <input type="password" class="form-control" id="retype_password_input" maxlength="255" placeholder="Nhập lại mật khẩu mới">
        </div>
    `);

    utils.set_char_count("#old_password_input", "#old_password_counter");
    utils.set_char_count("#new_password_input", "#new_password_counter");
    utils.set_char_count("#retype_password_input", "#retype_password_counter");

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(async function (){
        let oldPasswd = $("#old_password_input").val();
        let newPasswd = $("#new_password_input").val();
        let retypePasswd = $("#retype_password_input").val();
        
        // Biểu thức chính quy kiểm tra tiếng Việt
        const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

        if (!oldPasswd || oldPasswd.trim() === "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập mật khẩu"
            });
            return;
        }
        
        if (!newPasswd || newPasswd.trim() === "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập mật khẩu mới"
            });
            return;
        }
        
        if (newPasswd.length < 8) {
            Toast.fire({
                icon: "warning",
                title: "Mật khẩu phải có tối thiểu 8 ký tự"
            });
            return;
        }
        
        if (!retypePasswd || retypePasswd.trim() === "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập lại mật khẩu mới"
            });
            return;
        }
        
        if (newPasswd !== retypePasswd) {
            Toast.fire({
                icon: 'warning',
                title: 'Mật khẩu chưa trùng khớp'
            });
            return;
        }

        // Kiểm tra nếu mật khẩu chứa ký tự tiếng Việt
        if (vietnamesePattern.test(newPasswd)) {
            Toast.fire({
                icon: "warning",
                title: "Mật khẩu không được chứa ký tự tiếng Việt"
            });
            return;
        }

        let warning = await Swal.fire({
            title: "Đổi mật khẩu?",
            html: `Đổi mật khẩu cho tài khoản<br><b>${userInfo.accounts[0].email}</b>`,
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Đồng ý",
            reverseButtons: true
        });
        
        if (!warning.isConfirmed) {
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/accounts/change-password",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                accountId: userInfo.accounts[0].id,
                oldPassword: oldPasswd,
                newPassword: newPasswd,
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: async function (res) {
                Swal.close();
                if (res.code == 1000) {
                    await loadUserInfo();
                    Swal.fire({
                        icon: "success",
                        title: "Đã đổi mật khẩu thành công!",
                        showCancelButton: false
                    });
                    $("#modal_id").modal("hide");
                }
                else {
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(res)
                    });
                }
            },
            error: function(xhr, status, error) {
                Swal.close();
                console.error(xhr);
                Swal.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                    text: utils.getXHRInfo(xhr).message
                });
            }
        });
    });
});