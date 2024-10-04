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
            { orderable: false, targets: 5 }, // Vô hiệu hóa sort cho cột Thao tác (index 6)
            { className: "text-center", targets: 0 },
        ],
        ajax: {
            type: "GET",
            url: "/api/cars",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    var data = [];
                    var counter = 1;
                    res.data.forEach(function (car) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            id: car.id,
                            numPlate: car.numPlate,
                            color: car.color,
                            carDetail: car.carDetail,
                            createAt: car.createAt,
                            status: car.status,
                            plateType: car.plateType,
                            brand: car.model.brand,
                            model: car.model
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
                data: "numPlate",
                render: function (data, type, row) {
                    let html="";
                    html += `<center>${data}<br> `;

                    if(row.plateType.type.includes('xanh')){
                        html += `<span class="badge badge-info">&nbsp; ${row.plateType.type}</span><br>`
                    } else if(row.plateType.type.includes('trắng')) {
                        html += `<span class="badge badge-light">&nbsp; ${row.plateType.type}</span><br>`
                    } else if(row.plateType.type.includes('vàng')) {
                        html += `<span class="badge badge-primary">&nbsp; ${row.plateType.type}</span><br>`
                    } else if(row.plateType.type.includes('đỏ')) {
                        html += `<span class="badge badge-danger">&nbsp; ${row.plateType.type}</span><br>`
                    } else {
                        html += `&nbsp; ${row.plateType.type}<br>`
                    }
                    return html+'</center>';
                },
            },
            { data: null,
                render: function(data, type, row) {
                    let html = `<center>${row.brand.brand}<br>${row.model.model}</center>`;
                    return html;
                }
            },
            {
                data: "carDetail",
                render: function (data, type, row) {
                    let html = "";
                    if(row.color != null) {
                        html += `Màu xe: ${row.color}<br>`;
                    }

                    if (data != null) {
                        html += `Nội dung: ${data}`;
                    }
                    return html;
                },
            },
            {
                data: "status",
                render: function (data, type, row) {
                    if (data == 1 || data == 9999) {
                        return '<center><span class="badge badge-success"><i class="fa-solid fa-check"></i> Đang sử dụng</span></center>';
                    } else if (data == -1) {
                        return '<center><span class="badge badge-danger"><i class="fa-solid fa-xmark"></i>&nbsp; Ngưng sử dụng</span></center>';
                    }
                    return "";
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
                        html += ` <a class="btn btn-warning btn-sm" id="disableBtn" data-id="${data}">
                            <i class="fas fa-user-slash"></i></a>`;
                    }
                    if (row.status == -1) {
                        html += ` <a class="btn btn-success btn-sm" id="enableBtn" data-id="${data}">
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

$("#data-table").on("click", "#activateBtn", function () {
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

$("#new-car-btn").click(function () { 
    clear_modal();
    $("#modal_title").text("Thêm hồ sơ xe");
    $("#modal_body").append(`
        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_numplate_input">Biển kiểm soát</label>
                    <kbd id="modal_numplate_counter" class="mb-0 small">0/50</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_numplate_input" maxlength="50" placeholder="65A12345">
        </div>

        <div class="form-group">
            <label>Loại biển kiểm soát</label>
            <div class="form-group">
                <select id="plate-type-select" class="form-control select2bs4" style="width: 100%;">
                </select>
            </div>
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_color_input">Màu sơn/wrap</label>
                    <kbd id="modal_color_counter" class="mb-0 small">0/200</kbd>
                </div>
            </div>
            <input type="text" class="form-control" id="modal_color_input" maxlength="200" placeholder="Nhập mô tả màu sơn/wrap">
        </div>

        <div class="form-group">
            <div class="container mt-3 mb-0">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="mb-0" for="modal_cardetail_input">Mô tả chi tiết</label>
                    <kbd id="modal_cardetail_counter" class="mb-0 small">0/1000</kbd>
                </div>
            </div>
            <textarea wrap="soft" class="form-control" id="modal_cardetail_input" rows="3" maxlength="1000" placeholder="Mô tả chi tiết xe"></textarea>
        </div>

        <div class="form-group">
            <label>Hãng xe</label>
            <div class="form-group">
                <select id="brand-select" class="form-control select2bs4" style="width: 100%;">
                    <option disabled selected> Chọn hãng xe </option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>Mẫu xe</label>
            <div class="form-group">
                <select id="model-select" class="form-control select2bs4" style="width: 100%;">
                </select>
            </div>
        </div>
    `);

    var brandModelList = [];

    $.ajax({
        type: "GET",
        url: "/api/brands/fetch-model",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        success: function (response) {
            if(response.code == 1000) {
                brandModelList = response.data;
                $("#brand-select").empty();
                $("#brand-select").append(`<option disabled selected> Chọn hãng xe </option>`);
                $.each(response.data, function (idx, brand) { 
                    $("#brand-select").append(`<option value=${brand.id}> ${brand.brand} </option>`);
                });
            }
            else {
                Toast.fire({
                    icon: "warning",
                    title: "Lỗi lấy dữ liệu brand-model"
                });
                console.log(utils.getErrorMessage(response.code));
                $("#modal_id").modal("hide");
            }
        },
        error: function(xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr.message)
            });
            $("#modal_id").modal("hide");
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/plate-types",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ""
        },
        success: function (response) {
            if(response.code == 1000) {
                $("#plate-type-select").append(`<option disabled selected> Chọn loại biển kiểm soát </option>`);
                $.each(response.data, function (idx, plateType) { 
                    $("#plate-type-select").append(`<option value=${plateType.id}> ${plateType.type} </option>`);
                });
            }
            else {
                Toast.fire({
                    icon: "warning",
                    title: "Lỗi lấy dữ liệu plate-type"
                });
                console.log(utils.getErrorMessage(response.code));
                $("#modal_id").modal("hide");
            }
        },
        error: function(xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: utils.getXHRInfo(xhr.message)
            });
            $("#modal_id").modal("hide");
        }
    });

    $('#plate-type-select').select2({
        placeholder: "Chọn loại biển kiểm soát",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true
    });

    $('#brand-select').select2({
        placeholder: "Chọn hãng xe",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    $('#model-select').select2({
        placeholder: "Chọn mẫu xe",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true
    });

    $('#brand-select').on('change', function () {
        let id = $(this).val();
        console.log(id);
        
        const brand = brandModelList.find(item => item.id == id);

        if(brand) {
            $('#model-select').empty();
            $('#model-select').append(`<option disabled selected> Chọn mẫu xe </option>`);
            $.each(brand.models, function (idx, val) { 
                $('#model-select').append(`<option value"${val.id}"> ${val.model} </option>`);
            });
        } else {
            console.log("Error in getting model");
        }
        
    });

    $("#modal_footer").append(
        '<button type="button" class="btn btn-primary" id="modal_submit_btn"><i class="fa-solid fa-floppy-disk"></i> Thêm</button>'
        );
    
    utils.set_char_count("#modal_numplate_input", "#modal_numplate_counter");
    utils.set_char_count("#modal_color_input", "#modal_color_counter");
    utils.set_char_count("#modal_cardetail_input", "#modal_cardetail_counter");

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

