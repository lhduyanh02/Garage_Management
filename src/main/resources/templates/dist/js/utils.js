import ErrorCode from "/dist/js/ErrorCode.js";

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

// Hàm lưu Object vào localStorage
export function setLocalStorageObject(key, value) {
    if (!key) {
      console.error('Key không hợp lệ!');
      return;
    }
  
    try {
      if (value === null) {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
        }
      } else {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error('Local storage - set object error:', error);
    }
}
  
// Hàm lấy Object từ localStorage
export function getLocalStorageObject(key) {
    if (!key) {
      console.error('Local storage: Invalid key!');
      return null;
    }
  
    try {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Local storage - get object error:', error);
      return null;
    }
}

export async function getUserInfo() {
    if (getCookie("authToken") !== null) {
        var userInfo = getLocalStorageObject("userInfo");
        if (userInfo == null) {
            try {
                let res = await $.ajax({
                    type: "GET",
                    url: "/api/users/get-my-info",
                    headers: defaultHeaders(),
                    dataType: "json",
                });

                if (res.code == 1000 && res.data) {
                    if(res.code == 1000){
                        setLocalStorageObject('userInfo', res.data)
                        return res.data;
                    }
                } else {
                    console.error(res);
                    return null;
                }
            } catch (error) {
                console.log("Error in getting user info");
                console.error(getXHRInfo(error));
                return null;
            }
        } else {
            return userInfo;
        }
    }
    else {
        setLocalStorageObject('userInfo', null)
        console.log("Token not found");
        return null;
    }
}

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
                        setLocalStorageObject('userInfo', null); 
                        if(bool) {
                          window.location.href = "/login#" + path;
                        }
                        else {
                          window.location.href = "/login";
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status == 401) {
                    deleteCookie("authToken");
                    setLocalStorageObject('userInfo', null); 
                    if(bool) {
                        window.location.href = "/login#" + path;
                    }
                    else {
                        window.location.href = "/login";
                    }
                    return;
                } else {
                    console.error(xhr);
                    Swal.fire({
                        icon: "error",
                        title: "Internal server error",
                    });
                    setLocalStorageObject('userInfo', null);  
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
                        resolve(false);
                    }
                },
                error: function () {
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

export function noAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": ""
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
    if (typeof inputValue !== 'string') {
        inputValue = String(inputValue);
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

// Thay thế các ký tự tiếng việt thành tiếng anh
export function removeVietnameseTones(str) {
    const tones = [
        { base: 'a', letters: 'áàãảạâấầẫẩậăắằẵẳạ' },
        { base: 'e', letters: 'éèẽẻẹêếềễểệ' },
        { base: 'i', letters: 'íìĩỉị' },
        { base: 'o', letters: 'óòõỏọôốồỗổộơớờỡởợ' },
        { base: 'u', letters: 'úùũủụưứừữửự' },
        { base: 'y', letters: 'ýỳỹỷỵ' },
        { base: 'd', letters: 'đ' },
    ];
    
    tones.forEach(({ base, letters }) => {
        const regex = new RegExp(`[${letters}]`, 'g');
        str = str.replace(regex, base);
    });
    
    return str;
}