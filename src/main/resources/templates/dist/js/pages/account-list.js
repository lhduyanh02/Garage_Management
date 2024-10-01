import * as utils from "/dist/js/utils.js";

utils.introspect(true);

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

var dataTable;
var dataTableCard = $("#data-table-card");

$("#tableCollapseBtn").click(function (e) {
    if (dataTableCard.hasClass("collapsed-card")) {
        dataTable.ajax.reload();
    }
});

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
            { orderable: false, targets: 5 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/accounts/all",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (account) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: account.id,
                            email: account.email,
                            status: account.status,
                            user: account.user,
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
                data: "user",
                render: function (data, type, row) {
                    let html="";
                    html += `${data.name} `;
                    if(data.gender==1){
                        html += ` <small><span class="badge badge-info"><i class="fa-solid fa-child-dress"></i>&nbsp; Nam</span></small><br>`
                    } else if(data.gender==0){
                        html += ` <small><span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp; Nữ</span></small><br>`
                    } else {
                        html += "<br>"
                    }

                    if(data.phone){
                        html += `<small><i>${data.phone}</i></small><br>`;
                    }

                    if(data.address){
                        html += `<small> ${data.address.address}</small><br>`; 
                    }

                    return html;
                },
            },
            { data: "email"},
            {
                data: "user.roles",
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        let html = "";
                        $.each(data , function (idx, val) {
                            html+=` <span class="badge badge-light">&nbsp; ${val.roleName}</span></br>`
                        });

                        
                        return (
                            '<center>' + html + '</center>'
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
                    let html = "";
                    if (row.status != 9999) {
                        html += `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;
                    }
                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`;
                    }
                    if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" id="activateBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>
                             <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
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
});

$("#data-table").on("click", "#editBtn", function () {
    var id = $(this).data("id");

    if (id == null) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/accounts/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu tài khoản"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa thông tin tài khoản");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_email_input">Email</label>
                            <kbd id="modal_email_counter" class="mb-0 small">0/256</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_email_input" maxlength="255" placeholder="Nhập email">
                </div>

                <div class="form-group">
                    <label>Hồ sơ liên kết</label>
                    <div class="form-group">
                        <select id="user-select" class="form-control select2bs4" style="width: 100%;">
                        <option disabled> Chọn 1 hồ sơ liên kết </option>
                        </select>
                    </div>
                </div>
            `);

            $('#user-select').empty();            
            if (res.data.user) {
                const phone = res.data.user.phone ? ` - ${res.data.user.phone}` : "";
                $('#user-select').append('<option selected value="' + res.data.user.id + '">' + res.data.user.name
                    + phone +'</option>');
            }

            (function () { // Sử dụng hàm IIFE (Immediately Invoked Function Expression) để tránh truy cập list từ console
                $.ajax({
                    url: "/api/users/is-active",
                    type: "GET",
                    dataType: "json",
                    headers: utils.defaultHeaders(),
                    success: function (response) {
                        let userList = response.data;  // Lưu userList trong closure, không phải biến toàn cục
            
                        // Khởi tạo Select2 sau khi nhận được dữ liệu từ AJAX
                        $("#user-select").select2({
                            allowClear: false,
                            theme: "bootstrap",
                            closeOnSelect: true,
                            minimumInputLength: 2,
                            data: userList.map(function (option) {
                                const phone = option.phone ? ` - ${option.phone}` : "";

                                return {
                                    id: option.id,
                                    text: `${option.name}${phone}`
                                };
                            }),
                            matcher: function (params, data) {
                                if ($.trim(params.term) === '') {
                                    return data;
                                }
            
                                const searchTerm = params.term.toLowerCase();
            
                                if (data.text.toLowerCase().indexOf(searchTerm) > -1) {
                                    return data;
                                }
            
                                return null;
                            }
                        });
                    }
                });
            })();


            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
              );

            $("#modal_email_input").val(res.data.email);
            
            utils.set_char_count("#modal_email_input", "#modal_email_counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                let email = $("#modal_email_input").val().trim();
                let user = $("#user-select").val();

                if(user == null){
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng chọn hồ sơ"
                    });
                    return;
                }

                if(phone == ""){
                    phone = null;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/users/"+id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        name: name,
                        phone: phone, 
                        gender: gender,
                        addressId: address,
                        roleIds: roles
                    }),
                    success: function (response) {
                        if(response.code == 1000)
                        Toast.fire({
                            icon: "success", 
                            title: "Cập nhật thông tin thành công"
                        });
                        $("#modal_id").modal("hide");
                        dataTable.ajax.reload();
                    },
                    error: function(xhr, status, error) {
                        Toast.fire({
                            icon: "error",
                            title: utils.getXHRInfo(xhr).message
                        });
                        dataTable.ajax.reload();
                    }
                });
            });

        },
        error: function(xhr, status, error) {
            let response = utils.getXHRInfo(xhr);
            Toast.fire({
                icon: "error",
                title: response.message
            });
            $("#modal_id").modal("hide");
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
    let email = rowData.email;

    Swal.fire({
        title: `Xóa tài khoản</br>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/accounts/" + id,
                dataType: "json",
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${email}`,
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
                    Toast.fire({
                        icon: "error",
                        title: utils.getXHRInfo(xhr).message,
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
    let email = rowData.email;

    Swal.fire({
        title: `Khóa tài khoản</br>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/accounts/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã khóa tài khoản</br>" + email
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
    let email = rowData.email;

    Swal.fire({
        title: `Kích hoạt tài khoản</br>${email}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/accounts/active/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã kích hoạt tài khoản</br>" + email
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


