import * as utils from "/dist/js/utils.js";

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
  let email = $("#email").val().trim();
  let password = $("#password").val();
  
  if (email == null) {
    Swal.fire({
      icon: "warning",
      title: "Vui lòng điền email",
      showCancelButton: false
    });
    return;
  }

  if (password == null) {
    Swal.fire({
      icon: "warning",
      title: "Vui lòng điền mật khẩu",
      showCancelButton: false
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
      "Authorization": ""
    },
    data: JSON.stringify({ email: email, password: password }),
    success: function (res) {
      if (res.code === 1000 && res.data.authenticated) {
        let expirationTime = (Date.now() + (24 * 60 * 60 * 1000)); // 1 ngày
        setTimeout(() => {;
          localStorage.setItem("tokenExpirationTime", expirationTime);
          window.location.href = path || '/';
        }, 500)
       
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
