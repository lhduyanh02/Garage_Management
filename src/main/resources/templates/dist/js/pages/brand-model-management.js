import * as utils from "/dist/js/utils.js";

utils.introspect();

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

// utils.introspect();

// Clear modal
function clear_modal() {
  $("#modal_title").empty();
  $("#modal_body").empty();
  $("#modal_footer").empty();
}

var dataTable;
var dataTableCard = $("#data-table-card");

$(document).ready(function () {
  dataTable = $("#data-table").DataTable({
    responsive: true,
    lengthChange: true,
    autoWidth: false,
    buttons: [
      { extend: "copy", text: "Copy" },
      { extend: "csv", text: "CSV" },
      { extend: "excel", text: "Excel" },
      {
        extend: "pdf",
        text: "PDF",
      },
      { extend: "print", text: "Print" },
      { extend: "colvis", text: "Column Visibility" },
    ],
    columnDefs: [
      { orderable: false, targets: 3 }, // Vô hiệu hóa sort cho cột Thao tác (index 3)
      { className: "text-center", targets: 0 },
    ],
    ajax: {
      type: "GET",
      url: "/api/brands/fetch-model",
      dataType: "json",
      dataSrc: function (res) {
        if (res.code == 1000) {
          var data = [];
          var counter = 1;
          res.data.forEach(function (brandItem) {
            brandItem.models.forEach(function (modelItem) {
              data.push({
                number: counter++, // Số thứ tự tự động tăng
                brand: brandItem.brand, // Hãng xe
                model: modelItem.model, // Mẫu xe
                id: modelItem.id, // ID của model (dùng cho cột Thao tác)
              });
            });
          });

          return data; // Trả về dữ liệu đã được xử lý
        } else {
          Toast.fire({
            icon: "error",
            title: res.message || "Error in fetching data",
          });
        }
      },
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Internal server error",
        });
      },
    },
    columns: [
      { data: "number" },
      { data: "brand" },
      { data: "model" },
      {
        data: "id",
        render: function (data, type, row) {
          return (
            '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
            data +
            '"><i class="fas fa-pencil-alt"></i></a></center>'
          );
        },
      },
    ],
    drawCallback: function (settings) {
      // Số thứ tự không thay đổi khi sort hoặc paginations
      var api = this.api();
      var start = api.page.info().start;
      api
        .column(0, { page: "current" })
        .nodes()
        .each(function (cell, i) {
          cell.innerHTML = start + i + 1;
        });
    },
    initComplete: function () {
      this.api()
        .buttons()
        .container()
        .appendTo("#data-table_wrapper .col-md-6:eq(0)");
    },
  });
});

$("#tableCollapseBtn").click(function (e) {
  if (dataTableCard.hasClass("collapsed-card")) {
    dataTable.ajax.reload();
  }
});

$("#data-table").on("click", "#editBtn", function () {
  clear_modal();

  $("#modal_title").text("Thêm chức năng");

  $(
    "#modal_body"
  ).append(`<div class="form-group"><label for="modal_tenvaitro_input">Tên vai trò</label>
    <input type="text" class="form-control" id="modal_tenvaitro_input" placeholder="Nhập tên vai trò"></div>
    
    <div class="form-group">
        <label>Chức năng</label>
        <div class="form-group">
            <select id="select2-test" class="form-control select2bs4" style="width: 100%;">
            </select>
        </div>
    </div>`);

  $("#select2-test").append(
    // '<option value="' + val.id + '">' + val.ten + "</option>"
    `
            <option selected="selected">Chọn đi</option>
            <option>Alaska</option>
            <option>California</option>
            <option>Delaware</option>
            <option>Tennessee</option>
            <option>Texas</option>
            <option>Washington</option>
            `
  );

  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $(".select2bs4").select2({
    placeholder: "",
    allowClear: true,
    // dropdownParent: $('#modal_body'),
    theme: "bootstrap",
    tokenSeparators: [",", " "],
    closeOnSelect: false,
  });

  $("#select2-select2-test-container").css("font-size", "17px !important");
  // Swal.fire({
  //     title: "Xác nhận?" ,
  //     showDenyButton: false,
  //     showCancelButton: true,
  //     confirmButtonText: "Đồng ý",
  //     cancelButtonText: "Huỷ",
  //   }).then((result) => {
  //     /* Read more about isConfirmed, isDenied below */
  //     if (result.isConfirmed) {
  //       $.ajax({
  //         type: "POST",
  //         url: "/",
  //         contentType: "application/json",
  //         data: JSON.stringify({
  //           ids: id,
  //           trangthai: 1
  //         }),
  //         success: function (res) {
  //           if(res.total==1){
  //             Toast.fire({
  //               icon: "success",
  //               title: "Confirmed",
  //             });
  //             // Tải lại bảng bangdsyeucau
  //             dataTable.ajax.reload();
  //           }else{
  //             Toast.fire({
  //               icon: "warning",
  //               title: "Error"
  //             });
  //             // Tải lại bảng bangdsyeucau
  //             dataTable.ajax.reload();
  //           }
  //         },
  //         error: function (xhr, status, error) {
  //           Toast.fire({
  //             icon: "error",
  //             title: "Internal server error",
  //           });
  //         },
  //       });
  //     }
  //   });
});

$("#newBrand_btn").on("click", function () {
  clear_modal();

  $("#modal_title").text("Thêm mới hãng xe");

  $("#modal_body").append(`
    <div class="form-group">
      <label for="modal_brand_name_input">Tên hãng xe</label>
      <input type="text" class="form-control" id="modal_brand_name_input" placeholder="Nhập tên hãng xe">
      <p class="font-weight-light pt-3">**Lưu ý: Tên hãng tối đa 50 ký tự và không trùng với hãng đã có.</p>
    </div>
    
    `);

  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  // $(".select2bs4").select2({
  //   placeholder: "",
  //   allowClear: true,
  //   // dropdownParent: $('#modal_body'),
  //   theme: "bootstrap",
  //   tokenSeparators: [",", " "],
  //   closeOnSelect: false,
  // });

  $("#modal_submit_btn").click(function () {
    let ten = $("#modal_brand_name_input").val();

    if(ten == null || ten.trim()==""){
      Toast.fire({
        icon: "error",
        title: "Vui lòng điền tên hãng!"
      });
      return;
    } else if (ten.length > 50) {
      Toast.fire({
        icon: "error",
        title: "Tên hãng không được dài hơn 50 ký tự!"
      });
      return;
    }
     else {
      $.ajax({
        type: "POST",
        url:
          "/api/brands",
        contentType: "application/json",
        data: JSON.stringify({
          brand: ten
        }),
        success: function (res) {
          if(res.code==1000){
            Toast.fire({
              icon: "success",
              title: "Đã thêm hãng<br>" + ten ,
            });
          }
          else {
            Toast.fire({
              icon: "error",
              title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
            });
          }
          // Tải lại bảng chức năng
          dataTable.ajax.reload();
        },
        error: function (xhr, status, error) {
          Toast.fire({
            icon: "error",
            title: "Lỗi! Thực hiện không thành công",
          });
        },
      });
      $("#modal_id").modal("hide");
    }
  });
});
