import * as utils from "/dist/js/utils.js";

utils.introspect(true);
utils.setAjax();

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

// Clear modal
function clear_modal() {
    $("#modal_title").empty();
    $("#modal_body").empty();
    $("#modal_footer").empty();
}

// Mảng để lưu các option mới
var addressOptions = [];
var dataTable;
var dataTableCard = $("#data-table-card");

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

function set_char_count(inputId, counterId, length) {
    $(inputId).on('input', function() {
      var currentLength = $(inputId).val().length;
      $(counterId).text(currentLength + '/' + length);
    });
}

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
            { orderable: false, targets: 6 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/users",
            dataType: "json",
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (user) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: user.id,
                            name: user.name,
                            phone: user.phone,
                            gender: user.gender,
                            status: user.status,
                            address: user.address,
                            roles: user.roles,
                        });
                    });

                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: res.message || "Lỗi! Không thể lấy dữ liệu",
                    });
                }
            },
            error: function (xhr, status, error) {
                var message = "Lỗi không xác định";
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.code) {
                        message = utils.getErrorMessage(response.code);
                    }
                } catch (e) {
                    // Lỗi khi parse JSON
                    console.log("JSON parse error");
                    message = "Lỗi không xác định";
                }
                Toast.fire({
                    icon: "error",
                    title: message,
                });
            },
        },
        columns: [
            { data: "number" },
            {
                data: null,
                render: function (data, type, row) {
                    if (row.phone != null) {
                        return (
                            row.name +
                            "<br><small><i>" +
                            row.phone +
                            "</i></small>"
                        );
                    } else {
                        return row.name;
                    }
                },
            },
            {
                data: "gender",
                render: function (data, type, row) {
                    if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp; Nữ</span></center>';
                    } else if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-child-reaching"></i>&nbsp; Nam</span></center>';
                    } else {
                        return '<center><span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp; Khác</span></center>';
                    }
                },
            },
            {
                data: "address",
                render: function (data, type, row) {
                    if (data != null) {
                        return data.address;
                    } else return "";
                },
            },
            {
                data: "roles",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        // Sử dụng map để lấy roleName và join để kết hợp lại
                        var roleNames = data
                            .map(function (role) {
                                return role.roleName;
                            })
                            .join("<br>");
                        return (
                            '<div style="text-align: center;">' +
                            roleNames +
                            "</div>"
                        );
                    }
                    return "";
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang hoạt động</span></center>';
                    } else if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp; Chưa xác thực</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Bị khóa</span></center>';
                    }
                    return "";
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;
                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`;
                    }
                    if (row.status == 0) {
                        html += ` <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    }
                    if (row.status == -1) {
                        html += ` <a class="btn btn-success btn-sm" id="activateBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>`;
                    }
                    return "<center>" + html + "</center>";
                },
            },
        ],
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api.column(0, { page: "current" })
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
            var message = 'Mã lỗi không xác định, không thể tải địa chỉ';
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.code) {
                    message = utils.getErrorMessage(response.code);
                }
            } catch (e) {
                // Lỗi khi parse JSON
                console.log("JSON parse error");
            }
            Toast.fire({
                icon: "error",
                title: message
            });
        }
    });
});

$("#data-table").on("click", "#editBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/users/" + id,
        dataType: "json",
        success: function (res) {
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu người dùng"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa thông tin người dùng");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_name_input">Họ tên</label>
                            <kbd id="modal_name_counter" class="mb-0 small">0/255</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên người dùng">
                </div>

                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_phone_input">Số điện thoại</label>
                            <kbd id="modal_phone_counter" class="mb-0 small">0/50</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_phone_input" maxlength="50" placeholder="Nhập số điện thoại">
                </div>

                <div class="form-group">
                    <label>Giới tính</label>
                    <div class="form-group">
                        <select id="gender-select" class="form-control select2bs4" style="width: 100%;">
                        <option value="-1"> Khác </option>
                        <option value="1"> Nam </option>
                        <option value="0"> Nữ </option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Địa chỉ</label>
                    <select id="address-select" class="form-control select2bs4" style="width: 100%;">
                    </select>
                </div>

                <div class="form-group">
                    <label>Vai trò</label>
                    <select id="roles-select" multiple="multiple" class="form-control select2" style="width: 100%;">
                    </select>
                </div>
            `);

            $('#address-select').empty();
                
            
            if (res.data.address) {
                $("#address-select").append('<option disabled> Chọn địa chỉ </option>');
                $.each(addressOptions, function (index, option) {
                    if (option.id == res.data.address.id) { 
                        $('#address-select').append('<option selected value="' + option.id + '">' + option.address + '</option>');
                    } else {
                        $('#address-select').append('<option value="' + option.id + '">' + option.address + '</option>');
                    }
                });
            }
            else {
                $("#address-select").append('<option disabled selected> Chọn địa chỉ </option>');
                $.each(addressOptions, function (index, option) {
                    $('#address-select').append('<option value="' + option.id + '">' + option.address + '</option>');
                });
            }

            set_char_count("#modal_name_input", "#modal_name_counter", 255);
            set_char_count("#modal_phone_input", "#modal_phone_counter", 50);

            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
              );
            $("#gender-select").select2({
                placeholder: "Chọn giới tính",
                allowClear: true,
                // dropdownParent: $('#modal_body'),
                theme: "bootstrap",
                // tokenSeparators: [",", " "],
                closeOnSelect: true,
            });

            $("#address-select").select2({
                placeholder: "Chọn địa chỉ",
                allowClear: true,
                // dropdownParent: $('#modal_body'),
                theme: "bootstrap",
                // tokenSeparators: [",", " "],
                closeOnSelect: true,
            });

            $('#roles-select').select2({  
            placeholder: "Chọn các vai trò",
            })

            $("#modal_name_input").val(res.data.name);
            $("#modal_phone_input").val(res.data.phone);
            $("#gender-select").val(res.data.gender).trigger('change');

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                console.log("submit");
                
            });

        },
        error: function(xhr, status, error) {
            let message = "Mã lỗi không xác định";
            try {
                message = utils.getErrorMessage(JSON.parse(xhr.responseText).code);
            } catch (error) {
                console.log("JSON parse error");
            }
            Toast.fire({
                icon: "error",
                title: message
            });
        }
    });

});

$("#data-table").on("click", "#deleteBtn", function () {
    let id = $(this).data("id");

    if (id == null) {
        return;
    }

    // Lấy hàng hiện tại
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Xóa người dùng</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/users/" + id,
                dataType: "json",
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${name}`,
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: res.message,
                        });
                    }
                    dataTable.ajax.reload();
                },
                error: function (xhr, status, error) {
                    let message = "Mã lỗi không xắc định";

                    try {
                        let responseCode = JSON.parse(xhr.responseText).code;
                        message = utils.getErrorMessage(responseCode);
                    } catch (error) {
                        console.log("JSON parse error");
                    }
                    Toast.fire({
                        icon: "error",
                        title: message,
                    });
                    dataTable.ajax.reload();
                },
            });
        }
    });
});

$("#data-table").on("click", "#disableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Cấm (ban) người dùng</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/disable/" + id,
                dataType: "json",
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ban người dùng</br>" + name
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});

$("#data-table").on("click", "#activateBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Kích hoạt người dùng</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/users/activate/" + id,
                dataType: "json",
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã kích hoạt người dùng</br>"+name
                        });
                        dataTable.ajax.reload();
                    }
                },
                error: function(xhr, status, error){
                    let response = utils.getXHRInfo(xhr);
                    Toast.fire({
                        icon: "error",
                        title: response.message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });
});