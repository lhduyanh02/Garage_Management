import * as utils from "/dist/js/utils.js";

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1500,
});

$(document).ready(function(){
  utils.checkLoginStatus().then(isValid => {
    if (isValid) {
      $("#login-out-btn").html(`
          <a id="logoutBtn" class="nav-link" href="javascript:void(0)" role="button" data-toggle="tooltip" data-placement="top" title="Đăng xuất">
            <i class="fa-solid fa-person-through-window"></i>
          </a>
      `);
      $('[data-toggle="tooltip"]').tooltip();
      $("#logoutBtn").click(function (e) { 
        
        let token = utils.getCookie('authToken');
        Swal.fire({
          title: "Đăng xuất?" ,
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Huỷ",
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed && token) {
            $.ajax({
              type: "POST",
              url: "/api/auth/logout",
              contentType: "application/json",
              data: JSON.stringify({
                token: token
              }),
              success: function (res) {
                if(res.code==1000){
                  Toast.fire({
                    icon: "success",
                    title: "Đã đăng xuất",
                    didClose: () => {
                      utils.deleteCookie('authToken');
                      window.location.reload();
                    }
                  });
                }else{
                  Toast.fire({
                    icon: "error",
                    title: "Lỗi",
                    didClose: () => {
                      utils.deleteCookie('authToken');
                      window.location.reload();
                    }
                  });
                }
              },
              error: function (xhr, status, error) {
                Toast.fire({
                  icon: "error",
                  title: "Internal server error",
                  didClose: () => {
                    utils.deleteCookie('authToken');
                    window.location.reload();
                  }
                });
              },
            });
          }
        });
      });
    } else {
      $("#login-out-btn").html(`
        <a class="nav-link" href="/login" role="button" data-toggle="tooltip" data-placement="top" title="Đăng nhập">
          <i class="fa-solid fa-car-on fa-shake fa-lg"></i>
        </a>
      `);
      $('[data-toggle="tooltip"]').tooltip();
    }
  });

});