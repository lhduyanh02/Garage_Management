import * as utils from "/dist/js/utils.js";

utils.introspect();
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
                            roles: user.roles
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
            { data: null,
                render: function(data, type, row) {
                    if(row.phone != null){
                        return row.name + "<br><small><i>" + row.phone + "</i></small>";
                    } else {
                        return row.name;
                    }
                } 
            },
            { data: "gender",
                render: function (data, type, row){
                    if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-child-dress"></i>&nbsp; Nữ</span></center>';
                    } else if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-child-reaching"></i>&nbsp; Nam</span></center>';
                    } else {
                        return '<center><span class="badge badge-light"><i class="fa-solid fa-mars-and-venus"></i>&nbsp; Khác</span></center>';
                    }
                }
            },
            {
                data: "address",
                render: function(data, type, row){
                    if (data != null) {
                        return data.address;
                    }
                    else return '';
                }
            },
            {
                data: "roles", 
                render: function (data, type, row) {
                    if (data != null && Array.isArray(data)) {
                        // Sử dụng map để lấy roleName và join để kết hợp lại
                        var roleNames = data.map(function(role) {
                            return role.roleName;
                        }).join('<br>');
                        return '<div style="text-align: center;">' + roleNames + '</div>';
                    }
                    return '';
                }
            },
            { data: "status",
                render: function (data, type, row){
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang hoạt động</span></center>';
                    } else if (data == 0) {
                        return '<center><span class="badge badge-warning"><i class="fa-solid fa-clock"></i>&nbsp; Chưa xác thực</span></center>';
                    } else if (data == -1){
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Bị khóa</span></center>';
                    }
                    return '';
                }
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;
                    if(row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`
                    }
                    if(row.status == 0) {
                        html += ` <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`
                    }
                    if(row.status == -1) {
                        html += ` <a class="btn btn-success btn-sm" id="enableBtn" data-id="${data}">
                            <i class="fas fa-user-check"></i></a>`
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
    let id = $(this).data("id");
    console.log(id);
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
                    if(res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: `Đã xóa ${name}`
                        });
                    }
                    else {
                        Toast.fire({
                            icon: "error",
                            title: res.message
                        });
                    }
                    dataTable.ajax.reload();
                },
                error: function (xhr, status, error){
                    let message = "Mã lỗi không xắc định";

                    try {
                        let responseCode = JSON.parse(xhr.responseText).code;
                        message = utils.getErrorMessage(responseCode)
                    } catch (error) {
                        console.log("JSON parse error");
                    }
                    Toast.fire({
                        icon: "error",
                        title: message
                    });
                    dataTable.ajax.reload();
                }
            });
        }
    });

    
});