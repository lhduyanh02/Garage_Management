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
var userList = [];

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
            { orderable: false, targets: 4 }, // Vô hiệu hóa sort cho cột Thao tác (index 4)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/services/all-with-price",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (service) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: service.id,
                            name: service.name,
                            description: service.description,
                            status: service.status,
                            optionPrices: service.optionPrices
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
                data: "name",
                render: function (data, type, row) {
                    let html="";
                    html += `<b>${data}<br></b>`;
                    if(row.description != null){
                        html += `<i>Mô tả:</i> <span>${row.description}<br></span>`
                    }

                    return html;
                },
            },
            { data: "optionPrices",
                render: function (data, type, row) {  
                    if(data.length == 0){
                        return "<i>Chưa có tùy chọn nào</i>"
                    }
                    else {
                        let html = "";
                        $.each(data, function (idx, val) { 
                            let priceStatus = "";
                            if(val.priceStatus == 1) {
                                priceStatus = `Đang áp dụng`;
                            } else {
                                priceStatus = `Ngưng áp dụng`;
                            }

                            if(val.status == 1) {
                                html += `
                                <details>
                                    <summary><b>${val.name} <span class="badge badge-success"><i class="fa-solid fa-check"></i>&nbsp;Đang dùng</span></b></summary>
                                    <p>
                                        - Giá: ${val.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}<br>
                                        - Trạng thái: ${priceStatus}<br>
                                    </p>
                                </details>
                                `
                            } else {
                                html += `
                                        <b>${val.name} <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng dùng</span><br></b>
                                        - Giá: ${val.price}<br>
                                        - Trạng thái: ${priceStatus}<br><br>
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
                    } else {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp;Ngưng sử dụng</span></center>';
                    }
                },
            },
            {
                data: "id",
                render: function (data, type, row) {
                    let html = `<a class="btn btn-info btn-sm" id="editBtn" data-id="${data}">
                        <i class="fas fa-pencil-alt"></i></a>
                        <a class="btn btn-danger btn-sm" id="deleteBtn" data-id="${data}">
                            <i class="fas fa-trash"></i></a>`;

                    if (row.status == 1) {
                        html += ` <a class="btn btn-warning btn-sm" style="padding: .25rem 0.4rem;" id="disableBtn" data-id="${data}">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i></a>`;
                    } else {
                        html += ` <a class="btn btn-success btn-sm" style="padding: .25rem 0.4rem;" id="enableBtn" data-id="${data}">
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

                if(email == ""){
                    Toast.fire({
                        icon: "warning",
                        title: "Vui lòng điền email hợp lệ"
                    });
                    return;
                }

                $.ajax({
                    type: "PUT",
                    url: "/api/accounts/"+id,
                    headers: utils.defaultHeaders(),
                    data: JSON.stringify({
                        email: email,
                        userId: user
                    }),
                    success: function (response) {
                        if(response.code == 1000){
                            Toast.fire({
                                icon: "success", 
                                title: "Cập nhật tài khoản thành công"
                            });
                            $("#modal_id").modal("hide");
                            dataTable.ajax.reload();
                        } else if (response.code == 1067){ // Tham chiếu từ ErrorCode
                            Swal.fire({
                                title: `Hành động này sẽ vô hiệu hóa tất cả tài khoản khác liên kết với hồ sơ này?`,
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
                                if (result.isConfirmed) {
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/accounts/confirm/"+id,
                                        headers: utils.defaultHeaders(),
                                        data: JSON.stringify({
                                            email: email,
                                            userId: user
                                        }),
                                        success: function (res) {
                                            if (res.code == 1000) {
                                                Toast.fire({
                                                    icon: "success", 
                                                    title: "Cập nhật tài khoản thành công"
                                                });
                                            }
                                            $("#modal_id").modal("hide");
                                            dataTable.ajax.reload();
                                        },
                                        error: function (xhr, status, error) {
                                            Toast.fire({
                                                icon: "error",
                                                title: utils.getXHRInfo(xhr).message,
                                            });
                                        },
                                    });
                                }
                            });
                        } 
                        else {
                            Toast.fire({
                                icon: "warning",
                                title: utils.getErrorMessage(response.code)
                            })
                        }
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
                url: "/api/accounts/hard/" + id,
                dataType: "json",
                headers: utils.defaultHeaders(),
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

$("#data-table").on("click", "#enableBtn", function () {
    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let rowData = $("#data-table").DataTable().row(row).data();
    // Lấy tên từ dữ liệu của hàng
    let email = rowData.email;
    let userId = rowData.user.id;

    var columnData = dataTable.column(1).data().toArray();
    const count = columnData.filter(item => item.id === userId).length;

    let question = "";
    if(count > 1){
        question = `Kích hoạt tài khoản ${email}<br> sẽ vô hiệu hóa các tài khoản khác liên kết đến cùng hồ sơ?`
    } else {
        question = `Kích hoạt tài khoản</br>${email}?`
    }

    Swal.fire({
        title: question,
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

$("#new-service-btn").click(function () { 
    clear_modal();
    $("#modal_title").text("Thêm dịch vụ");
    $("#modal_body").append(`
        <form id="modal-form">
            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_name_input">Tên dịch vụ</label>
                        <kbd id="modal_name_counter" class="mb-0 small">0/256</kbd>
                    </div>
                </div>
                <input type="text" class="form-control" id="modal_name_input" maxlength="255" placeholder="Nhập tên dịch vụ">
            </div>

            <div class="form-group">
                <div class="container mt-3 mb-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="mb-0" for="modal_description_input">Mô tả chi tiết</label>
                        <kbd id="modal_description_counter" class="mb-0 small">0/65000</kbd>
                    </div>
                </div>
                <textarea wrap="soft" 
                    class="form-control" 
                    id="modal_description_input" 
                    rows="3" maxlength="65000" 
                    placeholder="Mô tả chi tiết"></textarea>
            </div>

            <div class="input_wrap form-group">
                <label>Danh sách tùy chọn</label>
                <div id="option-wrapper">
                    <div class="row my-2">
                        <div class="col-md-7">
                            <select class="form-control select2bs4 option-select" width="100%" data-placeholder="Select an option">
                            </select>
                        </div>

                        <div class="input-group col-md-5">
                            <input type="text" name="text[]" class="form-control option-price-input" placeholder="Giá">
                            <div class="input-group-append option-price-input">
                                <span class="input-group-text">VND</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" id="add-option-btn" class="btn btn-sm btn-secondary mt-2">Thêm tùy chọn</button>
            </div>

            <div class="form-group">
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="is-enable-switch" checked>
                    <label class="custom-control-label" for="is-enable-switch">Sử dụng</label>
                </div>
            </div>
        </form>
    `);    

    $('.select2bs4').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        width: '100%'
    });

    utils.set_char_count("#modal_name_input", "#modal_name_counter");
    utils.set_char_count("#modal_description_input", "#modal_description_counter");

    var optionList = [];

    $.ajax({
        type: "GET",
        url: "/api/options",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        success: function (response) {
            if(response.code == 1000){
                optionList = [];
                $.each(response.data, function (idx, val) { 
                    optionList.push({ id: val.id, text: val.name, isSelected: 0 });
                    $(".option-select").append(`<option value="${val.id}">${val.name}</option>`);
                });
                updateIsSelected(optionList);
            }
        }
    });

    $("#add-option-btn").click(function (e) { 
        e.preventDefault();
        updateIsSelected(optionList);

        $("#option-wrapper").append(`
            <div class="row my-2">
                <div class="col-md-7">
                    <select class="form-control select2bs4 option-select option-price-input" width="100%" data-placeholder="Chọn một option">
                    </select>
                </div>

                <div class="input-group col-md-5">
                    <input type="text" name="text[]" class="form-control option-price-input" placeholder="Giá">
                    <div class="input-group-append option-price-input">
                        <a id="remove-option-btn" class="btn btn-sm btn-danger d-flex align-items-center">
                            <i class="fa-regular fa-circle-xmark fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>
            `);

        $('.select2bs4').select2({
            allowClear: true,
            theme: "bootstrap",
            closeOnSelect: true,
            width: '100%'
        });

        // Thêm các option vào select mới và lọc các tùy chọn đã chọn
        var newSelect = $("#option-wrapper").find(".option-select").last();
        optionList.forEach(function(option) {
            if(option.isSelected == 0){
                newSelect.append(`<option value="${option.id}">${option.text}</option>`);
            } else {
                newSelect.append(`<option disable value="${option.id}">${option.text}</option>`);
            }
        });
        newSelect.val("").trigger("change");
        updateIsSelected(optionList);
        updateOptions();

        // Xử lý sự kiện nhấn nút xóa bộ chọn option
        $(document).on("click", "#remove-option-btn", function() {
            $(this).closest('.row').remove();
            // Cập nhật lại các tùy chọn sau khi xóa
            updateOptions();
            updateIsSelected(optionList);
        });

        // Xử lý sự kiện thay đổi cho các select
        $(document).on('change', '.option-select', function() {
            updateOptions();
            updateIsSelected(optionList)
        });
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" form="modal-form" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
        );

    $("#modal_id").modal("show");

    $("#modal_submit_btn").click(function (){
        let email = $("#modal_email_input").val().trim();
        let user = $("#user-select").val();
        let active = $('#is-active-switch').is(':checked') ? 1 : 0;

        if(email == ""){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng điền email hợp lệ"
            });
            return;
        }

        if(user == null){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn hồ sơ"
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/accounts/new-account",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                email: email,
                userId: user,
                status: active
            }),
            success: function (response) {
                if(response.code == 1000){
                    Toast.fire({
                        icon: "success", 
                        title: "Thêm tài khoản thành công"
                    });
                    $("#modal_id").modal("hide");
                    dataTable.ajax.reload();
                } else if (response.code == 1067){ // Tham chiếu từ ErrorCode
                    Swal.fire({
                        title: `Hành động này sẽ vô hiệu hóa tất cả tài khoản khác liên kết với hồ sơ này?`,
                        showDenyButton: false,
                        showCancelButton: true,
                        confirmButtonText: "Đồng ý",
                        cancelButtonText: "Huỷ",
                    }).then((result) => {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {
                            $.ajax({
                                type: "POST",
                                url: "/api/accounts/new-account/confirm/",
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    email: email,
                                    userId: user,
                                    status: active
                                }),
                                success: function (res) {
                                    if (res.code == 1000) {
                                        Toast.fire({
                                            icon: "success", 
                                            title: "Thêm tài khoản thành công"
                                        });
                                    }
                                    $("#modal_id").modal("hide");
                                    dataTable.ajax.reload();
                                },
                                error: function (xhr, status, error) {
                                    Toast.fire({
                                        icon: "error",
                                        title: utils.getXHRInfo(xhr).message,
                                    });
                                },
                            });
                        }
                    });
                } 
                else {
                    Toast.fire({
                        icon: "warning",
                        title: utils.getErrorMessage(response.code)
                    })
                }
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
});



// Hàm để cập nhật các tùy chọn
function updateOptions() {
    // Lấy tất cả giá trị đã chọn
    var selectedValues = [];
    $('.option-select').each(function() {
        var val = $(this).val();
        if (val) {
            selectedValues.push(val);
        }
    });

    // Vô hiệu hóa các tùy chọn đã chọn
    $('.option-select').each(function() {
        var currentSelect = $(this);
        var currentVal = currentSelect.val();
        
        // Vô hiệu hóa các tùy chọn đã được chọn
        currentSelect.find('option').each(function() {
            if (selectedValues.includes($(this).val()) && $(this).val() !== currentVal) {
                $(this).attr('disabled', 'disabled');
            } else {
                $(this).removeAttr('disabled');
            }
        });
    });
}

function updateIsSelected(optionList) {
    // Đặt lại giá trị isSelected cho tất cả các option về 0
    optionList.forEach(function(option) {
        option.isSelected = 0;
    });

    // Lấy các giá trị đã chọn từ các phần tử .option-select
    $('.option-select').each(function() {
        var selectedValue = $(this).val();
        
        if (selectedValue) {
            // Tìm option tương ứng trong optionList và cập nhật isSelected
            var selectedOption = optionList.find(option => option.id == selectedValue);
            if (selectedOption) {
                selectedOption.isSelected = 1;
            }
        }
    });
}