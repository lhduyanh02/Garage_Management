import * as utils from "/dist/js/utils.js";

utils.introspect();

var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  width: 'auto'
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
var listBrand = [];

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
      headers: utils.defaultHeaders(),
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
      error: function(xhr, status, error){
        var statusCode = xhr.status;
        var message = 'Lỗi không xác định, không có mã lỗi';
        try {
            var response = JSON.parse(xhr.responseText);
            if (response.code) {
                message = utils.getErrorMessage(response.code);
            }
        } catch (e) {
            // Lỗi khi parse JSON
            console.log("JSON parse error");
            message = 'Lỗi không xác định, không có mã lỗi';
        }
        Toast.fire({
            icon: "error",
            title: message
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

  $.ajax({
    type: "GET",
    url: "/api/brands",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "",
    },
    success: function (res) {
      if(res.code == 1000) {
        listBrand = res.data;
      }
      else {
        Toast.fire({
          icon: "error",
          title: utils.getErrorMessage(res.code)
        })
      }
    },
    error: function(xhr, status, error){
      console.log(xhr);
      
      Toast.fire({
          icon: "error",
          title: utils.getXHRInfo(xhr)
      });
    }
  });
});

$("#tableCollapseBtn").click(function (e) {
  if (dataTableCard.hasClass("collapsed-card")) {
    dataTable.ajax.reload();
  }
});

$("#data-table").on("click", "#editBtn", async function () {
  let id = $(this).data("id");
  let res;
  try {
    res = await $.ajax({
      type: "GET",
      url: "/api/models/"+id,
      headers: utils.defaultHeaders(),
      dataType: "json",
    });
  }
  catch (e) {
    console.log(e);
    Toast.fire({
      icon: "error",
      title: utils.getXHRInfo(e).message
    });
    return;
  }

  if (res.code == 1000 && res.data){
    clear_modal();
    $("#modal_title").text("Chỉnh sửa mẫu xe");

    $("#modal_body").append(`
      <div class="form-group">
          <label>Hãng xe</label>
          <div class="form-group">
              <select id="brand-select" class="form-control select2bs4" style="width: 100%;" data-placeholder="Chọn hãng xe">
              </select>
          </div>
      </div>
  
      <div class="form-group">
        <div class="container mt-3 mb-0">
          <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="mb-0" for="modal_model_name_input">Tên mẫu xe</label>
              <kbd id="char_count" class="mb-0 small">0/100</kbd>
          </div>
        </div>
        <input type="text" class="form-control" id="modal_model_name_input" maxlength="100" placeholder="Nhập tên mẫu xe">
        <p class="font-weight-light pt-3">Lưu ý: Tên mẫu xe tối đa 100 ký tự và không trùng với mẫu đã có.</p>
      </div>
    `);
    
    $.each(listBrand, function (idx, val) { 
      if(val.id == res.data.brand.id)
        $('#brand-select').append(`<option selected value="${val.id}">${val.brand}</option>`);
      else 
        $('#brand-select').append(`<option value="${val.id}">${val.brand}</option>`);
    });

    $('#modal_model_name_input').val(res.data.model);
    
    // Đếm số ký tự
    utils.set_char_count("#modal_model_name_input", "#char_count")
  
    $("#modal_footer").append(
      '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
    );
    $("#modal_id").modal("show");
  
    $("#brand-select").select2({
      allowClear: false,
      theme: "bootstrap",
      closeOnSelect: true,
      language: "vi",
    });
  
    $("#modal_submit_btn").click(function () {
      let brand = $("#brand-select").val();
      let model = $('#modal_model_name_input').val().trim();
  
      if(brand == null){
        Toast.fire({
          icon: "warning",
          title: "Vui lòng chọn hãng xe!"
        });
        return;
      } else if (model.length > 100) {
        Toast.fire({
          icon: "warning",
          title: "Tên mẫu xe không được dài hơn 100 ký tự!"
        });
        return;
      }
       else {
        $.ajax({
          type: "PUT",
          url: "/api/models/"+id,
          headers: utils.defaultHeaders(),
          contentType: "application/json",
          data: JSON.stringify({
            model: model,
            brand: brand
          }),
          success: function (response) {
            if(response.code==1000){
              let val = response.data;
              Toast.fire({
                icon: "success",
                title: "Đã cập nhật mẫu xe<br>" + val.brand.brand + " " + val.model ,
              });
              $("#modal_id").modal("hide");
              // Tải lại bảng chức năng
              dataTable.ajax.reload();
            }
            else {
              Toast.fire({
                icon: "error",
                title: "Đã xảy ra lỗi, chi tiết:<br>" + response.message,
              });
            }
          },
          error: function(xhr, status, error){
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr).message
            });
            dataTable.ajax.reload();
          },
        });
      }
    });
  } 
  else {
    Toast.fire({
      icon: "error",
      title: utils.getErrorMessage(res.code)
    });
    return;
  }
});

$("#newBrand_btn").on("click", function () {
  clear_modal();

  $("#modal_title").text("Thêm mới hãng xe");

  $("#modal_body").append(`
    <div class="form-group">
    <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_brand_name_input">Tên hãng xe</label>
            <kbd id="char_count" class="mb-0 small">0/50</kbd>
        </div>
      <input type="text" class="form-control" id="modal_brand_name_input" maxlength="50" placeholder="Nhập tên hãng xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên hãng tối đa 50 ký tự và không trùng với hãng đã có.</p>
    </div>
    
    `);

  // Đếm số ký tự
  var $input = $('#modal_brand_name_input');
  var $charCount = $('#char_count');
  var maxChars = 50;
  $input.on('input', function() {
    var currentLength = $input.val().length;
    $charCount.text(currentLength + '/' + maxChars);
  });

  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

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
        url: "/api/brands",
        contentType: "application/json",
        headers: utils.defaultHeaders(),
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
        error: function(xhr, status, error){
          var statusCode = xhr.status;
          var message = 'Lỗi không xác định, không có mã lỗi';
          try {
              var response = JSON.parse(xhr.responseText);
              if (response.code) {
                  message = utils.getErrorMessage(response.code);
              }
          } catch (e) {
              // Lỗi khi parse JSON
              console.log("JSON parse error");
              message = 'Lỗi không xác định, không có mã lỗi';
          }
          Toast.fire({
              icon: "error",
              title: message
          });
          dataTable.ajax.reload();
        }
      });
      $("#modal_id").modal("hide");
    }
  });
});


$("#newModel_btn").on("click", function () {
  clear_modal();

  $("#modal_title").text("Thêm mới mẫu xe");

  $("#modal_body").append(`
    <div class="form-group">
        <label>Hãng xe</label>
        <div class="form-group">
            <select id="brand-select" class="form-control select2bs4" style="width: 100%;">
              <option selected disabled> Chọn hãng xe </option>
            </select>
        </div>
    </div>

    <div class="form-group">
      <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_model_name_input">Tên mẫu xe</label>
            <kbd id="char_count" class="mb-0 small">0/100</kbd>
        </div>
      </div>
      <input type="text" class="form-control" id="modal_model_name_input" maxlength="100" placeholder="Nhập tên mẫu xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên mẫu xe tối đa 100 ký tự và không trùng với mẫu đã có.</p>
    </div>
  `);

    // Đếm số ký tự
    var $input = $('#modal_model_name_input');
    var $charCount = $('#char_count');
    var maxChars = 100;
    $input.on('input', function() {
      var currentLength = $input.val().length;
      $charCount.text(currentLength + '/' + maxChars);
    });
    
    $.ajax({
      type: "GET",
      url: "/api/brands",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "",
      },
      success: function (res) {
        if(res.code == 1000) {
          $.each(res.data, function (id, val) {
            $("#brand-select").append(
              '<option value="' + val.id + '">' + val.brand + '</option>'
            );
          });
        }
        else {
          Toast.fire({
            icon: "error",
            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
          })
        }
      },
      error: function(xhr, status, error){
        var statusCode = xhr.status;
        var message = 'Lỗi không xác định, không có mã lỗi';
        try {
            var response = JSON.parse(xhr.responseText);
            if (response.code) {
                message = utils.getErrorMessage(response.code);
            }
        } catch (e) {
            // Lỗi khi parse JSON
            console.log("JSON parse error");
            message = 'Lỗi không xác định, không có mã lỗi';
        }
        Toast.fire({
            icon: "error",
            title: message
        });
      }
    });

  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $("#brand-select").select2({
    placeholder: "Chọn hãng xe",
    allowClear: true,
    // dropdownParent: $('#modal_body'),
    theme: "bootstrap",
    // tokenSeparators: [",", " "],
    closeOnSelect: true,
    language: "vi",
  });



  $("#modal_submit_btn").click(function () {
    let brand = $("#brand-select").val();
    let model = $('#modal_model_name_input').val().trim();

    if(brand == null){
      Toast.fire({
        icon: "warning",
        title: "Vui lòng chọn hãng xe!"
      });
      return;
    } else if (model.length > 100) {
      Toast.fire({
        icon: "warning",
        title: "Tên mẫu xe không được dài hơn 100 ký tự!"
      });
      return;
    }
     else {
      $.ajax({
        type: "POST",
        url: "/api/models",
        headers: utils.defaultHeaders(),
        contentType: "application/json",
        data: JSON.stringify({
          model: model,
          brand: brand
        }),
        success: function (res) {
          if(res.code==1000){
            let val = res.data;
            Toast.fire({
              icon: "success",
              title: "Đã thêm mẫu xe<br>" + val.brand.brand + " " + val.model ,
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
        error: function(xhr, status, error){
          var statusCode = xhr.status;
          var message = 'Lỗi không xác định, không có mã lỗi';
          try {
              var response = JSON.parse(xhr.responseText);
              if (response.code) {
                  message = utils.getErrorMessage(response.code);
              }
          } catch (e) {
              // Lỗi khi parse JSON
              console.log("JSON parse error");
              message = 'Lỗi không xác định, không có mã lỗi';
          }
          Toast.fire({
              icon: "error",
              title: message
          });
          dataTable.ajax.reload();
        },
      });
      $("#modal_id").modal("hide");
    }
  });
});

$('#editBrand_btn').click(function () { 
  clear_modal();
  $("#modal_title").text("Sửa tên hãng");
  $("#modal_body").append(`
    <div class="form-group">
        <label>Hãng xe</label>
        <div class="form-group">
            <select id="brand-select" class="form-control select2bs4" style="width: 100%;">
              <option selected disabled> Chọn hãng xe </option>
            </select>
        </div>
    </div>

    <div class="form-group">
       <div class="container mt-3 mb-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="mb-0" for="modal_brand_name_input">Tên hãng xe</label>
            <kbd id="char_count" class="mb-0 small">0/50</kbd>
        </div>
    </div>
      <input type="text" class="form-control" id="modal_brand_name_input" maxlength="50" placeholder="Cập nhật tên hãng xe">
      <p class="font-weight-light pt-3">Lưu ý: Tên hãng tối đa 50 ký tự và không trùng với hãng đã có.</p>
    </div>
  `);

    // Đếm số ký tự
    var $input = $('#modal_brand_name_input');
    var $charCount = $('#char_count');
    var maxChars = 50;
    $input.on('input', function() {
      var currentLength = $input.val().length;
      $charCount.text(currentLength + '/' + maxChars);
    });
    
    $.ajax({
      type: "GET",
      url: "/api/brands",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "",
      },
      success: function (res) {
        if(res.code == 1000) {
          $.each(res.data, function (id, val) {
            $("#brand-select").append(
              '<option value="' + val.id + '">' + val.brand + '</option>'
            );
          });
        }
        else {
          Toast.fire({
            icon: "error",
            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
          })
        }
      },
      error: function(xhr, status, error){
        var statusCode = xhr.status;
        var message = 'Lỗi không xác định, không có mã lỗi';
        try {
            var response = JSON.parse(xhr.responseText);
            if (response.code) {
                message = utils.getErrorMessage(response.code);
            }
        } catch (e) {
            // Lỗi khi parse JSON
            console.log("JSON parse error");
            message = 'Lỗi không xác định, không có mã lỗi';
        }
        Toast.fire({
            icon: "error",
            title: message
        });
      }
    });

    $('#brand-select').on("change", function () {
      let brand = $('#brand-select').val();
      let oldBrandName = $('#brand-select option:selected').text();
      
      $('#modal_brand_name_input').attr('value', oldBrandName);
    });

  $("#modal_footer").append(
    '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
  );
  $("#modal_id").modal("show");

  $("#brand-select").select2({
    placeholder: "Chọn hãng xe",
    allowClear: true,
    // dropdownParent: $('#modal_body'),
    theme: "bootstrap",
    // tokenSeparators: [",", " "],
    closeOnSelect: true,
    language: "vi",
  });

  $("#modal_submit_btn").click(function () {
    let id = $("#brand-select").val();
    let brand = $('#modal_brand_name_input').val().trim();

    if(id == null){
      Toast.fire({
        icon: "warning",
        title: "Vui lòng chọn hãng xe!"
      });
      return;
    } else if (brand.length > 50) {
      Toast.fire({
        icon: "warning",
        title: "Tên hãng xe không được dài hơn 50 ký tự!"
      });
      return;
    }
     else {
      $.ajax({
        type: "PUT",
        url: "/api/brands?id=" + id,
        contentType: "application/json",
        headers: utils.defaultHeaders(),
        data: JSON.stringify({
          brand: brand
        }),
        success: function (res) {
          if(res.code==1000){
            Toast.fire({
              icon: "success",
              title: "Đã cập nhật hãng <br>" + res.data.brand,
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
        error: function(xhr, status, error){
          var statusCode = xhr.status;
          var message = 'Lỗi không xác định, không có mã lỗi';
          try {
              var response = JSON.parse(xhr.responseText);
              if (response.code) {
                  message = utils.getErrorMessage(response.code);
              }
          } catch (e) {
              // Lỗi khi parse JSON
              console.log("JSON parse error");
              message = 'Lỗi không xác định, không có mã lỗi';
          }
          Toast.fire({
              icon: "error",
              title: message
          });
          dataTable.ajax.reload();
        },
      });
      $("#modal_id").modal("hide");
    }
  });
});