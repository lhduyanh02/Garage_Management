// import { redirect_page } from "../utils";

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });

  function login() {
    let email = $("#email").val();
    let password = $("#password").val();
    $.ajax({
      url: "auth/token",
      type: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ email: email, password: password }),
      success: function (res) {
        if (res.code === 1000 && res.data.authenticated) {
          // Lưu token vào cookie
          // document.cookie = `token=${res.data.token}; path=/; secure;`;
          sessionStorage.setItem('token', res.data.token);
          
            
          // Gửi yêu cầu với Bearer Token
          // redirect_page('/');
          window.location.href = "/";


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
        setTimeout(function() { // Chờ 3 giây trước khi hiển thị toast mã lỗi 
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










//   function redirect_page(url) {
//     // Lấy token từ sessionStorage
//     const token = sessionStorage.getItem('token');

//     if (!token) {
//         alert("token not founded");
//         window.location.href("/login")
//         return;
//     }

//     // Gọi API để lấy trang HTML với Bearer Token
//     fetch(url, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'text/html'
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Failed to fetch the page');
//         }
//         return response.text(); // Nhận HTML dưới dạng text
//     })
//     .then(html => {
//         const contentDiv = document.getElementById('content'); // Thay thế nội dung bằng HTML mới
//         contentDiv.innerHTML = html;

//         // Re-execute any scripts included in the fetched HTML
//         const scripts = contentDiv.querySelectorAll('script');
//         scripts.forEach(script => {
//             const newScript = document.createElement('script');
//             newScript.src = script.src;
//             document.body.appendChild(newScript);
//         });
//     })
//     .catch(error => {
//         console.error('Error fetching the HTML page:', error);
//     });
// }