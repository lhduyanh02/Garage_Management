import * as utils from "/dist/js/utils.js";

let countdown = 60;
var OTP_sent = 1;
let timer;

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
});

// Clear modal
function clear_modal() {
    if ($(".modal-dialog").hasClass("modal-lg")) {
        $(".modal-dialog").removeClass("modal-lg");
    }
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

function login() {
    utils.setLocalStorageObject("userInfo", null);

    let email = $("#email").val().trim();
    let password = $("#password").val();

    const vietnamesePattern =
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

    if (email == null) {
        Swal.fire({
            icon: "warning",
            title: "Vui lòng điền email",
            showCancelButton: false,
        });
        return;
    }

    if (password == null) {
        Swal.fire({
            icon: "warning",
            title: "Vui lòng điền mật khẩu",
            showCancelButton: false,
        });
        return;
    }

    // Lấy redirect path
    let url = window.location.href;
    let hashIndex = url.indexOf("#");
    let path = hashIndex !== -1 ? url.substring(hashIndex + 1) : null;
    $.ajax({
        url: "/api/auth/token",
        type: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "",
        },
        data: JSON.stringify({ email: email, password: password }),
        success: function (res) {
            if (res.code === 1000 && res.data.authenticated) {
                let expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 1 ngày
                setTimeout(() => {
                    localStorage.setItem("tokenExpirationTime", expirationTime);
                    window.location.href = path || "/";
                }, 500);
            } else {
                alert(res.code);
                Toast.fire({
                    icon: "warning",
                    title: res.message || "Đăng nhập thất bại",
                });
            }
        },
        error: function (xhr, status, error) {
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message,
                timer: 1500,
                didClose: function () {
                    // Kiểm tra nếu mật khẩu chứa ký tự tiếng Việt
                    if (vietnamesePattern.test(password) && xhr.status < 500) {
                        toastr.info("Mật khẩu của bạn đang chứa tiếng Việt!");
                    }
                },
            });
        },
    });
}

$("#loginBtn").click(function () {
    login();
});

document.getElementById("password").addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        login();
    }
});

document.getElementById("email").addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        login();
    }
});

$("#forgot-password-btn").click(async function () {
    let email = $("#email").val();

    if (!email || email.trim() == "") {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng điền email trước",
        });
        return;
    }

    let warn = await Swal.fire({
        icon: "warning",
        title: "Đặt lại mật khẩu",
        html: `OTP sẽ được gửi đến email<br><b>${email}</b>`,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        reverseButtons: true,
    });

    if (warn.isConfirmed) {
        OTPInput(email);
    }
});

async function OTPInput(email) {
    let otpSent;
    Swal.showLoading();
    try {
        otpSent = await $.ajax({
            type: "POST",
            url: "/api/accounts/send-otp/" + email,
            headers: utils.noAuthHeaders(),
            dataType: "json",
        });
    } catch (xhr) {
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Đã xảy ra lỗi",
            text: utils.getXHRInfo(xhr).message,
        });
        return;
    }

    Swal.close();
    if (!otpSent) return;

    if (otpSent.code == 1000 && otpSent.data) {
        Swal.fire({
            icon: "success",
            title: "Đã gửi OTP",
            html: `OTP đã được gửi đến email<br><b>${email}</b>`,
            timer: 1500,
            showConfirmButton: false,
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: utils.getErrorMessage(otpSent.code),
        });
        return;
    }

    $("#OTP-box").modal("show");

    $("#email-sent").text(email);
    const inputs = $("#otp > *[id]");
    inputs.each(function (index) {
        $(this).val("");
        $(this).on("keydown", function (event) {
            if (event.key === "Backspace") {
                $(this).val("");
                if (index !== 0) {
                    inputs.eq(index - 1).focus();
                }
            } else {
                if (index === inputs.length - 1 && $(this).val() !== "") {
                    return true;
                } else if (event.keyCode > 47 && event.keyCode < 58) {
                    $(this).val("");
                } else if (event.keyCode > 64 && event.keyCode < 91) {
                    $(this).val("");
                }
            }
        });

        // Thêm sự kiện input để xử lý dán bằng phím nóng
        $(this).on("input", function (event) {
            const value = $(this).val();
            if (value.length > 1) {
                const pasteArray = value.split("");
                pasteArray.forEach((char, i) => {
                    if (i < inputs.length) {
                        inputs.eq(i).val(char);
                    }
                });
                inputs.eq(pasteArray.length).focus();
            } else if (value.length === 1) {
                if (index !== inputs.length - 1) {
                    inputs.eq(index + 1).focus();
                }
            }
        });

        // Thêm sự kiện paste
        $(this).on("paste", function (event) {
            const pasteData = event.originalEvent.clipboardData.getData("text");
            const pasteArray = pasteData.split("");
            pasteArray.forEach((char, i) => {
                if (i < inputs.length) {
                    inputs.eq(i).val(char);
                }
            });
            inputs.eq(pasteArray.length).focus();
            event.preventDefault();
        });
    });

    // Reset countdown
    countdown = 60;
    clearInterval(timer);
    $("#resent-btn").prop("disabled", true);

    // Start countdown
    timer = setInterval(() => {
        countdown--;
        $("#resent-btn").text(`Gửi lại(${OTP_sent}/3) (${countdown}s)`);

        if (countdown <= 0) {
            clearInterval(timer);
            $("#resent-btn").prop("disabled", false);
            $("#resent-btn").text(`Gửi lại(${OTP_sent}/3)`);
        }
    }, 1000);

    $("#resent-btn").click(async function (e) {
        if ($("#resent-btn").prop("disabled")) {
            return;
        }

        if (OTP_sent >= 3) {
            Toast.fire({
                icon: "warning",
                title: "Chỉ được gửi tối đa 3 lần",
            });
            return;
        }

        let res;
        try {
            res = await $.ajax({
                type: "POST",
                url: "/api/accounts/send-otp/" + email,
                headers: utils.noAuthHeaders(),
                dataType: "json",
                beforeSend: function () {
                    Swal.showLoading();
                },
            });
        } catch (xhr) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message,
            });
            return;
        }

        Swal.close();
        if (otpSent) {
            if (otpSent.code == 1000 && otpSent.data) {
                Swal.fire({
                    icon: "success",
                    title: "Đã gửi OTP",
                    html: `OTP đã được gửi đến email<br><b>${email}</b>`,
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: utils.getErrorMessage(otpSent.code),
                });
                return;
            }
        }

        OTP_sent++;
        $(this).text(`Gửi lại(${OTP_sent}/3)`);

        // Reset countdown
        countdown = 60;
        clearInterval(timer);
        $(this).prop("disabled", true);

        // Start countdown
        timer = setInterval(() => {
            countdown--;
            $(this).text(`Gửi lại(${OTP_sent}/3) (${countdown}s)`);

            if (countdown <= 0) {
                clearInterval(timer);
                $(this).prop("disabled", false);
                $(this).text(`Gửi lại(${OTP_sent}/3)`);
            }
        }, 1000);
    });

    $("#validate-otp-btn").click(function () {
        let otpCode =
            $("#first").val() +
            $("#second").val() +
            $("#third").val() +
            $("#fourth").val() +
            $("#fifth").val() +
            $("#sixth").val();

        $.ajax({
            type: "POST",
            url: "/api/accounts/verify-email",
            headers: utils.noAuthHeaders(),
            data: JSON.stringify({
                email: email,
                otpCode: otpCode,
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: function (res) {
                Swal.close();
                if (res.code == 1000 && res.data.result) {
                    recoveryPasswordModal(email, otpCode);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi",
                        text: utils.getErrorMessage(res.code),
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error(xhr);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: utils.getXHRInfo(xhr).message,
                });
            },
        });
    });
}

async function recoveryPasswordModal(email, OTP) {
    $("#OTP-box").modal("hide");
    
    clear_modal();
    $("#modal_title").text("Đặt lại mật khẩu"); $('#modal_id').modal({
      backdrop: 'static', // Ngăn đóng khi click bên ngoài
      keyboard: true      // Cho phép đóng khi nhấn Escape
    });
    $("#modal_body").append(`
        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="new_password_input">Mật khẩu mới</label>
                <kbd id="new_password_counter" class="mb-0 small">0/256</kbd>
            </div>
            <input type="password" class="form-control" id="new_password_input" maxlength="255" placeholder="Nhập mật khẩu mới">
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="mb-0" for="retype_password_input">Xác nhận mật khẩu</label>
                <kbd id="retype_password_counter" class="mb-0 small">0/256</kbd>
            </div>
            <input type="password" class="form-control" id="retype_password_input" maxlength="255" placeholder="Nhập lại mật khẩu mới">
        </div>
    `);

    utils.set_char_count("#new_password_input", "#new_password_counter");
    utils.set_char_count("#retype_password_input", "#retype_password_counter");

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(async function () {
        let newPasswd = $("#new_password_input").val();
        let retypePasswd = $("#retype_password_input").val();

        // Biểu thức chính quy kiểm tra tiếng Việt
        const vietnamesePattern =
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

        if (!newPasswd || newPasswd.trim() === "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập mật khẩu mới",
            });
            return;
        }

        if (newPasswd.length < 8) {
            Toast.fire({
                icon: "warning",
                title: "Mật khẩu phải có tối thiểu 8 ký tự",
            });
            return;
        }

        if (!retypePasswd || retypePasswd.trim() === "") {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng nhập lại mật khẩu mới",
            });
            return;
        }

        if (newPasswd !== retypePasswd) {
            Toast.fire({
                icon: "warning",
                title: "Mật khẩu chưa trùng khớp",
            });
            return;
        }

        // Kiểm tra nếu mật khẩu chứa ký tự tiếng Việt
        if (vietnamesePattern.test(newPasswd)) {
            Toast.fire({
                icon: "warning",
                title: "Mật khẩu không được chứa ký tự tiếng Việt",
            });
            return;
        }

        let warning = await Swal.fire({
            title: "Đặt lại mật khẩu?",
            html: `Đặt lại mật khẩu cho tài khoản<br><b>${email}</b>`,
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Đồng ý",
            reverseButtons: true,
        });

        if (!warning.isConfirmed) {
            return;
        }

        
    console.log(email);
    console.log(OTP);

        $.ajax({
            type: "POST",
            url: "/api/accounts/password-recovery",
            headers: utils.noAuthHeaders(),
            data: JSON.stringify({
                otpCode: OTP,
                email: email,
                newPassword: newPasswd,
            }),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: async function (res) {
                Swal.close();
                if (res.code == 1000) {
                    Swal.fire({
                        icon: "success",
                        title: "Đặt lại mật khẩu thành công!",
                        showCancelButton: false,
                    });
                    $("#modal_id").modal("hide");
                } else {
                    console.error(res);
                    Toast.fire({
                        icon: "error",
                        title: utils.getErrorMessage(res),
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error(xhr);
                Swal.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                    text: utils.getXHRInfo(xhr).message,
                });
            },
        });
    });
}
