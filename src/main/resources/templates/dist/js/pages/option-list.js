import * as utils from "/dist/js/utils.js";

utils.introspectPermission('GET_ALL_OPTION');

var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    width: "auto",
});

// Clear modal
function clear_modal() {
    if ($(".modal-dialog").hasClass("modal-lg")) {
        $(".modal-dialog").removeClass("modal-lg");
    }

    if ($(".modal-dialog").hasClass("modal-xl")) {
        $(".modal-dialog").removeClass("modal-xl");
    }
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
        language: {
            paginate: {
                next: "Sau",
                previous: "Trước",
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "Không có dữ liệu để hiển thị",
            infoFiltered: "(Lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
            search: "Tìm kiếm:",
            loadingRecords: "Đang tải dữ liệu...",
            zeroRecords: "Không tìm thấy dữ liệu",
        },
        buttons: [
            { extend: "copy", text: "Copy" },
            { extend: "csv", text: "CSV" },
            { extend: "excel", text: "Excel" },
            {
                extend: "pdf",
                text: "PDF",
            },
            { extend: "print", text: "Print" },
            { extend: "colvis", text: "Hiển thị" },
        ],
        columnDefs: [
            { orderable: false, targets: 4 }, // Vô hiệu hóa sort cho cột Thao tác (index 4)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/options/all-with-price",
            dataType: "json",
            headers: utils.defaultHeaders(),
            beforeSend: xhr => {
                const headers = utils.defaultHeaders(); // Lấy headers từ defaultHeaders()
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key]); // Thiết lập từng header
                }
            },
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (option) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: option.id,
                            name: option.name,
                            status: option.status,
                            servicePrices: option.servicePrices
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
                console.error(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
            },
        },
        columns: [
            { data: "number" },
            { data: "name" },
            { data: "servicePrices",
                render: function (data, type, row) {  
                    if(data.length == 0){
                        return "<i>Chưa có dịch vụ liên kết</i>"
                    }
                    else {
                        let html = "";
                        $.each(data, function (idx, val) { 
                            if(val.status == 1) {
                                html += `
                                        <b>${val.name} <span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang dùng</span><br></b>
                                        - Giá: ${val.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}<br>
                                `
                            } else {
                                html += `
                                        <b>${val.name} <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng dùng</span><br></b>
                                        - Giá: ${val.price}<br>
                                `
                            }
                        });

                        return html;
                    }
                }
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang sử dụng</span></center>';
                    } 
                    else if (data == 0) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
                    }
                    else if (data == -1) {
                        return '<center><span class="badge badge-secondary"><i class="fa-solid fa-xmark"></i>&nbsp;Đã xóa</span></center>';
                    }
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>`;

                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" style="padding: .25rem 0.4rem;" id="disableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i></a>`;
                    } else if (row.status == 0) {
                        html += ` <a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-check fa-lg"></i></a>
                        <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;
                    } else if (row.status == -1) {
                        html = `<a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-check fa-lg"></i></a>`;
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
            $('#data-table tbody').on('dblclick', 'td:nth-child(3)', function () {
                var row = $(this).closest('tr');
            
                // Tìm tất cả các thẻ <details> trong hàng đó và chuyển đổi trạng thái mở/đóng
                row.find('details').each(function () {
                    if ($(this).attr('open')) {
                        $(this).removeAttr('open');
                    } else {
                        $(this).attr('open', true);
                    }
                });
            });
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
        url: "/api/options/" + id,
        dataType: "json",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if(res.code != 1000) {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy dữ liệu tùy chọn"
                });
                return;
            }
            clear_modal();
            $("#modal_title").text("Sửa thông tin tùy chọn");
            $("#modal_body").append(`
                <div class="form-group">
                    <div class="container mt-3 mb-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="mb-0" for="modal_name_input">Tên tùy chọn</label>
                            <kbd id="modal_name_counter" class="mb-0 small">0/100</kbd>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="modal_name_input" maxlength="100" placeholder="Nhập tên tùy chọn">
                </div>

                <div class="form-group">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="is-apply-switch">
                        <label class="custom-control-label" for="is-apply-switch">Sử dụng</label>
                    </div>
                </div>
            `);

            $("#modal_footer").append(
                '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>'
              );

            $("#modal_name_input").val(res.data.name);
            if (res.data.status == 1) {
                $('#is-apply-switch').prop('checked', true);
            } else {
                $('#is-apply-switch').prop('checked', false);
            }
            
            utils.set_char_count("#modal_name_input", "#modal_name_counter");

            $("#modal_id").modal("show");

            $("#modal_submit_btn").click(function (){
                let name = $("#modal_name_input").val().trim();
                let isApply = $('#is-apply-switch').is(':checked') ? 1 : 0;

                if(name == ""){
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng điền tên option hợp lệ"
                    });
                    return;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/options/" + id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        name: name,
                        status: isApply
                    }),
                    success: function (response) {
                        if(response.code == 1000){
                            Swal.fire({
                                icon: "success", 
                                title: "Đã cập nhật tùy chọn<br>" + name
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        } else {
                            console.error(response);
                            Swal.fire({
                                icon: "warning",
                                title: "Đã xảy ra lỗi",
                                text: utils.getErrorMessage(response.code)
                            })
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr);
                        Swal.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi",
                            text: utils.getXHRInfo(xhr).message
                        });
                    }
                });
            });

        },
        error: function(xhr, status, error) {
            Swal.fire({
                icon: "error",
                title: "Đã xảy ra lỗi",
                text: utils.getXHRInfo(xhr).message
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
    let name = rowData.name;

    Swal.fire({
        title: `Xóa tùy chọn (option)</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: "/api/options/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000 && res.data == true) {
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
                    console.log(xhr);
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
    let name = rowData.name;

    Swal.fire({
        title: `Ngưng sử dụng option</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/options/disable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã ngưng sử dụng</br>" + name
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

$("#data-table").on("click", "#enableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let name = rowData.name;

    Swal.fire({
        title: `Sử dụng option</br>${name}?`,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Huỷ",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: "/api/options/enable/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if(res.code == 1000 && res.data == true) {
                        Toast.fire({
                            icon: "success",
                            title: "Đã bật sử dụng</br>" + name
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

$("#new-option-btn").click(function () { 
    clear_modal();
    $("#modal_title").text("Thêm tùy chọn");
    $("#modal_body").append(`
        <form id="modal-form">
            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_name_input">Tên tùy chọn</label>
                        <kbd id="modal_name_counter" class="mb-0 small">0/100</kbd>
                    </div>
                </div>
                <input type="text" class="form-control" id="modal_name_input" maxlength="100" placeholder="Nhập tên tùy chọn">
            </div>

            <div class="form-group">
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="is-apply-switch" checked>
                    <label class="custom-control-label" for="is-apply-switch">Sử dụng</label>
                </div>
            </div>
        </form>
    `);

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
        );
    
    utils.set_char_count("#modal_name_input", "#modal_name_counter");

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let name = $("#modal_name_input").val().trim();
        let isApply = $('#is-apply-switch').is(':checked') ? 1 : 0;

        if(name == ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền tên option hợp lệ"
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/options",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                name: name,
                status: isApply
            }),
            success: function (response) {
                if(response.code == 1000){
                    Toast.fire({
                        icon: "success", 
                        title: "Đã thêm tùy chọn<br>" + name
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code)
                    })
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr);
                Toast.fire({
                    icon: "error",
                    title: utils.getXHRInfo(xhr).message
                });
                dataTable.ajax.reload();
            }
        });
    });
});

