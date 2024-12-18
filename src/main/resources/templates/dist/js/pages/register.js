import * as utils from "/dist/js/utils.js";

// Mảng để lưu các option mới
var addressOptions = [];
var OTP_sent = 1;
let timer;
let countdown = 60;

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

    $('#address-select').on('change', function() {
        removeCSSProperty('.select2-container', 'width');
    });

    $(".select2").select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        language: "vi",
    });

    $('#gender-select').val("").trigger('change');
    
    $.ajax({
        type: "GET",
        url: "/api/addresses",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "",
        },
        success: function (response) {
            if(response.code==1000){
                // Load address lên mảng
                addressOptions = [];
                $.each(response.data, function (idx, val) {
                    addressOptions.push({
                        id: val.id,
                        address: val.address
                    });
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

    $("#address-select").select2({
        placeholder: "Chọn địa chỉ",
        allowClear: true,
        // dropdownParent: $('#modal_body'),
        theme: "bootstrap",
        language: "vi",
        // tokenSeparators: [",", " "],
        closeOnSelect: true,
        minimumInputLength: 2, // Chỉ tìm kiếm khi có ít nhất 2 ký tự
        ajax: {
            transport: function (params, success, failure) {
                let results = [];

                let keyword = params.data.q || "";

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
        if (passwordInput.val().length == 0)
            passwdIcon.css("color", "unset");
        else
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

function validatePhoneNumber(phoneNumber) {
    if(phoneNumber==null || phoneNumber==""){
        return true;
    }
    // Biểu thức chính quy để kiểm tra số điện thoại
    var regex = /^\+?[0-9\s.-]+$/;
    return regex.test(phoneNumber);
}

var register = function () {  
    let fullName = $('#full-name').val().trim();
    let phoneNumber = $('#phone-number').val().trim();
    let gender = $('#gender-select').val();
    let address = $('#address-select').val();
    let email = $('#email').val().trim();
    let passwd = $('#password').val();
    let passwdRetype = $('#password-retype').val();

    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

    if (!validatePhoneNumber(phoneNumber)){
        Toast.fire({
            icon: 'warning',
            title: 'Số điện thoại chưa hợp lệ'
        })
        return;
    }

    if(passwd !== passwdRetype) {
        Toast.fire({
            icon: 'warning',
            title: 'Mật khẩu chưa trùng khớp'
        })
        return;
    }

    // Kiểm tra nếu mật khẩu chứa ký tự tiếng Việt
    if (vietnamesePattern.test(passwd)) {
        Toast.fire({
            icon: "warning",
            title: "Mật khẩu không được chứa ký tự tiếng Việt"
        });
        return;
    }

    if(gender == null) {
        gender = -1;
    }

    $.ajax({
        type: "POST",
        url: "/api/accounts/register",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        beforeSend: function() {
            Swal.showLoading();
        },
        data: JSON.stringify({
            email: email,
            password: passwd,
            name: fullName,
            phone: phoneNumber,
            gender: gender,
            addressId: address
        }),
        success: function (res) {
            if (res.code == 1000) {
                Swal.close();
                Toast.fire({
                    icon: "success",
                    title: "Đã gửi OTP"
                });
                $("#OTP-box").modal("show");
                OTPInput(email, passwd);
            }
            else {
                Swal.close();
                Toast.fire({
                    icon: "error",
                    title: res.message || "Đã xảy ra lỗi"
                })
            }
        },
        error: function(xhr, status, error){
            Swal.close();
            console.error(xhr);
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
        }
    });
}

$('#submit-btn').click(function (e) { 
    e.preventDefault();
    if($('#register-form')[0].checkValidity()){
        register();
        
    } else {
        // Hiển thị thông báo lỗi nếu form không hợp lệ
        $('#register-form')[0].reportValidity();
    }
});


// Hàm để xóa thuộc tính CSS từ một lớp
function removeCSSProperty(className, property) {
    for (let i = 0; i < document.styleSheets.length; i++) {
        let stylesheet = document.styleSheets[i];
        try {
            let rules = stylesheet.cssRules || stylesheet.rules;
            for (let j = 0; j < rules.length; j++) {
                let rule = rules[j];
                if (rule.selectorText === className) {
                    rule.style.removeProperty(property);
                }
            }
        } catch (e) {
        }
    }
}

function OTPInput(email, passwd) {
    $('#email-sent').text(email);
    const inputs = $('#otp > *[id]');
    inputs.each(function(index) {
        $(this).val("");
        $(this).on('keydown', function(event) {
            if (event.key === "Backspace") {
                $(this).val('');
                if (index !== 0) {
                    inputs.eq(index - 1).focus();
                }
            } else {
                if (index === inputs.length - 1 && $(this).val() !== '') {
                    return true;
                } else if (event.keyCode > 47 && event.keyCode < 58) {
                    $(this).val('');
                } else if (event.keyCode > 64 && event.keyCode < 91) {
                    $(this).val('');
                }
            }
        });

        // Thêm sự kiện input để xử lý dán bằng phím nóng
        $(this).on('input', function(event) {
            const value = $(this).val();
            if (value.length > 1) {
                const pasteArray = value.split('');
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
        $(this).on('paste', function(event) {
            const pasteData = event.originalEvent.clipboardData.getData('text');
            const pasteArray = pasteData.split('');
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
    $('#resent-btn').prop('disabled', true);

    // Start countdown
    timer = setInterval(() => {
        countdown--;
        $('#resent-btn').text(`Gửi lại(${OTP_sent}/3) (${countdown}s)`);
        
        if (countdown <= 0) {
            clearInterval(timer);
            $('#resent-btn').prop('disabled', false);
            $('#resent-btn').text(`Gửi lại(${OTP_sent}/3)`);
        }
    }, 1000);

    $('#resent-btn').click(function (e) { 
        if ($('#resent-btn').prop('disabled')) {
            return;
        }

        if(OTP_sent >= 3){
            Toast.fire({
                icon: "warning",
                title: "Chỉ được gửi tối đa 3 lần"
            });
            return;
        }

        OTP_sent++;
        $(this).text(`Gửi lại(${OTP_sent}/3)`);

        $.ajax({
            type: "POST",
            url: "/api/accounts/regenerate-otp?email=" + email,
            headers: {
                "Content-Type": "application/json",
                "Authorization": ""
            },
            success: function (res) {
                if(res.code == 1000){
                    Toast.fire({
                        icon: "success",
                        title: "OTP đã được gửi lại"
                    });
                    inputs.each(function(index) {
                        $(this).val("");
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
        
        // Reset countdown
        countdown = 60;
        clearInterval(timer);
        $(this).prop('disabled', true);

        // Start countdown
        timer = setInterval(() => {
            countdown--;
            $(this).text(`Gửi lại(${OTP_sent}/3) (${countdown}s)`);
            
            if (countdown <= 0) {
                clearInterval(timer);
                $(this).prop('disabled', false);
                $(this).text(`Gửi lại(${OTP_sent}/3)`);
            }
        }, 1000);
        
    });

    $('#validate-otp-btn').click(function () { 
        let otpCode = $('#first').val() + $('#second').val() + $('#third').val() + 
                        $('#fourth').val() + $('#fifth').val() + $('#sixth').val();

        $.ajax({
            type: "POST",
            url: "/api/accounts/verify-account",
            headers: {
                "Content-Type": "application/json",
                "Authorization": ""
            },
            data: JSON.stringify({
                email: email,
                otpCode: otpCode
            }),
            success: function (res) {
                if (res.code == 1000 && res.data.result){
                    Toast.fire({
                        icon: "success",
                        title: "Đăng ký thành công",
                        timer: 1000,
                        didClose: () => {
                            login(email, passwd);
                        }
                    });
                }
                else {
                    Toast.fire({
                        icon: "warning",
                        title: "OTP không chính xác, vui lòng kiểm tra lại",
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
            }
        });
    });
}

function login(loginEmail, loginPassword) {
    $.ajax({
      url: "/api/auth/token",
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": ""
      },
      data: JSON.stringify({ email: loginEmail, password: loginPassword }),
      success: function (res) {
        if (res.code === 1000 && res.data.authenticated) {
          window.location.href = '/';
         
        } else {
          alert(res.code);
          Toast.fire({
            icon: "warning",
            title: res.message || "Đăng nhập thất bại",
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
  }