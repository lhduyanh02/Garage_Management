import ErrorCode from "/dist/js/ErrorCode.js";

export function redirect_page(url) {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    if (!token) {
        alert("token not founded");
        window.location.href("/login");
        return;
    }

    // Gọi API để lấy trang HTML với Bearer Token
    fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/html",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch the page");
            }
            return response.text(); // Nhận HTML dưới dạng text
        })
        .then((html) => {
            const contentDiv = document.getElementById("content"); // Thay thế nội dung bằng HTML mới
            contentDiv.innerHTML = html;

            // Re-execute any scripts included in the fetched HTML
            const scripts = contentDiv.querySelectorAll("script");
            scripts.forEach((script) => {
                const newScript = document.createElement("script");
                newScript.src = script.src;
                document.body.appendChild(newScript);
            });
        })
        .catch((error) => {
            console.error("Error fetching the HTML page:", error);
        });
}

export const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");

    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return cookie.split("=")[1];
        }
    }
    return null; // Return null if the cookie is not found
};

export const deleteCookie = (name) => {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
};

export function introspect(bool) {
    // Hàm kiểm tra token có hợp lệ hay không, nếu không thì trả về trang index
    let token = getCookie("authToken");
    let path = "";
    if(bool) {
      path = window.location.href.split("/").slice(-1)[0];
    }

    if (token) {
        $.ajax({
            type: "POST",
            url: "/api/auth/introspect",
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ token: token }),
            success: function (res) {
                if (res.code == 1000) {
                    if (res.data.valid == false) {
                        deleteCookie("authToken");
                        if(bool) {
                          window.location.href = "/login#" + path;
                        }
                        else {
                          window.location.href = "/login";
                        }
                    }
                }
            },
            error: function (res) {
                deleteCookie("authToken");
                if(bool) {
                    window.location.href = "/login#" + path;
                }
                  else {
                    window.location.href = "/login";
                }
            },
        });
    } else {
        if(bool) {
          window.location.href = "/login#" + path;
        }
        else {
          window.location.href = "/login";
        }
    }
}

export function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        let token = getCookie("authToken");

        if (token) {
            $.ajax({
                type: "POST",
                url: "/api/auth/introspect",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ token: token }),
                success: function (res) {
                    if (res.code == 1000 && res.data.valid) {
                        resolve(true);
                    } else {
                        deleteCookie("authToken");
                        resolve(false);
                    }
                },
                error: function () {
                    console.log("Login status: " + loginStatus);
                    deleteCookie("authToken");
                    resolve(false);
                },
            });
        } else {
            resolve(false);
        }
    });
}

export function loadScript(url) {
    // Kiểm tra xem script đã tồn tại chưa
    if (!document.querySelector(`script[src="${url}"]`)) {
        let script = document.createElement("script");
        script.src = url;
        script.onload = function () {};
        document.head.appendChild(script);
    }
}

export function getErrorMessage(code) {
    for (let key in ErrorCode) {
        if (ErrorCode[key].code === code) {
            return ErrorCode[key].message;
        }
    }
    return "Mã lỗi không xác định";
}

export function getXHRInfo(xhr) {
    try {
      let response = JSON.parse(xhr.responseText);
      let statusCode = response.code;
      let message = getErrorMessage(statusCode);
      return {
        statusCode: statusCode,
        message: message
      };
    } catch (error) {
        return {
            statusCode: 9999,
            message: "Lỗi không xác định"
        };
    }

    return null;
}

export function validatePhoneNumber(phoneNumber) {
    if(phoneNumber==null || phoneNumber==""){
        return true;
    }
    // Biểu thức chính quy để kiểm tra số điện thoại
    var regex = /^\+?[0-9\s.-]+$/;
    return regex.test(phoneNumber);
}

export function defaultHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getCookie("authToken")
    };
}

export function set_char_count(inputId, counterId) {
    const length = $(inputId).attr("maxlength");
    var currentLength = $(inputId).val() ? $(inputId).val().length : 0;
    $(counterId).text(currentLength + '/' + length);

    $(inputId).on('input', function() {
      currentLength = $(inputId).val().length;
      $(counterId).text(currentLength + '/' + length);
    });
}

// Định dạng ngày giờ theo chuẩn VN với thời gian và 4 chữ số của năm
export function formatVNDate(isoDate) {
    var date = new Date(isoDate);
    
    var time = date.toLocaleTimeString("vi-VN", { hour12: false });
    
    // Lấy ngày tháng năm
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();
    
    // Định dạng cuối cùng
    return `${time}, ${day}/${month}/${year}`;
}

export function getTimeAsJSON(isoDate) {
    if (!isoDate) {
        return "";
    }
    const date = new Date(isoDate);

    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return {
        hour: hour,
        min: min,
        sec: sec,
        date: day,
        mon: month,
        year: year
    };
}

// Định dạng số tiền với khoảng trắng
export function formatCurrent(inputValue) {
    if (!inputValue) {
        return "";
    }
    // Xóa các ký tự không phải là số
    inputValue = inputValue.replace(/\D/g, '');

    // Xóa các số 0 đứng đầu trừ khi số là 0 duy nhất
    inputValue = inputValue.replace(/^0+(?=\d)/, '');

    // Thêm dấu cách giữa các nhóm 3 chữ số
    let formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return formattedValue;
}

// Định dạng số tiền VNĐ với ký tự đồng
export function formatVNDCurrency(amount) {
    // Kiểm tra giá trị null hoặc không phải là số
    if (amount == null || isNaN(amount)) {
        return "Không hợp lệ";
    }
    
    // Định dạng thành tiền tệ Việt Nam (VND)
    return amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
    });
}

export function setHashParam(key, value) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
  
    if (value !== null && value !== undefined) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  
    // Nếu không có tham số nào, bỏ hash hoàn toàn
    const newHash = params.toString();
    window.location.hash = newHash ? newHash : '';
}

export function getHashParam(key) {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const value = params.has(key) ? params.get(key) : null;

    return value !== null && value !== "" ? value : null;
}