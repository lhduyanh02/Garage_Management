// import { redirect_page } from "../utils";

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ");

  for (let cookie of cookies) {
    if (cookie.startsWith(name + "=")) {
      return cookie.split("=")[1];
    }
  }
  return null; // Return null if the cookie is not found
};

// Example: Get the value of the cookie named "authToken"

function login() {
  let email = $("#email").val();
  let password = $("#password").val();
  $.ajax({
    url: "/api/auth/token",
    type: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ email: email, password: password }),
    success: function (res) {
      if (res.code === 1000 && res.data.authenticated) {
        const authToken = getCookie("authToken");
        if(authToken!=null){
          $.ajaxSetup({
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
            },
          });
        }
        // Gửi yêu cầu với Bearer Token
       window.location.href = '/';
    
       
      } else {
        alert(res.code);
        Toast.fire({
          icon: "warning",
          title: res.message || "Đăng nhập thất bại",
        });
      }
    },
    error: function (xhr, status, error) {
      Toast.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
      });

      // Ví dụ bắt mã lỗi trả về và hiển thị message từ thông báo lỗi của server
      setTimeout(function () {
        // Chờ 3 giây trước khi hiển thị toast mã lỗi
        let response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        if (response && response.message) {
          Toast.fire({
            icon: "error",
            title: response.message + " - " + response.code,
          });
        }
        console.log(xhr.status); // HTTP status code
        console.log(status); // status text (timeout, error, abort, parsererror)
        console.log(error); // Textual portion of the HTTP status
        // End example
      }, 3000);
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
